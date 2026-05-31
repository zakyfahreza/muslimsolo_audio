import { CheckIcon } from '../icons';
import { cn } from '../../lib/utils';

interface StepperProps {
  steps: string[];
  current: number;
  onStepClick?: (index: number) => void;
  /** Highest step the user is allowed to jump to. */
  maxReachable?: number;
}

export function Stepper({ steps, current, onStepClick, maxReachable = 0 }: StepperProps) {
  return (
    <ol className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const reachable = i <= maxReachable;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!reachable || !onStepClick}
              onClick={() => reachable && onStepClick?.(i)}
              className={cn(
                'flex items-center gap-2',
                reachable && onStepClick ? 'cursor-pointer' : 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors',
                  done && 'bg-brand-primary text-white',
                  active && 'bg-brand-primary text-white ring-4 ring-brand-primary/20',
                  !done && !active && 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                )}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-semibold sm:block',
                  active || done
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400',
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'mx-2 h-0.5 flex-1 rounded transition-colors',
                  i < current ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
