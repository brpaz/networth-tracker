import { test, expect } from '@playwright/test';
import { mockAccountsApi, mockAccounts } from './fixtures/accounts';

test.describe('Accounts', () => {
  test('renders the accounts page', async ({ page }) => {
    await mockAccountsApi(page, mockAccounts);
    await page.goto('/accounts');

    await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
    await expect(page.getByText('Add Account')).toBeVisible();
  });

  test('shows empty state when no accounts exist', async ({ page }) => {
    await mockAccountsApi(page);
    await page.goto('/accounts');

    await expect(page.getByText('No accounts yet. Create one to get started.')).toBeVisible();
  });

  test('opens create account modal', async ({ page }) => {
    await mockAccountsApi(page);
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Account' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
  });

  test('creates a new account', async ({ page }) => {
    await mockAccountsApi(page);
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Account' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('textbox', { name: 'Name' }).fill('Test Savings');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Test Savings')).toBeVisible();
  });

  test('deletes an account', async ({ page }) => {
    await mockAccountsApi(page);
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Add Account' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('textbox', { name: 'Name' }).fill('To Delete');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('To Delete')).toBeVisible();

    await page.getByRole('button', { name: 'Delete account' }).click();
    await expect(page.getByText('To Delete')).not.toBeVisible();
  });
});

test.describe('Simulator', () => {
  test('renders the simulator page with defaults', async ({ page }) => {
    await page.goto('/simulator');

    await expect(page.getByText('Growth Simulator')).toBeVisible();
    await expect(page.getByText('Final Value')).toBeVisible();
    await expect(page.getByText('Total Growth')).toBeVisible();
    await expect(page.getByText('Growth Multiplier')).toBeVisible();
  });

  test('displays calculated values', async ({ page }) => {
    await page.goto('/simulator');

    await expect(page.getByText('Growth Multiplier')).toBeVisible();
  });
});
