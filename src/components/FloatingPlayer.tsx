import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { Cover } from './Cover';
import { SeekBar } from './SeekBar';
import { SpeedControl } from './SpeedControl';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon } from './icons';
import { formatTime } from '../lib/utils';

/**
 * Spotify-style player docked to the bottom of the viewport. Persists across
 * route changes because it reads from the global player store.
 */
export function FloatingPlayer() {
  const current = usePlayerStore((s) => s.current());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);

  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/95">
      {/* Mobile-only thin progress line */}
      <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700 sm:hidden">
        <div
          className="h-full bg-brand-primary dark:bg-brand-accent"
          style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
        {/* Track info */}
        <Link to={`/kajian/${current.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:w-64">
          <Cover
            src={current.cover}
            alt={current.title}
            className="h-12 w-12 shrink-0 rounded-lg shadow"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {current.title}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{current.speaker}</p>
          </div>
        </Link>

        {/* Center controls + seek (desktop) */}
        <div className="hidden flex-1 flex-col items-center gap-1 sm:flex">
          <div className="flex items-center gap-4">
            <button
              onClick={previous}
              aria-label="Sebelumnya"
              className="text-slate-600 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-accent"
            >
              <PrevIcon className="h-5 w-5" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
              className="grid h-10 w-10 place-items-center rounded-full bg-brand-primary text-white shadow-lg transition hover:scale-105 dark:bg-brand-accent dark:text-slate-900"
            >
              {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={next}
              aria-label="Berikutnya"
              className="text-slate-600 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-accent"
            >
              <NextIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex w-full max-w-xl items-center gap-2">
            <SeekBar showTime />
          </div>
        </div>

        {/* Right controls */}
        <div className="hidden items-center gap-2 sm:flex sm:w-64 sm:justify-end">
          <SpeedControl compact />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 sm:hidden">
          <SpeedControl compact />
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Jeda' : 'Putar'}
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-primary text-white shadow dark:bg-brand-accent dark:text-slate-900"
          >
            {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </button>
          <button
            onClick={next}
            aria-label="Berikutnya"
            className="grid h-10 w-10 place-items-center text-slate-600 dark:text-slate-300"
          >
            <NextIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <span className="sr-only">{formatTime(currentTime)}</span>
    </div>
  );
}
