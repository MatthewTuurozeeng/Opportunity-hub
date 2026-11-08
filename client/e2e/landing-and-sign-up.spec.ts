import { expect, test } from '@playwright/test'

/** Public pages: the landing page, and the way from sign-in to sign-up. Read-only. */

test.describe('landing page', () => {
  test('introduces the app and offers sign-up and sign-in', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: /Every application, from first find to final answer/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Everything an application needs, in one place' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Private by design' })).toBeVisible()

    await page.getByRole('link', { name: 'Get started' }).click()
    await expect(page).toHaveURL(/\/sign-up$/)
  })

  test('fits the screen without sideways scrolling', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

test.describe('sign-up', () => {
  test('is linked from the sign-in page', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText("Don't have an account?")).toBeVisible()
    await page.getByRole('link', { name: 'Sign up' }).click()

    await expect(page).toHaveURL(/\/sign-up$/)
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.getByText(/invite-only/i)).toBeVisible()
  })

  test('validates the form before creating anything', async ({ page }) => {
    await page.goto('/sign-up')

    await page.getByLabel('Full name').fill('Test Person')
    await page.getByLabel('Email').fill('test@example.test')
    await page.getByLabel('Password', { exact: true }).fill('weak')
    await page.getByLabel('Confirm password').fill('different')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Use at least 10 characters.')).toBeVisible()
    await expect(page.getByText('Passwords do not match.')).toBeVisible()
    await expect(page).toHaveURL(/\/sign-up$/)
  })

  test('links back to sign-in and home', async ({ page }) => {
    await page.goto('/sign-up')

    await page.getByRole('link', { name: '← Back to home' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
