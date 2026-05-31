import type { StudioConfig } from './config';
import { getToken } from './authService';

/**
 * Thin wrapper around the GitHub Contents API used to persist content JSON
 * files. Each kajian/kitab is a single JSON file; creating or editing one is
 * a commit, which triggers the GitHub Pages rebuild. No backend required.
 */

const API = 'https://api.github.com';

function headers(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
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
  const url = `${API}/repos/${config.githubRepo}/contents/${path}?ref=${config.githubBranch}`;
  const res = await fetch(url, { headers: headers() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Gagal membaca file dari GitHub (${res.status}).`);
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
  const sha = await getFileSha(config, path);
  const url = `${API}/repos/${config.githubRepo}/contents/${path}`;
  const body = {
    message,
    content: encodeContent(content),
    branch: config.githubBranch,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gagal menyimpan ke GitHub (${res.status}): ${detail}`);
  }
}

/** Delete a JSON file from the repo. */
export async function deleteFile(
  config: StudioConfig,
  path: string,
  message: string,
): Promise<void> {
  const sha = await getFileSha(config, path);
  if (!sha) return; // already gone
  const url = `${API}/repos/${config.githubRepo}/contents/${path}`;
  const body = { message, sha, branch: config.githubBranch };
  const res = await fetch(url, { method: 'DELETE', headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Gagal menghapus file di GitHub (${res.status}).`);
}
