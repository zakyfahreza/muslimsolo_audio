import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from '../icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg animate-fade-in rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        {title && (
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-white/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
