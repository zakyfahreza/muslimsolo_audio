/**
 * Authentication for the admin studio.
 *
 * - Admin login: a fixed id + password gate (single step). This runs in the
 *   browser, so it is a basic access gate, not strong server-side security.
 * - GitHub token: a fine-grained Personal Access Token (Contents: read & write)
 *   stored once in Settings and reused for every save. It is NOT asked at
 *   login. The token is verified against GitHub before being stored.
 *
 * We deliberately avoid a full OAuth dance to keep the app fully static.
 */

const SESSION_KEY = 'muslimsolo-studio-session';
const USER_KEY = 'muslimsolo-studio-user';
const GH_TOKEN_KEY = 'muslimsolo-studio-gh-token';
const GH_LOGIN_KEY = 'muslimsolo-studio-gh-login';

const ENV = import.meta.env as Record<string, string | undefined>;
// Credentials can be overridden at build time via env; sensible default below.
const ADMIN_USER = ENV.VITE_ADMIN_USER ?? 'admin';
const ADMIN_PASS = ENV.VITE_ADMIN_PASS ?? 'mediamuslimsolo13245';

export interface StudioUser {
  login: string;
  name?: string;
  avatarUrl?: string;
}

/** The GitHub Personal Access Token (used by github/r2 services), or null. */
export function getToken(): string | null {
  return localStorage.getItem(GH_TOKEN_KEY);
}

/** True when a GitHub token has been saved in Settings. */
export function hasGithubToken(): boolean {
  return Boolean(localStorage.getItem(GH_TOKEN_KEY));
}

/** The GitHub account login the saved token belongs to, for display. */
export function getGithubLogin(): string | null {
  return localStorage.getItem(GH_LOGIN_KEY);
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

/** Clears the admin session. The GitHub token stays saved in Settings. */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Admin login — checks the id + password gate. */
export function credentialLogin(username: string, password: string): StudioUser {
  if (username.trim() !== ADMIN_USER || password !== ADMIN_PASS) {
    throw new Error('ID atau kata sandi salah.');
  }
  const user: StudioUser = { login: ADMIN_USER, name: 'Admin' };
  localStorage.setItem(SESSION_KEY, '1');
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/** Verify a GitHub PAT and save it for reuse. Called from Settings. */
export async function connectGithub(token: string): Promise<string> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) {
    throw new Error('Token GitHub tidak valid atau tidak memiliki izin yang cukup.');
  }
  const data = (await res.json()) as { login: string };
  localStorage.setItem(GH_TOKEN_KEY, token);
  localStorage.setItem(GH_LOGIN_KEY, data.login);
  return data.login;
}

/** Remove the saved GitHub token. */
export function disconnectGithub(): void {
  localStorage.removeItem(GH_TOKEN_KEY);
  localStorage.removeItem(GH_LOGIN_KEY);
}
