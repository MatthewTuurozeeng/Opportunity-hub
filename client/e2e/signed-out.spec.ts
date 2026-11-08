import { expect, test } from '@playwright/test'

/** Read-only checks of what a signed-out visitor sees. Nothing is created or changed. */

const PROTECTED_PATHS = ['/dashboard', '/applications', '/documents', '/communications', '/calendar', '/notes', '/settings']

test.describe('signed-out visitors', () => {
  for (const path of PROTECTED_PATHS) {
    test(`are sent from ${path} to the sign-in page`, async ({ page }) => {
      await page.goto(path)

      await expect(page).toHaveURL(/\/login$/)
      await expect(page.getByRole('heading', { name: 'Sign in to OpportunityHub' })).toBeVisible()
    })
  }

  test('see validation errors instead of a sign-in attempt for an empty form', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Enter a valid email address.')).toBeVisible()
    await expect(page.getByText('Enter your password.')).toBeVisible()
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('get a clear error for wrong credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('not-the-owner@example.test')
    await page.getByLabel('Password').fill('definitely-wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('see a sign-in page that fits the screen without sideways scrolling', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Sign in to OpportunityHub' })).toBeVisible()

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
