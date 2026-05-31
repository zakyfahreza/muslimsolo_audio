import { create } from 'zustand';
import type { Kajian } from '../types';

export const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

interface PlayerState {
  /** Ordered list of tracks currently loaded into the player. */
  queue: Kajian[];
  /** Index into `queue` of the active track, or -1 when nothing is loaded. */
  currentIndex: number;
  isPlaying: boolean;
  /** Current playback position in seconds. */
  currentTime: number;
  /** Track duration in seconds (from the audio element). */
  duration: number;
  volume: number;
  speed: PlaybackSpeed;
  /** Set to true when the user requests a seek; consumed by the audio element. */
  seekRequest: number | null;

  current: () => Kajian | null;

  playKajian: (kajian: Kajian, queue?: Kajian[]) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  next: () => void;
  previous: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  requestSeek: (time: number) => void;
  clearSeekRequest: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  speed: 1,
  seekRequest: null,

  current: () => {
    const { queue, currentIndex } = get();
    return currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;
  },

  playKajian: (kajian, queue) => {
    const list = queue && queue.length > 0 ? queue : [kajian];
    const index = list.findIndex((k) => k.id === kajian.id);
    set({
      queue: list,
      currentIndex: index >= 0 ? index : 0,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    });
  },

  togglePlay: () => set((s) => ({ isPlaying: s.currentIndex >= 0 ? !s.isPlaying : false })),
  setPlaying: (playing) => set({ isPlaying: playing }),

  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < 0) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    set({ currentIndex: nextIndex, isPlaying: true, currentTime: 0, duration: 0 });
  },

  previous: () => {
    const { queue, currentIndex, currentTime } = get();
    if (currentIndex < 0) return;
    // If more than 3s in, restart the current track instead of going back.
    if (currentTime > 3) {
      set({ seekRequest: 0, currentTime: 0 });
      return;
    }
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    set({ currentIndex: prevIndex, isPlaying: true, currentTime: 0, duration: 0 });
  },

  setSpeed: (speed) => set({ speed }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  requestSeek: (time) => set({ seekRequest: time }),
  clearSeekRequest: () => set({ seekRequest: null }),
}));
