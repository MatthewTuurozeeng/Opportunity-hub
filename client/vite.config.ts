/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Fixed port so it always matches the Supabase Site URL / redirect URLs.
    port: 5173,
    strictPort: true,
    // Open the app in the system's default browser on `npm run dev` (not during end-to-end tests).
    open: process.env.PLAYWRIGHT !== '1',
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
