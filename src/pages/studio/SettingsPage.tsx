import { useState } from 'react';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { CheckIcon } from '../../components/icons';
import { useAuthStore } from '../../store/authStore';
import { hasPendingChanges, resetOverlay } from '../../services/contentRepo';
import { hasGithubToken } from '../../services/authService';
import { testGithub } from '../../services/githubService';
import { testWorker } from '../../services/r2Service';
import { toast } from '../../store/toastStore';
import { cn } from '../../lib/utils';

export function SettingsPage() {
  const config = useAuthStore((s) => s.config);
  const updateConfig = useAuthStore((s) => s.updateConfig);
  const githubLogin = useAuthStore((s) => s.githubLogin);
  const connectGithub = useAuthStore((s) => s.connectGithub);
  const disconnectGithub = useAuthStore((s) => s.disconnectGithub);

  const [draft, setDraft] = useState(config);
  const [confirmReset, setConfirmReset] = useState(false);
  const [testingGh, setTestingGh] = useState(false);
  const [testingWk, setTestingWk] = useState(false);
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);

  const githubConnected = hasGithubToken();

  const save = () => {
    updateConfig(draft);
    toast.success('Pengaturan disimpan.');
  };

  const connect = async () => {
    if (!token.trim()) {
      toast.error('Tempel GitHub token terlebih dahulu.');
      return;
    }
    setConnecting(true);
    try {
      await connectGithub(token.trim());
      setToken('');
      toast.success('GitHub terhubung dan token tersimpan.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    disconnectGithub();
    toast.success('Token GitHub dihapus.');
  };

  const runTestGithub = async () => {
    updateConfig(draft); // ensure latest values are used
    setTestingGh(true);
    try {
      await testGithub(draft);
      toast.success('Koneksi GitHub berhasil. Repo & token valid.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setTestingGh(false);
    }
  };

  const runTestWorker = async () => {
    updateConfig(draft);
    setTestingWk(true);
    try {
      await testWorker(draft);
      toast.success('Koneksi Worker berhasil. Upload siap digunakan.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setTestingWk(false);
    }
  };

  const doReset = () => {
    resetOverlay();
    setConfirmReset(false);
    toast.success('Perubahan lokal direset.');
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Seo title="Pengaturan" />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pengaturan</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Konfigurasi koneksi GitHub & Cloudflare R2.
        </p>
      </div>

      {/* Live-mode readiness warning */}
      {!draft.mockMode && !githubConnected && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <strong>Mode Live aktif tapi GitHub belum terhubung.</strong> Menyimpan/mengedit kajian
          akan gagal. Tempel GitHub Personal Access Token (izin Contents: Read &amp; Write) di bagian
          GitHub di bawah, lalu klik Hubungkan.
        </div>
      )}

      {/* Mode */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
        <h2 className="font-bold text-slate-900 dark:text-white">Mode Operasi</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Mode demo menyimpan perubahan di browser saja. Mode live menyimpan ke GitHub & mengupload
          ke R2 melalui worker.
        </p>
        <div className="mt-4 flex gap-2">
          {[
            { v: true, label: 'Demo (lokal)' },
            { v: false, label: 'Live (R2 + GitHub)' },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              onClick={() => setDraft({ ...draft, mockMode: opt.v })}
              className={cn(
                'flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition',
                draft.mockMode === opt.v
                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary dark:text-brand-accent'
                  : 'border-slate-200 text-slate-500 dark:border-white/10',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* GitHub */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
        <h2 className="font-bold text-slate-900 dark:text-white">GitHub</h2>

        {/* Token connection (saved once, reused for every save) */}
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
          {githubConnected ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CheckIcon className="h-4 w-4" />
                Terhubung sebagai <strong>{githubLogin ?? 'GitHub'}</strong>
              </p>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Putuskan
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                label="GitHub Personal Access Token"
                hint="disimpan sekali, dipakai terus"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_..."
              />
              <p className="text-xs text-slate-400">
                Gunakan fine-grained token dengan izin <strong>Contents: Read &amp; Write</strong> pada
                repo konten. Token hanya disimpan di browser ini.
              </p>
              <Button size="sm" onClick={connect} disabled={connecting}>
                {connecting && <Spinner />}
                Hubungkan GitHub
              </Button>
            </div>
          )}
        </div>

        <Input
          label="Repository"
          hint="owner/nama-repo"
          value={draft.githubRepo}
          onChange={(e) => setDraft({ ...draft, githubRepo: e.target.value })}
          placeholder="muslimsolo/muslimsolo_audio"
        />
        <Input
          label="Branch"
          value={draft.githubBranch}
          onChange={(e) => setDraft({ ...draft, githubBranch: e.target.value })}
          placeholder="main"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={runTestGithub}
          disabled={testingGh}
          icon={testingGh ? <Spinner /> : <CheckIcon className="h-4 w-4" />}
        >
          Test Koneksi GitHub
        </Button>
      </section>

      {/* R2 */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
        <h2 className="font-bold text-slate-900 dark:text-white">Cloudflare R2</h2>
        <Input
          label="URL Worker (presign)"
          hint="endpoint upload"
          value={draft.workerUrl}
          onChange={(e) => setDraft({ ...draft, workerUrl: e.target.value })}
          placeholder="https://nama-worker.subdomain.workers.dev"
        />
        <Input
          label="Base URL Audio Publik"
          value={draft.audioPublicBase}
          onChange={(e) => setDraft({ ...draft, audioPublicBase: e.target.value })}
          placeholder="https://pub-xxxx.r2.dev"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={runTestWorker}
          disabled={testingWk}
          icon={testingWk ? <Spinner /> : <CheckIcon className="h-4 w-4" />}
        >
          Test Koneksi Worker
        </Button>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setConfirmReset(true)} disabled={!hasPendingChanges()}>
          Reset perubahan lokal
        </Button>
        <Button onClick={save}>Simpan Pengaturan</Button>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset perubahan lokal?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={doReset}>
              Reset
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Semua kajian/kitab yang ditambah atau diedit secara lokal (belum tersimpan ke GitHub) akan
          dihapus dan kembali ke konten bawaan. Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}
