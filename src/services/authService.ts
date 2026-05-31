/**
 * Authentication for the admin studio.
 *
 * Login modes:
 *  - Credential: a fixed admin id + password gate so not everyone can enter.
 *    NOTE: this runs in the browser, so it is a basic access gate, not strong
 *    server-side security. For true protection in live mode, pair it with the
 *    GitHub token (which is verified server-side by GitHub/the R2 worker).
 *  - GitHub PAT: the admin pastes a fine-grained Personal Access Token with
 *    "Contents: read & write" on the content repo. Verified against GitHub.
 *
 * We deliberately avoid a full OAuth dance to keep the app fully static.
 */

const TOKEN_KEY = 'muslimsolo-studio-token';
const USER_KEY = 'muslimsolo-studio-user';

const ENV = import.meta.env as Record<string, string | undefined>;
// Credentials can be overridden at build time via env; sensible default below.
const ADMIN_USER = ENV.VITE_ADMIN_USER ?? 'admin';
const ADMIN_PASS = ENV.VITE_ADMIN_PASS ?? 'mediamuslimsolo13245';

export interface StudioUser {
  login: string;
  name?: string;
  avatarUrl?: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StudioUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudioUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Placeholder token values used by non-GitHub logins.
const PLACEHOLDER_TOKENS = ['admin-session', 'mock-token', 'admin-token'];

/** True when a real GitHub Personal Access Token is connected. */
export function hasGithubToken(): boolean {
  const t = getToken();
  return Boolean(t) && !PLACEHOLDER_TOKENS.includes(t as string);
}

/** Credential login — checks the admin id + password gate. */
export function credentialLogin(username: string, password: string): StudioUser {
  if (username.trim() !== ADMIN_USER || password !== ADMIN_PASS) {
    throw new Error('ID atau kata sandi salah.');
  }
  const user: StudioUser = { login: ADMIN_USER, name: 'Admin' };
  localStorage.setItem(TOKEN_KEY, 'admin-session');
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/** Verify a GitHub PAT and persist the session on success. */
export async function githubLogin(token: string): Promise<StudioUser> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) {
    throw new Error('Token GitHub tidak valid atau tidak memiliki izin yang cukup.');
  }
  const data = (await res.json()) as { login: string; name?: string; avatar_url?: string };
  const user: StudioUser = { login: data.login, name: data.name, avatarUrl: data.avatar_url };
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
