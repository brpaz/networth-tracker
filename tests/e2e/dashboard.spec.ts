import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('renders the dashboard page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Total Net Worth')).toBeVisible()
    await expect(page.getByText('Net Worth Evolution')).toBeVisible()
    await expect(page.getByText('By Account Type')).toBeVisible()
    await expect(page.getByText('Accounts')).toBeVisible()
  })

  test('shows navigation sidebar', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Accounts' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Simulator' })).toBeVisible()
  })

  test('navigates to accounts page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Accounts' }).click()
    await expect(page).toHaveURL('/accounts')
    await expect(page.getByText('Add Account')).toBeVisible()
  })

  test('navigates to simulator page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Simulator' }).click()
    await expect(page).toHaveURL('/simulator')
    await expect(page.getByText('Growth Simulator')).toBeVisible()
  })
})
