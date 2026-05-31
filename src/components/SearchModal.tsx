import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { searchKajian } from '../lib/data';
import { Cover } from './Cover';
import { SearchIcon, CloseIcon } from './icons';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen realtime search with debounce. */
export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);

  const results = useMemo(
    () => (debounced.trim() ? searchKajian({ query: debounced }).slice(0, 12) : []),
    [debounced],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-8">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 mt-4 w-full max-w-2xl animate-fade-in rounded-2xl bg-white shadow-2xl dark:bg-slate-800 sm:mt-12">
        <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
          <SearchIcon className="h-5 w-5 text-slate-400" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, ustadz, atau kitab..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-slate-400"
          />
          <button onClick={onClose} aria-label="Tutup pencarian" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-2">
          {debounced.trim() && results.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Tidak ada hasil untuk "{debounced}".
            </p>
          )}
          {!debounced.trim() && (
            <p className="p-6 text-center text-sm text-slate-400">
              Mulai mengetik untuk mencari kajian.
            </p>
          )}
          {results.map((k) => (
            <Link
              key={k.id}
              to={`/kajian/${k.id}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <Cover src={k.cover} alt={k.title} className="h-12 w-12 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {k.title}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {k.speaker} · {k.book}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
