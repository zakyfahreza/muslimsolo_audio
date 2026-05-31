import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'accent' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-secondary',
  accent: 'bg-brand-accent text-slate-900 shadow-lg shadow-brand-accent/25 hover:brightness-105',
  ghost: 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-white/10',
  outline:
    'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5',
  danger: 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
