import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { SearchModal } from './SearchModal';
import { SearchIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon, PlayIcon } from './icons';
import { cn } from '../lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/kajian', label: 'Kajian Terbaru' },
  { to: '/kitab', label: 'Kitab' },
  { to: '/ustadz', label: 'Ustadz' },
  { to: '/tentang', label: 'Tentang' },
];

export function Navbar() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard shortcut: "/" opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 transition-all duration-300',
          scrolled
            ? 'border-b border-slate-200/70 bg-white/85 backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/85'
            : 'bg-transparent',
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-md">
              <PlayIcon className="h-4 w-4 text-brand-accent" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Muslimsolo<span className="text-brand-primary dark:text-brand-accent"> Audio</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary dark:bg-white/10 dark:text-brand-accent'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Cari kajian"
              className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Ganti tema"
              className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"
            >
              {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="animate-fade-in border-t border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/95 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-white/10 dark:text-brand-accent'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
