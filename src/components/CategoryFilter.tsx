import type { Category } from '../types';
import { CATEGORIES } from '../lib/data';
import { cn } from '../lib/utils';

interface CategoryFilterProps {
  selected: Category[];
  onChange: (next: Category[]) => void;
}

/** Multi-select pill filter for kajian categories. */
export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const toggle = (cat: Category) => {
    onChange(selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange([])}
        className={cn(
          'chip border transition-colors',
          selected.length === 0
            ? 'border-brand-primary bg-brand-primary text-white dark:border-brand-accent dark:bg-brand-accent dark:text-slate-900'
            : 'border-slate-300 text-slate-600 hover:border-brand-primary dark:border-slate-600 dark:text-slate-300',
        )}
      >
        Semua
      </button>
      {CATEGORIES.map((cat) => {
        const active = selected.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={cn(
              'chip border transition-colors',
              active
                ? 'border-brand-primary bg-brand-primary text-white dark:border-brand-accent dark:bg-brand-accent dark:text-slate-900'
                : 'border-slate-300 text-slate-600 hover:border-brand-primary dark:border-slate-600 dark:text-slate-300',
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
