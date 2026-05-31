import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { cn } from '../../lib/utils';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  // Build a compact page list with ellipses.
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  const btn =
    'grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-semibold transition disabled:opacity-40';

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        className={cn(btn, 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10')}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Sebelumnya"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              btn,
              p === page
                ? 'bg-brand-primary text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        className={cn(btn, 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10')}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Berikutnya"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
