import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/work-grid-system/';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg', 'favicon.png', 'favicon-32.png', 'avatars/*.svg'],
      manifest: {
        name: 'Grafik Pracy',
        short_name: 'Grafik',
        description: 'Grafiki, urlopy i zamówienia dla kierowników sklepów',
        theme_color: '#1e293b',
        background_color: '#fafafa',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'pl',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  css: {
    postcss: null,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base,
  test: {
    environment: 'node',
  },
});
