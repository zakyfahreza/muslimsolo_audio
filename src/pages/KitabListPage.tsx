import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { BookIcon, ClockIcon } from '../components/icons';
import { getKitabStats } from '../lib/data';
import { formatTime } from '../lib/utils';

export function KitabListPage() {
  const books = getKitabStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title="Daftar Kitab"
        description="Jelajahi kajian berdasarkan kitab. Ikuti pembahasan setiap kitab secara berurutan."
      />

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">Kitab</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{books.length} kitab dalam koleksi</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <Link
            key={book.slug}
            to={`/kitab/${book.slug}`}
            className="card group overflow-hidden hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary p-4 text-white">
              <BookIcon className="h-6 w-6 text-brand-accent" />
              <h3 className="mt-2 line-clamp-3 text-base font-extrabold leading-tight drop-shadow">
                {book.title}
              </h3>
            </div>
            <div className="flex items-center justify-between p-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{book.kajianCount} kajian</span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {formatTime(book.totalSeconds)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
