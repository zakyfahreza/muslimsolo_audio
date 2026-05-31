/**
 * Resolve a public asset path against the configured Vite base path so that
 * covers and icons work both locally and on GitHub Pages project sites
 * (served from /<repo>/). Paths that are already absolute URLs are returned
 * untouched.
 */
export function asset(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  const base = import.meta.env.BASE_URL || '/';
  const clean = path.replace(/^\//, '');
  return `${base.replace(/\/$/, '')}/${clean}`;
}
