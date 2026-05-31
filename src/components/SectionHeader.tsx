import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionTo?: string;
}

export function SectionHeader({ title, subtitle, actionLabel, actionTo }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="shrink-0 text-sm font-semibold text-brand-primary hover:underline dark:text-brand-accent"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
