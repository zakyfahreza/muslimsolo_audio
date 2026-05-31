import { usePlayerStore, PLAYBACK_SPEEDS, type PlaybackSpeed } from '../store/playerStore';
import { cn } from '../lib/utils';

/** Cycles / selects playback speed. Compact button variant for the bar. */
export function SpeedControl({ compact = false }: { compact?: boolean }) {
  const speed = usePlayerStore((s) => s.speed);
  const setSpeed = usePlayerStore((s) => s.setSpeed);

  if (compact) {
    const cycle = () => {
      const idx = PLAYBACK_SPEEDS.indexOf(speed);
      const nextSpeed = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
      setSpeed(nextSpeed);
    };
    return (
      <button
        onClick={cycle}
        aria-label="Ubah kecepatan pemutaran"
        className="rounded-full px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10"
      >
        {speed}x
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-700/50">
      {PLAYBACK_SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => setSpeed(s as PlaybackSpeed)}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
            speed === s
              ? 'bg-brand-primary text-white shadow dark:bg-brand-accent dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10',
          )}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
