import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// IMPORTANT: base path must match how the site is served.
// - Custom domain (e.g. audio.muslimsolo.web.id) or user/org page  -> "/"
// - GitHub Pages project site (https://<user>.github.io/<repo>/)   -> "/<repo>/"
// This project uses the custom domain audio.muslimsolo.web.id, so default to "/".
// Override at build time when needed:  BASE_PATH=/muslimsolo_audio/ npm run build
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/icon.svg'],
      manifest: {
        name: 'Muslimsolo Audio',
        short_name: 'Muslimsolo',
        description: 'Streaming kajian Islam - dengarkan kajian kapan saja.',
        theme_color: '#0F766E',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff2}'],
        // Take control of open pages as soon as a new SW activates, so updated
        // content appears without needing a second manual reload.
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/studio\/login/],
        runtimeCaching: [
          {
            // Audio is streamed straight from Cloudflare R2. We use
            // NetworkOnly so the service worker never intercepts/caches it:
            // R2's public r2.dev bucket sends no CORS headers, so caching
            // produced opaque/partial responses that broke playback & seeking.
            // Letting the browser handle audio natively makes playback reliable.
            urlPattern: ({ url }) => url.href.includes('.mp3') || url.href.includes('/audio/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
