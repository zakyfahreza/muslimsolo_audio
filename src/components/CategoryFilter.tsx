import type { Category } from '../types';
import { CATEGORIES } from '../lib/data';
import { cn } from '../lib/utils';

interface CategoryFilterProps {
  selected: Category[];
  onChange: (next: Category[]) => void;
}

/**
 * Single-select pill filter for kajian categories. Clicking a category
 * switches to it; clicking the active one (or "Semua") clears the filter.
 */
export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const active = selected[0];

  const pick = (cat: Category) => {
    // Toggle off if already active, otherwise switch to the picked category.
    onChange(active === cat ? [] : [cat]);
  };

  const baseChip =
    'chip select-none cursor-pointer border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange([])}
        className={cn(
          baseChip,
          !active
            ? 'border-brand-primary bg-brand-primary text-white dark:border-brand-accent dark:bg-brand-accent dark:text-slate-900'
            : 'border-slate-300 text-slate-600 hover:border-brand-primary dark:border-slate-600 dark:text-slate-300',
        )}
      >
        Semua
      </button>
      {CATEGORIES.map((cat) => (
        <button
          type="button"
          key={cat}
          onClick={() => pick(cat)}
          className={cn(
            baseChip,
            active === cat
              ? 'border-brand-primary bg-brand-primary text-white dark:border-brand-accent dark:bg-brand-accent dark:text-slate-900'
              : 'border-slate-300 text-slate-600 hover:border-brand-primary dark:border-slate-600 dark:text-slate-300',
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
