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
      <Textarea
        rows={14}
        value={data.transcript}
        onChange={(e) => update({ transcript: e.target.value })}
        placeholder="Tempel atau ketik transkrip kajian di sini..."
        className="font-[15px] leading-7"
      />
    </div>
  );
}
