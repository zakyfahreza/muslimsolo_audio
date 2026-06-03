import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { StatCard } from '../../components/studio/StatCard';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  BookIcon,
  PlayIcon,
  UserIcon,
  ClockIcon,
  PlusIcon,
  UploadIcon,
} from '../../components/icons';
import { listKajian, listKitab } from '../../services/contentRepo';
import { durationToSeconds, formatTime, formatDate } from '../../lib/utils';

export function DashboardPage() {
  const kajian = listKajian();
  const kitab = listKitab();
  const speakers = new Set(kajian.map((k) => k.speaker));
  const totalSeconds = kajian.reduce((acc, k) => acc + durationToSeconds(k.duration), 0);
  const totalHours = Math.round(totalSeconds / 3600);

  const recent = kajian.slice(0, 6);

  return (
    <div className="space-y-8">
      <Seo title="Dashboard Studio" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Ringkasan koleksi audio kajian Anda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/studio/kajian/baru">
            <Button icon={<PlusIcon className="h-4 w-4" />}>Tambah Kajian</Button>
          </Link>
          <Link to="/studio/upload">
            <Button variant="outline" icon={<UploadIcon className="h-4 w-4" />}>
              Bulk Upload
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Kitab" value={kitab.length} accent="teal" icon={<BookIcon className="h-6 w-6" />} />
        <StatCard label="Kajian" value={kajian.length} accent="amber" icon={<PlayIcon className="h-6 w-6" />} />
        <StatCard label="Ustadz" value={speakers.size} accent="sky" icon={<UserIcon className="h-6 w-6" />} />
        <StatCard
          label="Jam Audio"
          value={`${totalHours}`}
          accent="violet"
          icon={<ClockIcon className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="min-w-0 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h2 className="font-bold text-slate-900 dark:text-white">Kajian Terbaru</h2>
              <Link to="/studio/kajian" className="text-sm font-semibold text-brand-primary dark:text-brand-accent">
                Lihat semua
              </Link>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {recent.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-slate-400">
                  Belum ada kajian. Mulai dengan menambah kajian baru.
                </li>
              )}
              {recent.map((k) => (
                <li key={k.id}>
                  <Link
                    to={`/studio/kajian/${k.id}/edit`}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-white/5 sm:gap-4 sm:px-5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-primary/10 text-sm font-bold text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
                      #{k.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {k.title}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {k.speaker} · {formatDate(k.publishedAt)}
                      </p>
                    </div>
                    <span className="hidden text-xs tabular-nums text-slate-400 sm:block">
                      {k.duration}
                    </span>
                    <span className="shrink-0">
                      <StatusBadge status={k.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick actions */}
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
            <h2 className="font-bold text-slate-900 dark:text-white">Aksi Cepat</h2>
            <div className="mt-4 space-y-2">
              <Link to="/studio/kajian/baru" className="block">
                <Button variant="outline" className="w-full justify-start" icon={<PlusIcon className="h-4 w-4" />}>
                  Tambah Kajian (Wizard)
                </Button>
              </Link>
              <Link to="/studio/upload" className="block">
                <Button variant="outline" className="w-full justify-start" icon={<UploadIcon className="h-4 w-4" />}>
                  Bulk Upload Audio
                </Button>
              </Link>
              <Link to="/studio/kitab" className="block">
                <Button variant="outline" className="w-full justify-start" icon={<BookIcon className="h-4 w-4" />}>
                  Kelola Kitab
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Total durasi</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-primary dark:text-brand-accent">
              {formatTime(totalSeconds)}
            </p>
            <p className="mt-1 text-xs">di seluruh {kajian.length} kajian</p>
          </div>
        </div>
      </div>
    </div>
  );
}
