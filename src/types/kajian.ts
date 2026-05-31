import type { Category, PublishStatus } from './common';

export interface Kajian {
  id: string;
  /** Foreign key to the owning Kitab. */
  kitabId: string;
  /** Auto-incremented sequence number within the kitab (#1, #2, ...). */
  number: number;
  title: string;
  speaker: string;
  /** Denormalized kitab title for fast display / search / SEO. */
  book: string;
  category: Category;
  description: string;
  cover: string;
  audioUrl: string;
  /** R2 object key (path within the bucket), e.g. "audio/ad-durar/01.mp3". */
  audioKey: string;
  /** Human readable duration, e.g. "55:30" (auto-detected on upload). */
  duration: string;
  /** ISO date string, e.g. "2026-05-31". */
  publishedAt: string;
  transcript: string;
  status: PublishStatus;
}

export interface PlaybackProgress {
  id: string;
  position: number;
  duration: number;
  updatedAt: number;
}

export interface Stats {
  totalKajian: number;
  totalUstadz: number;
  totalKitab: number;
  totalHours: number;
}
