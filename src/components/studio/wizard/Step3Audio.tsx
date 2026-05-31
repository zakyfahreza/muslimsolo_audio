import { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { AudioPreview } from '../AudioPreview';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';
import { FileAudioIcon, CheckIcon, ClockIcon, TrashIcon } from '../../icons';
import { readAudioMeta } from '../../../lib/audio';
import { uploadFile, buildKey } from '../../../services/r2Service';
import { getKitab } from '../../../services/contentRepo';
import { loadConfig } from '../../../services/config';
import { toast } from '../../../store/toastStore';
import type { StepProps } from './types';

export function Step3Audio({ data, update }: StepProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const kitab = getKitab(data.kitabId);

  const handleFile = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // 1. Read duration instantly in the browser.
    const localUrl = URL.createObjectURL(file);
    update({ audioFile: file, localAudioUrl: localUrl });
    try {
      const meta = await readAudioMeta(file);
      update({ duration: meta.duration, durationSeconds: meta.seconds });
    } catch {
      toast.error('Tidak dapat membaca durasi audio.');
    }

    // 2. Upload to R2 (or mock).
    setUploading(true);
    setProgress(0);
    try {
      const config = loadConfig();
      const folder = kitab?.slug ?? 'kajian';
      const key = buildKey(folder, file.name);
      const result = await uploadFile(config, key, file, setProgress);
      update({ audioUrl: result.publicUrl, audioKey: result.key });
      toast.success('Audio berhasil diupload.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    update({
      audioFile: null,
      audioUrl: '',
      audioKey: '',
      localAudioUrl: '',
      duration: '',
      durationSeconds: 0,
    });
    setProgress(0);
  };

  const hasAudio = Boolean(data.localAudioUrl || data.audioUrl);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Audio</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Pilih file MP3. Durasi dibaca otomatis dan file langsung diupload ke penyimpanan. Anda tidak
        perlu menyalin URL.
      </p>

      {!hasAudio ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
              <FileAudioIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {data.audioFile?.name ?? data.audioKey ?? 'Audio'}
              </p>
              <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ClockIcon className="h-3.5 w-3.5" />
                {data.duration || '—'}
                {uploading ? (
                  <span className="inline-flex items-center gap-1 text-brand-primary dark:text-brand-accent">
                    <Spinner className="h-3 w-3" /> {progress}%
                  </span>
                ) : data.audioUrl ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckIcon className="h-3.5 w-3.5" /> Terupload
                  </span>
                ) : null}
              </p>
            </div>
            {!uploading && (
              <button
                onClick={reset}
                aria-label="Hapus audio"
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {uploading && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-brand-primary transition-all dark:bg-brand-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Preview */}
          {(data.localAudioUrl || data.audioUrl) && (
            <AudioPreview src={data.localAudioUrl || data.audioUrl} title="Preview sebelum publish" />
          )}

          <Button variant="ghost" size="sm" onClick={reset} disabled={uploading}>
            Ganti file
          </Button>
        </div>
      )}
    </div>
  );
}
