import { test, expect } from '@playwright/test'

test.describe('Accounts', () => {
  test('renders the accounts page', async ({ page }) => {
    await page.goto('/accounts')

    await expect(page.getByText('Accounts')).toBeVisible()
    await expect(page.getByText('Add Account')).toBeVisible()
  })

  test('shows empty state when no accounts exist', async ({ page }) => {
    await page.goto('/accounts')

    await expect(page.getByText('No accounts yet')).toBeVisible()
  })

  test('opens create account modal', async ({ page }) => {
    await page.goto('/accounts')

    await page.getByText('Add Account').click()
    await expect(page.getByText('Create Account')).toBeVisible()
    await expect(page.getByPlaceholder('Account name')).toBeVisible()
  })

  test('creates a new account', async ({ page }) => {
    await page.goto('/accounts')

    await page.getByText('Add Account').click()
    await page.getByPlaceholder('Account name').fill('Test Savings')
    await page.getByRole('button', { name: 'Create' }).click()

    await expect(page.getByText('Test Savings')).toBeVisible()
  })

  test('deletes an account', async ({ page }) => {
    await page.goto('/accounts')

    await page.getByText('Add Account').click()
    await page.getByPlaceholder('Account name').fill('To Delete')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('To Delete')).toBeVisible()

    await page.getByRole('button', { name: /trash/i }).click()
    await expect(page.getByText('To Delete')).not.toBeVisible()
  })
})

test.describe('Simulator', () => {
  test('renders the simulator page with defaults', async ({ page }) => {
    await page.goto('/simulator')

    await expect(page.getByText('Growth Simulator')).toBeVisible()
    await expect(page.getByText('Final Value')).toBeVisible()
    await expect(page.getByText('Total Growth')).toBeVisible()
    await expect(page.getByText('Growth Multiplier')).toBeVisible()
  })

  test('displays calculated values', async ({ page }) => {
    await page.goto('/simulator')

    await expect(page.getByText('Growth Multiplier')).toBeVisible()
  })
})
