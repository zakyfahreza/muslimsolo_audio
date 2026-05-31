import { useCallback, useRef, useState } from 'react';

interface UseDropzoneOptions {
  onFiles: (files: File[]) => void;
  accept?: (file: File) => boolean;
  multiple?: boolean;
}

/** Minimal drag-and-drop + click-to-select file input handler. */
export function useDropzone({ onFiles, accept, multiple = true }: UseDropzoneOptions) {
  const [isDragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      let files = Array.from(list);
      if (accept) files = files.filter(accept);
      if (!multiple) files = files.slice(0, 1);
      if (files.length) onFiles(files);
    },
    [accept, multiple, onFiles],
  );

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    onClick: () => inputRef.current?.click(),
  };

  const inputProps = {
    ref: inputRef,
    type: 'file' as const,
    multiple,
    className: 'hidden',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = '';
    },
  };

  return { isDragging, dropProps, inputProps };
}
