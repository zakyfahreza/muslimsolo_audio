import { Textarea } from '../../ui/Field';
import type { StepProps } from './types';

export function Step4Transcript({ data, update }: StepProps) {
  const words = data.transcript.trim() ? data.transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transkrip</h2>
        <span className="text-xs text-slate-400">{words} kata</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Opsional. Transkrip membantu pencarian dan dapat diunduh sebagai PDF oleh pendengar.
      </p>
      <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-200">Tips judul & daftar isi</p>
        <p className="mt-1">
          Awali baris dengan <code className="rounded bg-slate-200 px-1 dark:bg-white/10">#&nbsp;</code>{' '}
          untuk <strong>judul</strong>, atau{' '}
          <code className="rounded bg-slate-200 px-1 dark:bg-white/10">##&nbsp;</code> untuk{' '}
          <strong>sub-judul</strong>. Daftar isi akan dibuat otomatis di atas transkrip.
        </p>
      </div>
      <Textarea
        rows={14}
        value={data.transcript}
        onChange={(e) => update({ transcript: e.target.value })}
        placeholder={'Contoh:\n# Muqaddimah\nIsi paragraf...\n\n## Penjelasan Hadits\nIsi paragraf...'}
        className="font-[15px] leading-7"
      />
    </div>
  );
}
