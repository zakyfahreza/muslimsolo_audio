import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// IMPORTANT: For GitHub Pages project sites the app is served from
// https://<user>.github.io/<repo>/  — set `base` to "/<repo>/".
// If you deploy to a custom domain (e.g. muslimsolo.id) or a user/org page,
// set base to "/". Override at build time with:  BASE_PATH=/ npm run build
const base = process.env.BASE_PATH ?? '/muslimsolo_audio/';

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
        navigateFallbackDenylist: [/^\/studio\/login/],
        runtimeCaching: [
          {
            // Cache audio streamed from Cloudflare R2 for offline / repeat plays.
            urlPattern: ({ url }) => url.href.includes('.mp3') || url.href.includes('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
              },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            },
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
