import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudioLayout } from '../components/studio/StudioLayout';
import { Spinner } from '../components/ui/Spinner';

const LoginPage = lazy(() => import('../pages/studio/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import('../pages/studio/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const KitabPage = lazy(() => import('../pages/studio/KitabPage').then((m) => ({ default: m.KitabPage })));
const StudioKitabDetailPage = lazy(() =>
  import('../pages/studio/KitabDetailPage').then((m) => ({ default: m.StudioKitabDetailPage })),
);
const KajianPage = lazy(() =>
  import('../pages/studio/KajianPage').then((m) => ({ default: m.KajianPage })),
);
const KajianWizardPage = lazy(() =>
  import('../pages/studio/KajianWizardPage').then((m) => ({ default: m.KajianWizardPage })),
);
const BulkUploadPage = lazy(() =>
  import('../pages/studio/BulkUploadPage').then((m) => ({ default: m.BulkUploadPage })),
);
const SettingsPage = lazy(() =>
  import('../pages/studio/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function StudioFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 text-brand-primary dark:bg-slate-950">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function StudioRoutes() {
  return (
    <Suspense fallback={<StudioFallback />}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<StudioLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="kitab" element={<KitabPage />} />
          <Route path="kitab/:kitabId" element={<StudioKitabDetailPage />} />
          <Route path="kajian" element={<KajianPage />} />
          <Route path="kajian/baru" element={<KajianWizardPage />} />
          <Route path="kajian/:id/edit" element={<KajianWizardPage />} />
          <Route path="upload" element={<BulkUploadPage />} />
          <Route path="pengaturan" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
