import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AudioEngine } from '../components/AudioEngine';
import { KajianGridSkeleton } from '../components/Skeleton';
import { HomePage } from '../pages/HomePage';

const KajianListPage = lazy(() =>
  import('../pages/KajianListPage').then((m) => ({ default: m.KajianListPage })),
);
const KajianDetailPage = lazy(() =>
  import('../pages/KajianDetailPage').then((m) => ({ default: m.KajianDetailPage })),
);
const KitabListPage = lazy(() =>
  import('../pages/KitabListPage').then((m) => ({ default: m.KitabListPage })),
);
const KitabDetailPage = lazy(() =>
  import('../pages/KitabDetailPage').then((m) => ({ default: m.KitabDetailPage })),
);
const UstadzListPage = lazy(() =>
  import('../pages/UstadzListPage').then((m) => ({ default: m.UstadzListPage })),
);
const UstadzDetailPage = lazy(() =>
  import('../pages/UstadzDetailPage').then((m) => ({ default: m.UstadzDetailPage })),
);
const CollectionPage = lazy(() =>
  import('../pages/CollectionPage').then((m) => ({ default: m.CollectionPage })),
);
const StatsPage = lazy(() => import('../pages/StatsPage').then((m) => ({ default: m.StatsPage })));
const AboutPage = lazy(() => import('../pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function PageFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <KajianGridSkeleton />
    </div>
  );
}

const wrap = (node: React.ReactNode) => <Suspense fallback={<PageFallback />}>{node}</Suspense>;

export function PublicRoutes() {
  return (
    <>
      <AudioEngine />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="kajian" element={wrap(<KajianListPage />)} />
          <Route path="kajian/:id" element={wrap(<KajianDetailPage />)} />
          <Route path="kitab" element={wrap(<KitabListPage />)} />
          <Route path="kitab/:slug" element={wrap(<KitabDetailPage />)} />
          <Route path="ustadz" element={wrap(<UstadzListPage />)} />
          <Route path="ustadz/:slug" element={wrap(<UstadzDetailPage />)} />
          <Route path="koleksi" element={wrap(<CollectionPage />)} />
          <Route path="statistik" element={wrap(<StatsPage />)} />
          <Route path="tentang" element={wrap(<AboutPage />)} />
          <Route path="*" element={wrap(<NotFoundPage />)} />
        </Route>
      </Routes>
    </>
  );
}
