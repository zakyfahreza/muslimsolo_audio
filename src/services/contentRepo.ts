import type { Kajian, Kitab } from '../types';
import { ALL_KAJIAN_RAW, ALL_KITAB } from '../lib/data';
import { loadConfig } from './config';
import { commitJsonFile, deleteFile } from './githubService';
import { hasGithubToken } from './authService';
import { slugify } from '../lib/utils';

/**
 * High-level content store for the admin studio.
 *
 * The public site loads JSON at build time, but the studio needs to reflect
 * edits immediately. So the repo keeps a localStorage "overlay" of changes
 * that is merged on top of the build-time content. When live (GitHub
 * configured), saves also commit JSON files to the repo which become the new
 * build-time content on the next deploy. In mock mode, only the overlay is
 * updated.
 */

const OVERLAY_KEY = 'muslimsolo-content-overlay';

interface Overlay {
  kitab: Record<string, Kitab>;
  kajian: Record<string, Kajian>;
  deletedKajian: string[];
  deletedKitab: string[];
}

function emptyOverlay(): Overlay {
  return { kitab: {}, kajian: {}, deletedKajian: [], deletedKitab: [] };
}

function loadOverlay(): Overlay {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY);
    if (raw) return { ...emptyOverlay(), ...(JSON.parse(raw) as Overlay) };
  } catch {
    /* ignore */
  }
  return emptyOverlay();
}

function saveOverlay(overlay: Overlay): void {
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay));
}

// --- Merged views -----------------------------------------------------------

export function listKitab(): Kitab[] {
  const overlay = loadOverlay();
  const map = new Map<string, Kitab>();
  for (const k of ALL_KITAB) map.set(k.id, k);
  for (const k of Object.values(overlay.kitab)) map.set(k.id, k);
  for (const id of overlay.deletedKitab) map.delete(id);
  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export function listKajian(): Kajian[] {
  const overlay = loadOverlay();
  const map = new Map<string, Kajian>();
  for (const k of ALL_KAJIAN_RAW) map.set(k.id, k);
  for (const k of Object.values(overlay.kajian)) map.set(k.id, k);
  for (const id of overlay.deletedKajian) map.delete(id);
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getKajian(id: string): Kajian | undefined {
  return listKajian().find((k) => k.id === id);
}

export function getKitab(id: string): Kitab | undefined {
  return listKitab().find((k) => k.id === id);
}

export function listKajianByKitab(kitabId: string): Kajian[] {
  return listKajian()
    .filter((k) => k.kitabId === kitabId)
    .sort((a, b) => a.number - b.number);
}

export function nextNumber(kitabId: string): number {
  return listKajianByKitab(kitabId).reduce((max, k) => Math.max(max, k.number), 0) + 1;
}

// --- Mutations --------------------------------------------------------------

function kajianPath(id: string): string {
  return `src/content/kajian/${id}.json`;
}
function kitabPath(slug: string): string {
  return `src/content/kitab/${slug}.json`;
}

/** Result of a save: whether it was committed to GitHub or only stored locally. */
export interface SaveResult {
  committed: boolean;
}

/** Throws if Live mode is on but prerequisites for committing are missing. */
function assertCommitReady(): void {
  const config = loadConfig();
  if (config.mockMode) return; // demo mode: local only, no checks
  if (!config.githubRepo || !config.githubRepo.includes('/')) {
    throw new Error(
      'Mode Live aktif tapi Repository GitHub belum diisi (owner/nama-repo) di Pengaturan.',
    );
  }
  if (!hasGithubToken()) {
    throw new Error(
      'Mode Live aktif tapi GitHub belum terhubung. Buka Pengaturan → GitHub → Hubungkan token.',
    );
  }
}

export async function saveKitab(kitab: Kitab): Promise<SaveResult> {
  const config = loadConfig();
  assertCommitReady();
  const overlay = loadOverlay();
  overlay.kitab[kitab.id] = kitab;
  overlay.deletedKitab = overlay.deletedKitab.filter((id) => id !== kitab.id);
  saveOverlay(overlay);

  if (!config.mockMode) {
    await commitJsonFile(config, {
      path: kitabPath(kitab.slug),
      content: kitab,
      message: `chore(kitab): simpan ${kitab.title}`,
    });
    return { committed: true };
  }
  return { committed: false };
}

export async function saveKajian(kajian: Kajian): Promise<SaveResult> {
  const config = loadConfig();
  assertCommitReady();
  const overlay = loadOverlay();
  overlay.kajian[kajian.id] = kajian;
  overlay.deletedKajian = overlay.deletedKajian.filter((id) => id !== kajian.id);
  saveOverlay(overlay);

  if (!config.mockMode) {
    await commitJsonFile(config, {
      path: kajianPath(kajian.id),
      content: kajian,
      message: `content(kajian): ${kajian.title}`,
    });
    return { committed: true };
  }
  return { committed: false };
}

export async function removeKajian(id: string): Promise<SaveResult> {
  const config = loadConfig();
  assertCommitReady();
  const overlay = loadOverlay();
  delete overlay.kajian[id];
  if (!overlay.deletedKajian.includes(id)) overlay.deletedKajian.push(id);
  saveOverlay(overlay);

  if (!config.mockMode) {
    await deleteFile(config, kajianPath(id), `content(kajian): hapus ${id}`);
    return { committed: true };
  }
  return { committed: false };
}

export async function removeKitab(id: string): Promise<SaveResult> {
  const config = loadConfig();
  assertCommitReady();
  const kitab = getKitab(id);
  const overlay = loadOverlay();
  delete overlay.kitab[id];
  if (!overlay.deletedKitab.includes(id)) overlay.deletedKitab.push(id);
  saveOverlay(overlay);

  if (!config.mockMode && kitab) {
    await deleteFile(config, kitabPath(kitab.slug), `chore(kitab): hapus ${kitab.title}`);
    return { committed: true };
  }
  return { committed: false };
}

// --- Factory helpers --------------------------------------------------------

export function makeKitabId(title: string): string {
  return `kitab-${slugify(title)}`;
}

export function newKajianId(kitabSlug: string, number: number): string {
  return `${kitabSlug}-${String(number).padStart(2, '0')}`;
}

/** Discard all local overlay changes (useful for the demo / reset). */
export function resetOverlay(): void {
  localStorage.removeItem(OVERLAY_KEY);
}

export function hasPendingChanges(): boolean {
  const o = loadOverlay();
  return (
    Object.keys(o.kajian).length > 0 ||
    Object.keys(o.kitab).length > 0 ||
    o.deletedKajian.length > 0 ||
    o.deletedKitab.length > 0
  );
}
