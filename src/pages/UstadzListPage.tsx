import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { UserIcon, BookIcon } from '../components/icons';
import { getSpeakers } from '../lib/data';

export function UstadzListPage() {
  const speakers = getSpeakers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title="Daftar Ustadz"
        description="Jelajahi kajian berdasarkan ustadz. Temukan kajian favorit dari ustadz pilihan Anda."
      />

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">Ustadz</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {speakers.length} ustadz dalam koleksi
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {speakers.map((speaker) => (
          <Link
            key={speaker.slug}
            to={`/ustadz/${speaker.slug}`}
            className="card flex items-center gap-4 p-4 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow">
              <UserIcon className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-slate-900 dark:text-white">{speaker.name}</h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {speaker.count} kajian
              </p>
              <p className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-slate-400">
                <BookIcon className="h-3.5 w-3.5 shrink-0" />
                {speaker.books.length} kitab
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
