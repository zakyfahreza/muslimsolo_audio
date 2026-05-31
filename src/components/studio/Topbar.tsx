import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MenuIcon, SunIcon, MoonIcon, LogoutIcon, ChevronRightIcon } from '../icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const LABELS: Record<string, string> = {
  studio: 'Dashboard',
  kitab: 'Kitab',
  kajian: 'Kajian',
  upload: 'Upload Audio',
  pengaturan: 'Pengaturan',
  baru: 'Tambah',
  edit: 'Edit',
};

function useBreadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean); // ['studio', 'kajian', ...]
  return segments.map((seg, i) => ({
    label: LABELS[seg] ?? decodeURIComponent(seg),
    to: '/' + segments.slice(0, i + 1).join('/'),
  }));
}

interface TopbarProps {
  onMenu: () => void;
}

export function Topbar({ onMenu }: TopbarProps) {
  const crumbs = useBreadcrumb();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/studio/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/85 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="Menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <nav className="flex items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => (
            <span key={c.to} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRightIcon className="h-3.5 w-3.5 text-slate-300" />}
              {i === crumbs.length - 1 ? (
                <span className="font-semibold text-slate-900 dark:text-white">{c.label}</span>
              ) : (
                <Link to={c.to} className="text-slate-500 hover:text-brand-primary dark:text-slate-400">
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Ganti tema"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        <div className="hidden items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3 dark:bg-white/5 sm:flex">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-primary text-xs font-bold text-white">
            {(user?.name ?? user?.login ?? 'A').charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {user?.name ?? user?.login ?? 'Admin'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Keluar"
          className="rounded-lg p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-500/10"
        >
          <LogoutIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
