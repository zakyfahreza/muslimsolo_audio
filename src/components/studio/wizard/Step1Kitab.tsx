import { BookIcon, CheckIcon } from '../../icons';
import { listKitab, listKajianByKitab, nextNumber } from '../../../services/contentRepo';
import type { StepProps } from './types';
import { cn } from '../../../lib/utils';

export function Step1Kitab({ data, update }: StepProps) {
  const kitab = listKitab();

  const select = (id: string) => {
    const k = kitab.find((x) => x.id === id);
    if (!k) return;
    update({
      kitabId: id,
      number: data.id ? data.number : nextNumber(id),
      category: data.category === 'Aqidah' && !data.id ? k.category : data.category,
    });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pilih Kitab</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Kajian akan ditambahkan ke kitab yang dipilih dan diberi nomor otomatis.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {kitab.map((k) => {
          const selected = data.kitabId === k.id;
          const count = listKajianByKitab(k.id).length;
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => select(k.id)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4 text-left transition',
                selected
                  ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/30'
                  : 'border-slate-200 hover:border-brand-primary/50 dark:border-white/10',
              )}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                <BookIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">
                  {k.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{count} kajian</p>
              </div>
              {selected && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-primary text-white">
                  <CheckIcon className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {data.kitabId && (
        <p className="mt-4 rounded-xl bg-brand-primary/5 px-4 py-3 text-sm text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
          Kajian ini akan menjadi <strong>#{data.number}</strong> di kitab tersebut.
        </p>
      )}
    </div>
  );
}
