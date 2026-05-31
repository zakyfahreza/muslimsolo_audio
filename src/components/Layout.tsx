import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingPlayer } from './FloatingPlayer';
import { usePlayerStore } from '../store/playerStore';

/** Scroll to top on route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function Layout() {
  const hasTrack = usePlayerStore((s) => s.currentIndex >= 0);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className={`flex-1 ${hasTrack ? 'pb-28 sm:pb-24' : ''}`}>
        <Outlet />
      </main>
      <Footer />
      <FloatingPlayer />
    </div>
  );
}
