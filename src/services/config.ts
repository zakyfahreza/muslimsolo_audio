/**
 * Runtime configuration for the admin studio. Values come from Vite env
 * variables at build time, but can be overridden at runtime via the Settings
 * page (persisted to localStorage). This lets a non-developer admin point the
 * studio at their own GitHub repo, R2 worker, and public audio domain without
 * rebuilding.
 */

export interface StudioConfig {
  /** GitHub repo in "owner/name" form. */
  githubRepo: string;
  /** Target branch for commits. */
  githubBranch: string;
  /** Base URL of the Cloudflare Worker that issues R2 presigned URLs. */
  workerUrl: string;
  /** Public base URL for serving audio from R2, e.g. https://audio.muslimsolo.id */
  audioPublicBase: string;
  /** When true, uploads/commits are simulated locally (no network). */
  mockMode: boolean;
}

const STORAGE_KEY = 'muslimsolo-studio-config';

const ENV = import.meta.env as Record<string, string | undefined>;

const DEFAULT_CONFIG: StudioConfig = {
  githubRepo: ENV.VITE_GITHUB_REPO ?? '',
  githubBranch: ENV.VITE_GITHUB_BRANCH ?? 'main',
  workerUrl: ENV.VITE_R2_WORKER_URL ?? '',
  audioPublicBase: ENV.VITE_AUDIO_PUBLIC_BASE ?? 'https://audio.muslimsolo.id',
  // Default to mock mode until the admin configures a real worker + repo.
  mockMode: (ENV.VITE_STUDIO_MOCK ?? 'true') !== 'false',
};

export function loadConfig(): StudioConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_CONFIG, ...(JSON.parse(stored) as Partial<StudioConfig>) };
  } catch {
    /* ignore malformed config */
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: StudioConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Whether real network operations are possible (worker + repo configured). */
export function isLiveConfigured(config: StudioConfig): boolean {
  return Boolean(config.githubRepo && config.workerUrl) && !config.mockMode;
}
