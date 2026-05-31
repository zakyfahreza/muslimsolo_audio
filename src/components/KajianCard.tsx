import { Link } from 'react-router-dom';
import type { Kajian } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { Cover } from './Cover';
import { Equalizer } from './Equalizer';
import { PlayIcon, PauseIcon, HeartIcon, ClockIcon } from './icons';
import { cn } from '../lib/utils';

interface KajianCardProps {
  kajian: Kajian;
  /** Optional play queue this card belongs to (defaults to just itself). */
  queue?: Kajian[];
}

export function KajianCard({ kajian, queue }: KajianCardProps) {
  const playKajian = usePlayerStore((s) => s.playKajian);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentId = usePlayerStore((s) => s.current()?.id);
  const isFavorite = useLibraryStore((s) => s.favorites.includes(kajian.id));
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  const isActive = currentId === kajian.id;
  const isThisPlaying = isActive && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isActive) togglePlay();
    else playKajian(kajian, queue);
  };

  return (
    <Link
      to={`/kajian/${kajian.id}`}
      className="card group flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/10"
    >
      <div className="relative aspect-square overflow-hidden">
        <Cover
          src={kajian.cover}
          alt={kajian.title}
          fallbackText={kajian.book}
          fallbackBadge={kajian.number ? `#${kajian.number}` : undefined}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <button
          onClick={handlePlay}
          aria-label={isThisPlaying ? 'Jeda' : 'Putar'}
          className={cn(
            'absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full bg-brand-accent text-slate-900 shadow-lg transition-all duration-300',
            'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
            isActive && 'translate-y-0 opacity-100',
          )}
        >
          {isThisPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
        </button>
        <span className="absolute left-3 top-3">
          <span className="chip bg-black/45 text-white backdrop-blur-sm">{kajian.category}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 dark:text-white">
            {kajian.title}
          </h3>
          {isActive && (
            <span className="mt-1 text-brand-primary dark:text-brand-accent">
              <Equalizer />
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm text-brand-primary dark:text-brand-accent">
          {kajian.speaker}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{kajian.book}</p>

        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {kajian.duration}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(kajian.id);
            }}
            aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            className={cn(
              'rounded-full p-1.5 transition-colors hover:bg-slate-200/70 dark:hover:bg-white/10',
              isFavorite ? 'text-rose-500' : 'text-slate-400',
            )}
          >
            <HeartIcon className="h-4 w-4" filled={isFavorite} />
          </button>
        </div>
      </div>
    </Link>
  );
}
