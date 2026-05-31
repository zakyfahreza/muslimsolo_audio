import { Routes, Route } from 'react-router-dom';
import { PublicRoutes } from './routes/PublicRoutes';
import { StudioRoutes } from './routes/StudioRoutes';

export default function App() {
  return (
    <Routes>
      {/* Admin studio is a self-contained app under /studio/* */}
      <Route path="/studio/*" element={<StudioRoutes />} />
      {/* Everything else is the public site */}
      <Route path="/*" element={<PublicRoutes />} />
    </Routes>
  );
}
