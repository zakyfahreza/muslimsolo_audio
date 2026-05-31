import { Link } from 'react-router-dom';
import { PlayIcon } from './icons';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white/50 dark:border-white/10 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                <PlayIcon className="h-4 w-4 text-brand-accent" />
              </span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                Muslimsolo<span className="text-brand-primary dark:text-brand-accent"> Audio</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Streaming kajian Islam. Dengarkan rekaman dari berbagai kitab dan ustadz, kapan saja.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Jelajahi</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/kajian" className="hover:text-brand-primary dark:hover:text-brand-accent">Kajian Terbaru</Link></li>
              <li><Link to="/kitab" className="hover:text-brand-primary dark:hover:text-brand-accent">Daftar Kitab</Link></li>
              <li><Link to="/ustadz" className="hover:text-brand-primary dark:hover:text-brand-accent">Daftar Ustadz</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Koleksi Saya</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/koleksi" className="hover:text-brand-primary dark:hover:text-brand-accent">Bookmark & Favorit</Link></li>
              <li><Link to="/koleksi" className="hover:text-brand-primary dark:hover:text-brand-accent">Baru Diputar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Admin</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/studio" className="hover:text-brand-primary dark:hover:text-brand-accent">Dashboard Studio</Link></li>
              <li><Link to="/tentang" className="hover:text-brand-primary dark:hover:text-brand-accent">Tentang Kami</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400 dark:border-white/10">
          © {new Date().getFullYear()} Muslimsolo Audio. Dibuat untuk kemudahan menuntut ilmu.
        </div>
      </div>
    </footer>
  );
}
