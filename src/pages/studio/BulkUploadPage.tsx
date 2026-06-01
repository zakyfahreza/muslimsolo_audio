import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Field';
import { Spinner } from '../../components/ui/Spinner';
import { Dropzone } from '../../components/studio/Dropzone';
import { FileAudioIcon, CheckIcon, TrashIcon, ClockIcon } from '../../components/icons';
import { listKitab, getKitab, nextNumber, saveKajian, newKajianId } from '../../services/contentRepo';
import { readAudioMeta, extractFileNumber } from '../../lib/audio';
import { uploadFile, buildKey } from '../../services/r2Service';
import { loadConfig } from '../../services/config';
import { generateCoverDataUrl } from '../../lib/cover';
import { useUploadStore, type UploadItem, type UploadStatus } from '../../store/uploadStore';
import { toast } from '../../store/toastStore';
import { cn } from '../../lib/utils';
import type { Kajian } from '../../types';

const statusLabel: Record<UploadStatus, string> = {
  queued: 'Antre',
  reading: 'Membaca…',
  uploading: 'Mengupload…',
  done: 'Selesai',
  error: 'Gagal',
};

export function BulkUploadPage() {
  const navigate = useNavigate();
  const items = useUploadStore((s) => s.items);
  const addItems = useUploadStore((s) => s.addItems);
  const updateItem = useUploadStore((s) => s.updateItem);
  const removeItem = useUploadStore((s) => s.removeItem);
  const clear = useUploadStore((s) => s.clear);

  const kitab = listKitab();
  const [kitabId, setKitabId] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [busy, setBusy] = useState(false);

  const addFiles = async (files: File[]) => {
    if (!kitabId) {
      toast.error('Pilih kitab tujuan terlebih dahulu.');
      return;
    }
    // Sort by leading number in filename, fallback to name.
    const sorted = [...files].sort((a, b) => {
      const na = extractFileNumber(a.name);
      const nb = extractFileNumber(b.name);
      if (na != null && nb != null) return na - nb;
      return a.name.localeCompare(b.name);
    });

    const startNumber = nextNumber(kitabId) + items.length;
    const newItems: UploadItem[] = sorted.map((file, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      file,
      number: startNumber + i,
      title: '',
      duration: '',
      durationSeconds: 0,
      status: 'queued',
      progress: 0,
    }));
    addItems(newItems);

    // Read durations in the background.
    for (const it of newItems) {
      try {
        const meta = await readAudioMeta(it.file);
        updateItem(it.id, { duration: meta.duration, durationSeconds: meta.seconds });
      } catch {
        updateItem(it.id, { duration: '0:00' });
      }
    }
  };

  const publishAll = async () => {
    const k = getKitab(kitabId);
    if (!k) {
      toast.error('Pilih kitab tujuan.');
      return;
    }
    if (!speaker.trim()) {
      toast.error('Isi nama ustadz untuk seluruh kajian.');
      return;
    }
    if (items.length === 0) return;

    setBusy(true);
    const config = loadConfig();
    let success = 0;

    for (const it of items) {
      if (it.status === 'done') {
        success++;
        continue;
      }
      try {
        // Duration (if not yet read).
        let duration = it.duration;
        if (!duration) {
          updateItem(it.id, { status: 'reading' });
          const meta = await readAudioMeta(it.file);
          duration = meta.duration;
          updateItem(it.id, { duration, durationSeconds: meta.seconds });
        }

        // Upload.
        updateItem(it.id, { status: 'uploading', progress: 0 });
        const key = buildKey(k.slug, it.file.name);
        const result = await uploadFile(config, key, it.file, (p) =>
          updateItem(it.id, { progress: p }),
        );

        // Compose + save kajian.
        const title = it.title.trim() || `${k.title} #${it.number}`;
        const cover =
          k.cover ||
          generateCoverDataUrl({
            kitab: k.title,
            speaker,
            number: it.number,
            seed: k.coverSeed || k.slug,
          });
        const record: Kajian = {
          id: newKajianId(k.slug, it.number),
          kitabId: k.id,
          number: it.number,
          title,
          speaker: speaker.trim(),
          book: k.title,
          category: k.category,
          description: '',
          cover,
          audioUrl: result.publicUrl,
          audioKey: result.key,
          duration: duration || '0:00',
          publishedAt: new Date().toISOString(),
          transcript: '',
          status: 'published',
        };
        await saveKajian(record);
        updateItem(it.id, { status: 'done', progress: 100, publicUrl: result.publicUrl });
        success++;
      } catch (e) {
        updateItem(it.id, { status: 'error', error: (e as Error).message });
      }
    }

    setBusy(false);
    if (success > 0) {
      toast.success(`${success} kajian berhasil dipublish.`);
    }
  };

  const allDone = items.length > 0 && items.every((i) => i.status === 'done');

  return (
    <div className="space-y-6">
      <Seo title="Bulk Upload" />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Bulk Upload</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Upload banyak file sekaligus. Nomor kajian dibuat otomatis berurutan dari nama file
          (01.mp3, 02.mp3, ...).
        </p>
      </div>

      {/* Target settings */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:grid-cols-2">
        <Select label="Kitab tujuan" value={kitabId} onChange={(e) => setKitabId(e.target.value)}>
          <option value="">Pilih kitab…</option>
          {kitab.map((k) => (
            <option key={k.id} value={k.id}>
              {k.title}
            </option>
          ))}
        </Select>
        <Input
          label="Nama Ustadz"
          hint="berlaku untuk semua file"
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          placeholder="mis. Ustadz Fulan"
        />
      </div>

      <Dropzone
        multiple
        onFiles={addFiles}
        title="Tarik & lepas banyak file MP3"
        subtitle="atau klik untuk memilih beberapa file sekaligus"
      />

      {/* Queue */}
      {items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {items.length} file dalam antrean
            </p>
            <button
              onClick={clear}
              disabled={busy}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 disabled:opacity-50"
            >
              Bersihkan
            </button>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-5 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-primary/10 text-xs font-bold text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
                  #{it.number}
                </span>
                <span className="text-slate-300 dark:text-slate-600">
                  <FileAudioIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    value={it.title}
                    onChange={(e) => updateItem(it.id, { title: e.target.value })}
                    placeholder={it.file.name}
                    disabled={busy}
                    className="w-full truncate bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-white"
                  />
                  {(it.status === 'uploading' || it.status === 'done') && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-brand-primary transition-all dark:bg-brand-accent"
                        style={{ width: `${it.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <span className="hidden items-center gap-1 text-xs tabular-nums text-slate-400 sm:flex">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {it.duration || '—'}
                </span>
                <span
                  className={cn(
                    'inline-flex w-24 items-center justify-end gap-1 text-xs font-semibold',
                    it.status === 'done' && 'text-emerald-600',
                    it.status === 'error' && 'text-rose-500',
                    it.status === 'uploading' && 'text-brand-primary dark:text-brand-accent',
                    (it.status === 'queued' || it.status === 'reading') && 'text-slate-400',
                  )}
                >
                  {it.status === 'uploading' && <Spinner className="h-3 w-3" />}
                  {it.status === 'done' && <CheckIcon className="h-3.5 w-3.5" />}
                  {it.status === 'uploading' ? `${it.progress}%` : statusLabel[it.status]}
                </span>
                {!busy && it.status !== 'done' && (
                  <button
                    onClick={() => removeItem(it.id)}
                    aria-label="Hapus dari antrean"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {items.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">
          {allDone ? (
            <Button onClick={() => navigate('/studio/kajian')} icon={<CheckIcon className="h-4 w-4" />}>
              Lihat Kajian
            </Button>
          ) : (
            <Button onClick={publishAll} disabled={busy}>
              {busy && <Spinner />}
              Publish Semua ({items.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
