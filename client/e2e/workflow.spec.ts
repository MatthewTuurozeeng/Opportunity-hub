import { expect, test } from '@playwright/test'

/**
 * The main signed-in workflow, end to end, against the real Supabase project.
 *
 * Opt-in: runs only when E2E_EMAIL and E2E_PASSWORD are set, e.g.
 *   E2E_EMAIL=you@example.com E2E_PASSWORD=... npm run test:e2e -- --project=desktop
 *
 * It creates one application titled "[E2E] …", works through it, and deletes it
 * at the end (deleting it also removes its events and communications).
 */

const email = process.env.E2E_EMAIL
const password = process.env.E2E_PASSWORD

test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run the signed-in workflow.')
// One run is enough: the workflow writes real records.
test.skip(({ isMobile }) => isMobile, 'The workflow runs on desktop only.')

test('records an application, tracks it and deletes it again', async ({ page }) => {
  const title = `[E2E] Workflow ${Date.now()}`

  await test.step('sign in', async () => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(email!)
    await page.getByLabel('Password').fill(password!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  await test.step('create an application', async () => {
    await page.goto('/applications/new')
    await page.getByLabel(/Opportunity title/).fill(title)
    await page.getByLabel(/Organization or institution/).fill('End-to-end test')
    await page.getByRole('button', { name: /Save/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  })

  try {
    await test.step('change its status with a note', async () => {
      await page.getByRole('button', { name: 'Change status' }).click()
      await page.getByLabel('New status').selectOption('submitted')
      await page.getByLabel('Note (optional)').fill('Submitted by the end-to-end test.')
      await page.getByRole('button', { name: 'Save status' }).click()
      await expect(page.getByText('Status changed to Submitted.')).toBeVisible()
    })

    await test.step('see the change in the timeline', async () => {
      await page.getByRole('tab', { name: 'Timeline' }).click()
      await expect(page.getByText('Submitted by the end-to-end test.')).toBeVisible()
    })

    await test.step('schedule an interview', async () => {
      await page.getByRole('button', { name: 'Add event' }).first().click()
      const dialog = page.getByRole('dialog')
      await dialog.getByLabel(/^Type/).selectOption('interview')
      await dialog.getByLabel(/^Title/).fill('E2E interview')
      await dialog.getByLabel(/^Date/).fill('2099-01-15')
      await dialog.getByLabel(/Start time/).fill('10:00')
      await dialog.getByRole('button', { name: 'Add event' }).click()
      await expect(page.getByText('Event added.')).toBeVisible()
      await expect(page.getByText('E2E interview').first()).toBeVisible()
    })

    await test.step('log a communication', async () => {
      await page.getByRole('tab', { name: 'Communication' }).click()
      await page.getByRole('button', { name: 'Log communication' }).click()
      const dialog = page.getByRole('dialog')
      await dialog.getByLabel(/^Subject/).fill('E2E confirmation email')
      await dialog.getByRole('button', { name: 'Log communication' }).click()
      await expect(page.getByText('Communication logged.')).toBeVisible()
      await expect(page.getByText('E2E confirmation email')).toBeVisible()
    })
  } finally {
    await test.step('delete the application', async () => {
      await page.getByRole('button', { name: 'Delete', exact: true }).click()
      await page.getByRole('button', { name: 'Delete application' }).click()
      await expect(page).toHaveURL(/\/applications$/)
      await expect(page.getByText(title)).toHaveCount(0)
    })
  }
})
