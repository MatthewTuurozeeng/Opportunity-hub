import { expect, test } from '@playwright/test'

/**
 * Checks of the production build: installability, the service worker, and the
 * security headers from vercel.json. Run against `npm run preview`:
 *
 *   npm run build && npm run preview   (in one terminal)
 *   E2E_BASE_URL=http://localhost:4173 npm run test:e2e
 *
 * Read-only: nothing is created or changed.
 */

test.skip(!process.env.E2E_BASE_URL, 'Set E2E_BASE_URL to the production build (npm run preview) to run these checks.')

test('serves a web app manifest with installable icons', async ({ page, request }) => {
  await page.goto('/login')

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(manifestHref).toBeTruthy()

  const manifest = await (await request.get(manifestHref!)).json()
  expect(manifest).toMatchObject({ name: 'OpportunityHub', display: 'standalone', start_url: '/dashboard' })
  const iconSizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes)
  expect(iconSizes).toEqual(expect.arrayContaining(['192x192', '512x512']))
  expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable')).toBe(true)
})

test('registers a service worker', async ({ page }) => {
  await page.goto('/login')

  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)
  expect(new URL(scope).pathname).toBe('/')
})

test('sends the security headers', async ({ request }) => {
  const response = await request.get('/login')
  const headers = response.headers()

  expect(headers['content-security-policy']).toContain("default-src 'self'")
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
})

test('the Content Security Policy does not block the app', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' && /Content Security Policy|Refused to/i.test(message.text())) {
      violations.push(message.text())
    }
  })

  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Sign in to OpportunityHub' })).toBeVisible()
  // The sign-in page asks Supabase whether an owner exists, so this proves API calls are allowed.
  await page.waitForLoadState('networkidle')

  expect(violations).toEqual([])
})
