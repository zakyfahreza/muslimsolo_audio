import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { KajianGrid } from '../components/KajianGrid';
import { BookIcon, ClockIcon } from '../components/icons';
import { getBookKajianBySlug } from '../lib/data';
import { durationToSeconds, formatTime } from '../lib/utils';

export function KitabDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getBookKajianBySlug(slug) : undefined;

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kitab tidak ditemukan</h1>
        <Link to="/kitab" className="btn-primary mt-6">
          Lihat Semua Kitab
        </Link>
      </div>
    );
  }

  const { kitab, kajian } = data;
  const totalSeconds = kajian.reduce((acc, k) => acc + durationToSeconds(k.duration), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo title={kitab.title} description={kitab.description ?? `Seluruh kajian dari kitab ${kitab.title}.`} />

      <div className="mb-8 flex items-center gap-5">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg sm:h-32 sm:w-32">
          <BookIcon className="h-12 w-12" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary dark:text-brand-accent">
            <BookIcon className="h-4 w-4" /> Kitab
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            {kitab.title}
          </h1>
          <p className="mt-1 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span>{kajian.length} kajian</span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {formatTime(totalSeconds)}
            </span>
          </p>
          {kitab.description && (
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {kitab.description}
            </p>
          )}
        </div>
      </div>

      <KajianGrid items={kajian} pageSize={10} />
    </div>
  );
}
