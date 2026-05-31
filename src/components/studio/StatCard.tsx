import type { ReactNode } from 'react';

type Accent = 'teal' | 'amber' | 'sky' | 'violet';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: Accent;
}

// Static class maps so Tailwind keeps them during purge.
const ACCENTS: Record<Accent, string> = {
  teal: 'bg-brand-primary/10 text-brand-primary',
  amber: 'bg-brand-accent/15 text-brand-accent',
  sky: 'bg-sky-500/10 text-sky-500',
  violet: 'bg-violet-500/10 text-violet-500',
};

export function StatCard({ label, value, icon, accent = 'teal' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${ACCENTS[accent]}`}>
        {icon}
      </span>
      <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
