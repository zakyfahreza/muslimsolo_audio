import { useToastStore } from '../../store/toastStore';
import { cn } from '../../lib/utils';

const styles = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-rose-600 text-white',
  info: 'bg-slate-800 text-white dark:bg-slate-700',
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto animate-slide-up rounded-xl px-4 py-3 text-left text-sm font-medium shadow-lg',
            styles[t.kind],
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
