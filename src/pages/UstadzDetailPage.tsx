import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { KajianGrid } from '../components/KajianGrid';
import { UserIcon } from '../components/icons';
import { getSpeakerBySlug } from '../lib/data';

export function UstadzDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const speaker = slug ? getSpeakerBySlug(slug) : undefined;

  if (!speaker) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ustadz tidak ditemukan</h1>
        <Link to="/ustadz" className="btn-primary mt-6">
          Lihat Semua Ustadz
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title={speaker.name}
        description={`Seluruh kajian dari ${speaker.name}. ${speaker.kajian.length} kajian tersedia.`}
      />

      <div className="mb-8 flex items-center gap-5">
        <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg sm:h-32 sm:w-32">
          <UserIcon className="h-12 w-12 sm:h-16 sm:w-16" />
        </span>
        <div>
          <span className="text-sm font-semibold text-brand-primary dark:text-brand-accent">Ustadz</span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            {speaker.name}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{speaker.kajian.length} kajian</p>
        </div>
      </div>

      <KajianGrid items={speaker.kajian} pageSize={10} />
    </div>
  );
}
