import { useState } from 'react';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { hasPendingChanges, resetOverlay } from '../../services/contentRepo';
import { toast } from '../../store/toastStore';
import { cn } from '../../lib/utils';

export function SettingsPage() {
  const config = useAuthStore((s) => s.config);
  const updateConfig = useAuthStore((s) => s.updateConfig);
  const user = useAuthStore((s) => s.user);

  const [draft, setDraft] = useState(config);
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    updateConfig(draft);
    toast.success('Pengaturan disimpan.');
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
        <p className="text-xs text-slate-400">
          Login saat ini: <strong>{user?.login ?? 'demo'}</strong>. Untuk mode live, masuk dengan
          token GitHub yang memiliki izin Contents: Read & Write.
        </p>
      </section>

      {/* R2 */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
        <h2 className="font-bold text-slate-900 dark:text-white">Cloudflare R2</h2>
        <Input
          label="URL Worker (presign)"
          hint="endpoint upload"
          value={draft.workerUrl}
          onChange={(e) => setDraft({ ...draft, workerUrl: e.target.value })}
          placeholder="https://r2-presign.contoh.workers.dev"
        />
        <Input
          label="Base URL Audio Publik"
          value={draft.audioPublicBase}
          onChange={(e) => setDraft({ ...draft, audioPublicBase: e.target.value })}
          placeholder="https://audio.muslimsolo.id"
        />
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
