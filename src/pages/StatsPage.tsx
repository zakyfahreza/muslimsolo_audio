import { Seo } from '../components/Seo';
import { StatsSection } from '../components/StatsSection';
import { SectionHeader } from '../components/SectionHeader';
import { ChartIcon } from '../components/icons';
import { ALL_KAJIAN, CATEGORIES, getKitabStats, getSpeakers } from '../lib/data';
import { durationToSeconds } from '../lib/utils';

interface BarRow {
  label: string;
  value: number;
}

function BarChart({ rows, unit = '' }: { rows: BarRow[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-slate-600 dark:text-slate-300" title={row.label}>
            {row.label}
          </span>
          <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
            <div
              className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-2 text-[11px] font-semibold text-white transition-all duration-700"
              style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }}
            >
              {row.value}
              {unit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsPage() {
  // Kajian count per category.
  const byCategory: BarRow[] = CATEGORIES.map((cat) => ({
    label: cat,
    value: ALL_KAJIAN.filter((k) => k.category === cat).length,
  })).sort((a, b) => b.value - a.value);

  // Top books by kajian count.
  const byBook: BarRow[] = getKitabStats()
    .slice(0, 6)
    .map((b) => ({ label: b.title, value: b.kajianCount }));

  // Hours per speaker.
  const bySpeaker: BarRow[] = getSpeakers()
    .map((s) => ({
      label: s.name,
      value: Math.round(
        (ALL_KAJIAN.filter((k) => k.speaker === s.name).reduce(
          (acc, k) => acc + durationToSeconds(k.duration),
          0,
        ) /
          3600) *
          10,
      ) / 10,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Seo title="Statistik" description="Ringkasan analitik koleksi kajian MuslimSolo Audio." />

      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
          <ChartIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Statistik Koleksi
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Analitik sederhana dari data kajian</p>
        </div>
      </header>

      <div className="mb-8">
        <StatsSection />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <SectionHeader title="Kajian per Kategori" />
          <BarChart rows={byCategory} />
        </section>

        <section className="card p-5">
          <SectionHeader title="Kitab Terpopuler" />
          <BarChart rows={byBook} />
        </section>

        <section className="card p-5 lg:col-span-2">
          <SectionHeader title="Jam Audio per Ustadz" />
          <BarChart rows={bySpeaker} unit=" jam" />
        </section>
      </div>
    </div>
  );
}
