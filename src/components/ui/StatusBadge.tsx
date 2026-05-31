import type { PublishStatus } from '../../types';
import { cn } from '../../lib/utils';

export function StatusBadge({ status }: { status: PublishStatus }) {
  const published = status === 'published';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        published
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', published ? 'bg-emerald-500' : 'bg-amber-500')} />
      {published ? 'Publish' : 'Draft'}
    </span>
  );
}
