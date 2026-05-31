import { Link, useParams } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BookIcon, PlusIcon, ClockIcon, EditIcon } from '../../components/icons';
import { getKitab, listKajianByKitab } from '../../services/contentRepo';
import { durationToSeconds, formatTime } from '../../lib/utils';

export function StudioKitabDetailPage() {
  const { kitabId } = useParams<{ kitabId: string }>();
  const kitab = kitabId ? getKitab(kitabId) : undefined;

  if (!kitab) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Kitab tidak ditemukan</h1>
        <Link to="/studio/kitab" className="mt-4 inline-block text-brand-primary dark:text-brand-accent">
          Kembali ke daftar kitab
        </Link>
      </div>
    );
  }

  const kajian = listKajianByKitab(kitab.id);
  const total = kajian.reduce((acc, k) => acc + durationToSeconds(k.duration), 0);

  return (
    <div className="space-y-6">
      <Seo title={kitab.title} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow">
            <BookIcon className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{kitab.title}</h1>
            <p className="mt-1 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>{kajian.length} kajian</span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {formatTime(total)}
              </span>
            </p>
          </div>
        </div>
        <Link to={`/studio/kajian/baru?kitab=${kitab.id}`}>
          <Button icon={<PlusIcon className="h-4 w-4" />}>Tambah Kajian</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {kajian.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">
            Belum ada kajian di kitab ini.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {kajian.map((k) => (
              <li
                key={k.id}
                className="flex items-center gap-4 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-primary/10 text-sm font-bold text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
                  #{k.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {k.title}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{k.speaker}</p>
                </div>
                <span className="hidden text-xs tabular-nums text-slate-400 sm:block">
                  {k.duration}
                </span>
                <StatusBadge status={k.status} />
                <Link
                  to={`/studio/kajian/${k.id}/edit`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-primary dark:hover:bg-white/10"
                  aria-label="Edit"
                >
                  <EditIcon className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
