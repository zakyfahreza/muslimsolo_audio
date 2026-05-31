import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlaybackProgress } from '../types';

interface LibraryState {
  bookmarks: string[];
  favorites: string[];
  /** Most recently played kajian ids, newest first. */
  recentlyPlayed: string[];
  /** Per-track playback progress keyed by kajian id. */
  progress: Record<string, PlaybackProgress>;

  toggleBookmark: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
  pushRecent: (id: string) => void;
  saveProgress: (p: PlaybackProgress) => void;
  getProgress: (id: string) => PlaybackProgress | undefined;
}

const RECENT_LIMIT = 20;

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      favorites: [],
      recentlyPlayed: [],
      progress: {},

      toggleBookmark: (id) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(id)
            ? s.bookmarks.filter((b) => b !== id)
            : [id, ...s.bookmarks],
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [id, ...s.favorites],
        })),

      isBookmarked: (id) => get().bookmarks.includes(id),
      isFavorite: (id) => get().favorites.includes(id),

      pushRecent: (id) =>
        set((s) => ({
          recentlyPlayed: [id, ...s.recentlyPlayed.filter((r) => r !== id)].slice(0, RECENT_LIMIT),
        })),

      saveProgress: (p) =>
        set((s) => ({
          progress: { ...s.progress, [p.id]: p },
        })),

      getProgress: (id) => get().progress[id],
    }),
    {
      name: 'muslimsolo-library',
      version: 1,
    },
  ),
);
