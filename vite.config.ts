import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'images/*.jpg'],
      manifest: {
        name: 'Passive Attendance Counter',
        short_name: 'AttendCount',
        description: 'Passive people counting and attendance tracking using face detection',
        theme_color: '#2563eb',
        icons: [
          {
            src: '/images/logo-congrecount.jpg',
            sizes: '192x192 512x512',
            type: 'image/jpeg'
          }
        ],
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-resources',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
