import type { Category } from './common';

/** A book/collection that groups a series of kajian. */
export interface Kitab {
  id: string;
  title: string;
  slug: string;
  description?: string;
  /** Default category applied to new kajian in this kitab. */
  category: Category;
  /** Optional cover image (URL or data URL). New kajian inherit this. */
  cover?: string;
  /** Seed string used by the canvas cover generator for a stable gradient. */
  coverSeed: string;
  createdAt: string;
  updatedAt: string;
}

export interface KitabStats extends Kitab {
  kajianCount: number;
  /** Total duration in seconds across all kajian in the kitab. */
  totalSeconds: number;
  speakers: string[];
}
