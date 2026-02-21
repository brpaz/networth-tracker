import type { Page } from '@playwright/test';
import type { Account } from '../../../app/types';
import { mockAccounts, mockAccountsApi } from './accounts';

export const mockNetworthHistory = [{ date: '2026-02-21', value: 110000 }];

export const mockByType = [
  { type: 'stocks', total: 55000 },
  { type: 'bonds', total: 25000 },
  { type: 'cash', total: 20000 },
  { type: 'crypto', total: 10000 },
];

export async function mockDashboardApi(page: Page, accounts: Account[] = mockAccounts) {
  await mockAccountsApi(page, accounts);

  await page.route('**/api/stats/networth', async (route) => {
    await route.fulfill({ json: mockNetworthHistory });
  });

  await page.route('**/api/stats/by-type', async (route) => {
    await route.fulfill({ json: mockByType });
  });
}
