import { getStats } from '../lib/data';
import { BookIcon, UserIcon, ClockIcon, PlayIcon } from './icons';

const ITEMS = [
  { key: 'totalKajian', label: 'Total Kajian', Icon: PlayIcon },
  { key: 'totalUstadz', label: 'Total Ustadz', Icon: UserIcon },
  { key: 'totalKitab', label: 'Total Kitab', Icon: BookIcon },
  { key: 'totalHours', label: 'Jam Audio', Icon: ClockIcon, suffix: '+' },
] as const;

export function StatsSection() {
  const stats = getStats();
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {ITEMS.map(({ key, label, Icon, ...rest }) => (
        <div
          key={key}
          className="card flex items-center gap-4 p-4 sm:p-5"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats[key]}
              {'suffix' in rest ? rest.suffix : ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
