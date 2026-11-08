import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests. They run the real app against the Supabase project in .env.
 *
 * - Signed-out tests only read public pages and never change data.
 * - The full workflow test runs only when E2E_EMAIL and E2E_PASSWORD are set.
 *   It creates one clearly labelled "[E2E]" application and deletes it again.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    // Stops Vite from opening a browser tab during test runs.
    env: { PLAYWRIGHT: '1' },
  },
})
