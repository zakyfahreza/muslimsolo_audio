import { useEffect, useState } from 'react';
import { AudioPreview } from '../AudioPreview';
import { generateCoverDataUrl } from '../../../lib/cover';
import { getKitab } from '../../../services/contentRepo';
import { cn } from '../../../lib/utils';
import type { StepProps } from './types';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2">
      <span className="w-28 shrink-0 text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{value || '—'}</span>
    </div>
  );
}

export function Step5Preview({ data, update }: StepProps) {
  const kitab = getKitab(data.kitabId);
  const [coverPreview, setCoverPreview] = useState(data.cover);

  // Auto-generate a cover preview when none was provided.
  useEffect(() => {
    if (data.cover) {
      setCoverPreview(data.cover);
      return;
    }
    if (kitab?.cover) {
      // Inherit the kitab's cover.
      setCoverPreview(kitab.cover);
      return;
    }
    if (kitab) {
      const url = generateCoverDataUrl({
        kitab: kitab.title,
        speaker: data.speaker || 'Ustadz',
        number: data.number,
        seed: kitab.coverSeed || kitab.slug,
      });
      setCoverPreview(url);
    }
  }, [data.cover, data.speaker, data.number, kitab]);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preview & Publish</h2>

      <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
        <div>
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover"
              className="aspect-square w-full rounded-2xl object-cover shadow-md"
            />
          )}
          {!data.cover && (
            <p className="mt-2 text-center text-xs text-slate-400">
              {kitab?.cover ? 'Cover dari kitab' : 'Cover dibuat otomatis'}
            </p>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          <Row label="Judul" value={data.title} />
          <Row label="Kitab" value={kitab?.title} />
          <Row label="Nomor" value={`#${data.number}`} />
          <Row label="Ustadz" value={data.speaker} />
          <Row label="Kategori" value={data.category} />
          <Row label="Durasi" value={data.duration} />
          <Row label="Audio" value={data.audioUrl ? 'Siap' : 'Belum diupload'} />
          <Row
            label="Transkrip"
            value={data.transcript ? `${data.transcript.trim().split(/\s+/).length} kata` : 'Kosong'}
          />
        </div>
      </div>

      {(data.localAudioUrl || data.audioUrl) && (
        <AudioPreview src={data.localAudioUrl || data.audioUrl} />
      )}

      {/* Status selector */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Status publikasi
        </p>
        <div className="flex gap-2">
          {(['published', 'draft'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ status: s })}
              className={cn(
                'flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition',
                data.status === s
                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary dark:text-brand-accent'
                  : 'border-slate-200 text-slate-500 dark:border-white/10',
              )}
            >
              {s === 'published' ? 'Publish sekarang' : 'Simpan sebagai draft'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
