import type { StudioConfig } from './config';
import { getToken, hasGithubToken } from './authService';

/**
 * Thin wrapper around the GitHub Contents API used to persist content JSON
 * files. Each kajian/kitab is a single JSON file; creating or editing one is
 * a commit, which triggers the GitHub Pages rebuild. No backend required.
 */

const API = 'https://api.github.com';

/** Throws a clear, localized error if the studio is not ready to talk to GitHub. */
function assertReady(config: StudioConfig): void {
  if (!config.githubRepo || !config.githubRepo.includes('/')) {
    throw new Error(
      'Repository GitHub belum diisi dengan benar (format: owner/nama-repo) di Pengaturan.',
    );
  }
  if (!hasGithubToken()) {
    throw new Error(
      'Belum terhubung ke GitHub. Keluar lalu masuk lagi dan tempel GitHub Personal Access Token (izin Contents: Read & Write).',
    );
  }
}

function headers(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/** Wraps fetch to convert network failures into a readable message. */
async function ghFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(
      'Gagal terhubung ke GitHub (masalah jaringan/CORS). Periksa koneksi internet Anda.',
    );
  }
}

/** Turn a non-OK GitHub response into a helpful, localized error. */
async function explain(res: Response, action: string): Promise<never> {
  let message = '';
  try {
    const data = (await res.json()) as { message?: string };
    message = data.message ?? '';
  } catch {
    /* ignore */
  }
  if (res.status === 401) {
    throw new Error('Token GitHub tidak valid atau kedaluwarsa. Masuk ulang dengan token baru.');
  }
  if (res.status === 403) {
    throw new Error('Akses ditolak GitHub. Pastikan token punya izin Contents: Read & Write pada repo.');
  }
  if (res.status === 404) {
    throw new Error('Repository atau branch tidak ditemukan. Periksa nama repo & branch di Pengaturan.');
  }
  if (res.status === 409 || res.status === 422) {
    throw new Error('Konflik versi saat menyimpan. Muat ulang halaman lalu coba lagi.');
  }
  throw new Error(`${action} gagal (${res.status})${message ? `: ${message}` : ''}.`);
}

function encodeContent(json: unknown): string {
  const text = JSON.stringify(json, null, 2);
  // UTF-8 safe base64 encoding.
  return btoa(unescape(encodeURIComponent(text)));
}

interface ContentsResponse {
  sha: string;
}

/** Get the current file SHA (needed to update an existing file), or null. */
async function getFileSha(config: StudioConfig, path: string): Promise<string | null> {
  const url = `${API}/repos/${config.githubRepo}/contents/${encodeURI(path)}?ref=${config.githubBranch}`;
  const res = await ghFetch(url, { headers: headers() });
  if (res.status === 404) return null;
  if (!res.ok) await explain(res, 'Membaca file dari GitHub');
  const data = (await res.json()) as ContentsResponse;
  return data.sha;
}

export interface CommitFileParams {
  path: string;
  content: unknown;
  message: string;
}

/** Create or update a JSON file in the repo. */
export async function commitJsonFile(
  config: StudioConfig,
  { path, content, message }: CommitFileParams,
): Promise<void> {
  assertReady(config);
  const sha = await getFileSha(config, path);
  const url = `${API}/repos/${config.githubRepo}/contents/${encodeURI(path)}`;
  const body = {
    message,
    content: encodeContent(content),
    branch: config.githubBranch,
    ...(sha ? { sha } : {}),
  };
  const res = await ghFetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) await explain(res, 'Menyimpan ke GitHub');
}

/** Delete a JSON file from the repo. */
export async function deleteFile(
  config: StudioConfig,
  path: string,
  message: string,
): Promise<void> {
  assertReady(config);
  const sha = await getFileSha(config, path);
  if (!sha) return; // already gone
  const url = `${API}/repos/${config.githubRepo}/contents/${encodeURI(path)}`;
  const body = { message, sha, branch: config.githubBranch };
  const res = await ghFetch(url, { method: 'DELETE', headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) await explain(res, 'Menghapus file di GitHub');
}

/** Verify the repo + token work; used by the Settings "Test Koneksi" button. */
export async function testGithub(config: StudioConfig): Promise<void> {
  assertReady(config);
  const url = `${API}/repos/${config.githubRepo}/branches/${config.githubBranch}`;
  const res = await ghFetch(url, { headers: headers() });
  if (!res.ok) await explain(res, 'Menguji koneksi GitHub');
}
