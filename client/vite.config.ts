/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import packageJson from './package.json' with { type: 'json' }

interface VercelConfig {
  headers: { source: string; headers: { key: string; value: string }[] }[]
}

/**
 * The security headers Vercel sends for every page (vercel.json), so
 * `npm run preview` behaves like production and breakages show up locally.
 */
function readSiteWideHeaders(): Record<string, string> {
  const vercelConfig = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as VercelConfig
  const siteWide = vercelConfig.headers.find((rule) => rule.source === '/(.*)')
  return Object.fromEntries((siteWide?.headers ?? []).map(({ key, value }) => [key, value]))
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Ask before updating, so a reload never interrupts unsaved work.
      registerType: 'prompt',
      manifest: {
        name: 'OpportunityHub',
        short_name: 'OpportunityHub',
        description: 'Organize, manage and track opportunity applications.',
        id: '/',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f6f8fb',
        theme_color: '#0f1b2d',
        categories: ['productivity', 'business'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Add Application', url: '/applications/new', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Calendar', url: '/calendar', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // Only the app shell (code, styles, fonts, icons) is stored for offline start-up.
        // Records and documents come from Supabase and are never cached (README section 9).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    // Fixed port so it always matches the Supabase Site URL / redirect URLs.
    port: 5173,
    strictPort: true,
    // Open the app in the system's default browser on `npm run dev` (not during end-to-end tests).
    open: process.env.PLAYWRIGHT !== '1',
  },
  preview: {
    port: 4173,
    strictPort: true,
    headers: readSiteWideHeaders(),
  },
  test: {
    // Logic tests run in Node. Component tests opt in to a browser-like DOM
    // with a `// @vitest-environment jsdom` comment at the top of the file.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // Playwright specs in e2e/ use their own runner.
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: ['src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
