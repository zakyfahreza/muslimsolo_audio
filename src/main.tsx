import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { initTheme } from './store/themeStore';
import './index.css';

// Apply persisted theme before first paint.
initTheme();

// When the PWA service worker updates in the background and takes control,
// reload once so the page shows the freshly deployed content instead of the
// previously cached version. Guarded to avoid reload loops.
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// React Router basename derived from the Vite base path so deep links work
// on GitHub Pages project sites (served from /<repo>/).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
