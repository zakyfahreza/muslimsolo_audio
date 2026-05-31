import type { ReactNode } from 'react';
import { useDropzone } from '../../hooks/useDropzone';
import { isAudioFile } from '../../lib/audio';
import { UploadIcon } from '../icons';
import { cn } from '../../lib/utils';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

/** Large drag-and-drop area for audio files. */
export function Dropzone({ onFiles, multiple = false, title, subtitle, children }: DropzoneProps) {
  const { isDragging, dropProps, inputProps } = useDropzone({
    onFiles,
    accept: isAudioFile,
    multiple,
  });

  return (
    <div
      {...dropProps}
      role="button"
      tabIndex={0}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
        isDragging
          ? 'border-brand-primary bg-brand-primary/5'
          : 'border-slate-300 hover:border-brand-primary/60 hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/5',
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
        <UploadIcon className="h-7 w-7" />
      </span>
      <p className="mt-4 text-base font-bold text-slate-900 dark:text-white">
        {title ?? 'Tarik & lepas file MP3 di sini'}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {subtitle ?? 'atau klik untuk memilih file'}
      </p>
      {children}
      <input {...inputProps} accept="audio/*,.mp3,.m4a,.aac,.ogg,.wav" />
    </div>
  );
}
