import { NavLink } from 'react-router-dom';
import {
  GridIcon,
  BookIcon,
  PlayIcon,
  UploadIcon,
  SettingsIcon,
  ExternalIcon,
} from '../icons';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const NAV = [
  { to: '/studio', label: 'Dashboard', Icon: GridIcon, end: true },
  { to: '/studio/kitab', label: 'Kitab', Icon: BookIcon },
  { to: '/studio/kajian', label: 'Kajian', Icon: PlayIcon },
  { to: '/studio/upload', label: 'Upload Audio', Icon: UploadIcon },
  { to: '/studio/pengaturan', label: 'Pengaturan', Icon: SettingsIcon },
];

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const config = useAuthStore((s) => s.config);
  const live = !config.mockMode && Boolean(config.githubRepo && config.workerUrl);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onNavigate}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-white/10 dark:bg-slate-900 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-md">
            <PlayIcon className="h-4 w-4 text-brand-accent" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              muslimsolo.id
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-primary dark:text-brand-accent">
              Studio
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 dark:bg-brand-primary'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="space-y-3 border-t border-slate-200 p-3 dark:border-white/10">
          <a
            href={import.meta.env.BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
          >
            <ExternalIcon className="h-4 w-4" />
            Lihat situs publik
          </a>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-white/5">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                live ? 'bg-emerald-500' : 'bg-amber-500',
              )}
            />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {live ? 'Mode Live' : 'Mode Demo'}
              </p>
              <p className="text-[11px] text-slate-400">
                {live ? 'R2 & GitHub aktif' : 'Perubahan lokal'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
