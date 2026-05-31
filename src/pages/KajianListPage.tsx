import { useMemo, useState } from 'react';
import { Seo } from '../components/Seo';
import { KajianGrid } from '../components/KajianGrid';
import { CategoryFilter } from '../components/CategoryFilter';
import { SearchIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { searchKajian } from '../lib/data';
import type { Category } from '../types';

export function KajianListPage() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const debounced = useDebounce(query, 300);

  const results = useMemo(
    () => searchKajian({ query: debounced, categories }),
    [debounced, categories],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title="Kajian Terbaru"
        description="Jelajahi seluruh koleksi kajian Islam. Cari berdasarkan judul, ustadz, atau kitab dan filter berdasarkan kategori."
      />

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          Semua Kajian
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {results.length} kajian tersedia
        </p>
      </header>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, ustadz, atau kitab..."
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 dark:border-white/10 dark:bg-slate-800"
          />
        </div>
        <CategoryFilter selected={categories} onChange={setCategories} />
      </div>

      <KajianGrid items={results} pageSize={10} emptyMessage="Tidak ada kajian yang cocok dengan pencarian Anda." />
    </div>
  );
}
