import { expect, test } from '@playwright/test'

/** The Light / Dark / System theme toggle on public pages. Read-only. */

test('switches theme from the menu and remembers the choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/dark/)

  await page.getByRole('button', { name: /Change theme/ }).click()
  await page.getByRole('menuitemradio', { name: 'Dark' }).click()
  await expect(html).toHaveClass(/dark/)

  // Applied before first paint on the next load, and on other pages.
  await page.goto('/login')
  await expect(html).toHaveClass(/dark/)

  await page.getByRole('button', { name: /Change theme/ }).click()
  await page.getByRole('menuitemradio', { name: 'Light' }).click()
  await expect(html).not.toHaveClass(/dark/)
})

test('follows the device setting by default', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/login')
  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})
