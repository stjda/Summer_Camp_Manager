import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  optimizeDeps: {
    include: [
      "@mui/material/Box",
    ],
 },
  logLevel: 'info',
  plugins: [
    react(),
    VitePWA({
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'css-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'script',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: ({ url }) => url.href.includes('googleusercontent.com'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          },
        ],
      },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'robots.txt', '**/*.jpg', '**/*.png', 'icons/*.png', 'screenshots/*.png', 'images/*.png'], // Include all assets to be cached
      manifest: {
        name: 'STJDACampManager',
        short_name: 'SVGGen',
        description: 'A camp manger for STJDA',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/', // start URL for GitHub Pages
        id: '/', //  a consistent ID for the app
        scope: '/', // the scope to restrict what URLs are considered part of the app
        icons: [
          // Include square icons as required by most devices
          {
            src: '192x192Icon.png', // path to the icon
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any', // Can be used as app icon and shortcut icon
          },
          // More icon sizes can be included here, for example, 512x512
          {
            src: '512x512Icon.png', // Provide the correct path to the icon
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        screenshots: [
          // Include screenshots to provide a preview during PWA installation
          {
            src: 'Screenshot1280x720.png', // Path to the desktop screenshot
            sizes: '1280x720',
            type: 'image/png',
            label: 'Desktop Screenshot',
            form_factor: 'wide',
          },
          {
            src: 'Screenshot640x1136.png', // Path to the mobile screenshot these sizes must be exact
            sizes: '640x1136',
            type: 'image/png',
            label: 'Mobile Screenshot',
            form_factor: 'narrow',
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@mui/material'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});