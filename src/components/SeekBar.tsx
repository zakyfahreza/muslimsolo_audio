import { usePlayerStore } from '../store/playerStore';
import { formatTime } from '../lib/utils';

interface SeekBarProps {
  showTime?: boolean;
  className?: string;
}

/** Interactive progress / seek bar bound to the global player store. */
export function SeekBar({ showTime = false, className = '' }: SeekBarProps) {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const requestSeek = usePlayerStore((s) => s.requestSeek);

  const max = duration || 0;
  const pct = max > 0 ? (currentTime / max) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showTime && (
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {formatTime(currentTime)}
        </span>
      )}
      <div className="group relative flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-300 dark:bg-slate-600">
          <div
            className="h-full rounded-full bg-brand-primary transition-[width] duration-150 dark:bg-brand-accent"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={max || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => requestSeek(Number(e.target.value))}
          aria-label="Geser posisi audio"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-brand-accent"
          style={{ left: `${pct}%` }}
        />
      </div>
      {showTime && (
        <span className="w-10 shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {formatTime(max)}
        </span>
      )}
    </div>
  );
}
