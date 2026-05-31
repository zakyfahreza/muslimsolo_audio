import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toaster } from '../ui/Toaster';
import { useAuthStore } from '../../store/authStore';

/** Auth-guarded shell for the admin studio: sidebar + topbar + content. */
export function StudioLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/studio/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
