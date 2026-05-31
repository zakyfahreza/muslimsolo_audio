import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

const fieldBase =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-60 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100';

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {children}
      {hint && <span className="ml-1 font-normal text-slate-400">— {hint}</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}
export function Input({ label, hint, className, id, ...props }: InputProps) {
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      <input id={id} className={cn(fieldBase, className)} {...props} />
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}
export function Textarea({ label, hint, className, ...props }: TextareaProps) {
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      <textarea className={cn(fieldBase, 'resize-y', className)} {...props} />
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}
export function Select({ label, hint, className, children, ...props }: SelectProps) {
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      <select className={cn(fieldBase, 'cursor-pointer', className)} {...props}>
        {children}
      </select>
    </div>
  );
}
