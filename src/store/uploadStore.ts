import { create } from 'zustand';

export type UploadStatus = 'queued' | 'reading' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  file: File;
  /** Assigned kajian number for bulk ordering. */
  number: number;
  title: string;
  /** Detected duration string, e.g. "54:23". */
  duration: string;
  durationSeconds: number;
  status: UploadStatus;
  progress: number;
  /** Resulting public URL + key after a successful upload. */
  publicUrl?: string;
  key?: string;
  /** Session-only object URL for instant preview. */
  localUrl?: string;
  error?: string;
}

interface UploadState {
  items: UploadItem[];
  addItems: (items: UploadItem[]) => void;
  updateItem: (id: string, patch: Partial<UploadItem>) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  items: [],
  addItems: (items) => set((s) => ({ items: [...s.items, ...items] })),
  updateItem: (id, patch) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
  clear: () => set({ items: [] }),
}));
