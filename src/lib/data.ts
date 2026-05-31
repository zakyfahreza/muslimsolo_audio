import type { Kajian, Kitab, KitabStats, Stats, Category } from '../types';
import { CATEGORIES } from '../types';
import { durationToSeconds, slugify } from './utils';

/**
 * Build-time content loaders. Each kitab and kajian lives as a single JSON
 * file under src/content. The admin studio commits new/edited files via the
 * GitHub API which triggers a rebuild, so this glob always reflects the
 * latest published content. No database or server required.
 */
const kitabModules = import.meta.glob<Kitab>('../content/kitab/*.json', {
  eager: true,
  import: 'default',
});
const kajianModules = import.meta.glob<Kajian>('../content/kajian/*.json', {
  eager: true,
  import: 'default',
});

export const ALL_KITAB: Kitab[] = Object.entries(kitabModules)
  .map(([path, kitab]) => {
    const fileSlug = path.split('/').pop()?.replace(/\.json$/, '') ?? '';
    return { ...kitab, slug: kitab.slug || fileSlug };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

/** All kajian, newest first. Drafts are included for admin use. */
export const ALL_KAJIAN_RAW: Kajian[] = Object.entries(kajianModules)
  .map(([path, kajian]) => {
    const fileSlug = path.split('/').pop()?.replace(/\.json$/, '') ?? '';
    const id = kajian.id && String(kajian.id).trim() ? kajian.id : fileSlug;
    return { ...kajian, id } as Kajian;
  })
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

/** Published kajian only — what the public site shows. */
export const ALL_KAJIAN: Kajian[] = ALL_KAJIAN_RAW.filter((k) => k.status !== 'draft');

export { CATEGORIES };
export type { Category };

// ---------------------------------------------------------------------------
// Kajian queries
// ---------------------------------------------------------------------------

export function getKajianById(id: string): Kajian | undefined {
  return ALL_KAJIAN.find((k) => k.id === id);
}

export function getKajianByKitabId(kitabId: string, includeDrafts = false): Kajian[] {
  const source = includeDrafts ? ALL_KAJIAN_RAW : ALL_KAJIAN;
  return source.filter((k) => k.kitabId === kitabId).sort((a, b) => a.number - b.number);
}

// ---------------------------------------------------------------------------
// Kitab queries
// ---------------------------------------------------------------------------

export function getKitabById(id: string): Kitab | undefined {
  return ALL_KITAB.find((k) => k.id === id);
}

export function getKitabBySlug(slug: string): Kitab | undefined {
  return ALL_KITAB.find((k) => k.slug === slug);
}

export function getKitabStats(includeDrafts = false): KitabStats[] {
  return ALL_KITAB.map((kitab) => {
    const kajian = getKajianByKitabId(kitab.id, includeDrafts);
    const speakers = Array.from(new Set(kajian.map((k) => k.speaker)));
    const totalSeconds = kajian.reduce((acc, k) => acc + durationToSeconds(k.duration), 0);
    return {
      ...kitab,
      kajianCount: kajian.length,
      totalSeconds,
      speakers,
    };
  }).sort((a, b) => b.kajianCount - a.kajianCount);
}

/** Next sequence number for a kitab (max existing number + 1). */
export function nextKajianNumber(kitabId: string): number {
  const kajian = getKajianByKitabId(kitabId, true);
  return kajian.reduce((max, k) => Math.max(max, k.number), 0) + 1;
}

// ---------------------------------------------------------------------------
// Speaker queries (still useful for the public site)
// ---------------------------------------------------------------------------

export interface SpeakerSummary {
  name: string;
  slug: string;
  count: number;
  books: string[];
}

export function getSpeakers(): SpeakerSummary[] {
  const map = new Map<string, SpeakerSummary>();
  for (const k of ALL_KAJIAN) {
    const existing = map.get(k.speaker);
    if (existing) {
      existing.count += 1;
      if (!existing.books.includes(k.book)) existing.books.push(k.book);
    } else {
      map.set(k.speaker, { name: k.speaker, slug: slugify(k.speaker), count: 1, books: [k.book] });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function getSpeakerBySlug(slug: string): { name: string; kajian: Kajian[] } | undefined {
  const kajian = ALL_KAJIAN.filter((k) => slugify(k.speaker) === slug);
  if (kajian.length === 0) return undefined;
  return { name: kajian[0].speaker, kajian };
}

// Public "book" pages now resolve through kitab slug.
export function getBookKajianBySlug(slug: string): { kitab: Kitab; kajian: Kajian[] } | undefined {
  const kitab = getKitabBySlug(slug);
  if (!kitab) return undefined;
  return { kitab, kajian: getKajianByKitabId(kitab.id) };
}

// ---------------------------------------------------------------------------
// Global stats
// ---------------------------------------------------------------------------

export function getStats(includeDrafts = false): Stats {
  const source = includeDrafts ? ALL_KAJIAN_RAW : ALL_KAJIAN;
  const speakers = new Set(source.map((k) => k.speaker));
  const totalSeconds = source.reduce((acc, k) => acc + durationToSeconds(k.duration), 0);
  return {
    totalKajian: source.length,
    totalUstadz: speakers.size,
    totalKitab: ALL_KITAB.length,
    totalHours: Math.round(totalSeconds / 3600),
  };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchFilters {
  query?: string;
  categories?: Category[];
  kitabIds?: string[];
  speakers?: string[];
  includeDrafts?: boolean;
}

export function searchKajian({
  query,
  categories,
  kitabIds,
  speakers,
  includeDrafts,
}: SearchFilters): Kajian[] {
  const q = (query ?? '').trim().toLowerCase();
  const source = includeDrafts ? ALL_KAJIAN_RAW : ALL_KAJIAN;
  return source.filter((k) => {
    const matchesQuery =
      !q ||
      k.title.toLowerCase().includes(q) ||
      k.speaker.toLowerCase().includes(q) ||
      k.book.toLowerCase().includes(q);
    const matchesCategory =
      !categories || categories.length === 0 || categories.includes(k.category);
    const matchesKitab = !kitabIds || kitabIds.length === 0 || kitabIds.includes(k.kitabId);
    const matchesSpeaker = !speakers || speakers.length === 0 || speakers.includes(k.speaker);
    return matchesQuery && matchesCategory && matchesKitab && matchesSpeaker;
  });
}
