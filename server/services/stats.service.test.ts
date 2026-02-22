import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { createTestDatabase, closeTestDatabase, getTestDatabase } from '../test/setup-db';

vi.mock('../database', () => ({
  useDatabase: () => getTestDatabase(),
}));

import { useStatsService } from './stats.service';
import { accounts, accountSnapshots } from '../database/schema';

beforeEach(() => {
  createTestDatabase();
});

afterAll(() => {
  closeTestDatabase();
});

function insertAccount(overrides: Partial<{ name: string; type: string; currency: string }> = {}) {
  const db = getTestDatabase();
  const [account] = db
    .insert(accounts)
    .values({ name: 'Test Account', type: 'cash', currency: 'EUR', ...overrides })
    .returning()
    .all();
  return account;
}

function insertSnapshot(accountId: number, value: number, recordedAt?: Date) {
  const db = getTestDatabase();
  const values: { accountId: number; value: number; recordedAt?: Date } = { accountId, value };
  if (recordedAt) {
    values.recordedAt = recordedAt;
  }
  db.insert(accountSnapshots).values(values).run();
}

describe('useStatsService', () => {
  let service: ReturnType<typeof useStatsService>;

  beforeEach(() => {
    service = useStatsService();
  });

  describe('getNetWorthHistory', () => {
    it('returns empty array when no snapshots exist', async () => {
      const result = await service.getNetWorthHistory();
      expect(result).toEqual([]);
    });

    it('returns aggregated daily net worth', async () => {
      const account1 = insertAccount({ name: 'Cash', type: 'cash' });
      const account2 = insertAccount({ name: 'Stocks', type: 'stocks' });

      const today = new Date();
      insertSnapshot(account1.id, 5000, today);
      insertSnapshot(account2.id, 3000, today);

      const result = await service.getNetWorthHistory();

      expect(result.length).toBeGreaterThanOrEqual(1);
      const latest = result[result.length - 1] as { date: string; total: number };
      expect(latest.total).toBe(8000);
    });

    it('takes latest snapshot per account per day', async () => {
      const account = insertAccount();
      const now = new Date();

      insertSnapshot(account.id, 1000, new Date(now.getTime() - 60000));
      insertSnapshot(account.id, 2000, now);

      const result = await service.getNetWorthHistory();

      expect(result.length).toBeGreaterThanOrEqual(1);
      const latest = result[result.length - 1] as { date: string; total: number };
      expect(latest.total).toBe(2000);
    });

    it('returns results ordered by date ascending', async () => {
      const account = insertAccount();
      const now = Date.now();

      insertSnapshot(account.id, 1000, new Date(now - 86400000 * 2));
      insertSnapshot(account.id, 2000, new Date(now - 86400000));
      insertSnapshot(account.id, 3000, new Date(now));

      const result = await service.getNetWorthHistory();

      expect(result.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < result.length; i++) {
        expect((result[i] as { date: string }).date >= (result[i - 1] as { date: string }).date).toBe(true);
      }
    });
  });

  describe('getByType', () => {
    it('returns empty array when no accounts exist', async () => {
      const result = await service.getByType();
      expect(result).toEqual([]);
    });

    it('returns totals grouped by account type', async () => {
      const cash1 = insertAccount({ name: 'Cash 1', type: 'cash' });
      const cash2 = insertAccount({ name: 'Cash 2', type: 'cash' });
      const stocks = insertAccount({ name: 'Stocks', type: 'stocks' });

      insertSnapshot(cash1.id, 1000);
      insertSnapshot(cash2.id, 2000);
      insertSnapshot(stocks.id, 5000);

      const result = await service.getByType();

      const cashResult = (result as { type: string; total: number }[]).find((r) => r.type === 'cash');
      const stocksResult = (result as { type: string; total: number }[]).find((r) => r.type === 'stocks');

      expect(cashResult).toBeDefined();
      expect(cashResult!.total).toBe(3000);
      expect(stocksResult).toBeDefined();
      expect(stocksResult!.total).toBe(5000);
    });

    it('uses latest snapshot value per account', async () => {
      const account = insertAccount({ type: 'cash' });
      const now = Date.now();

      insertSnapshot(account.id, 1000, new Date(now - 60000));
      insertSnapshot(account.id, 3000, new Date(now));

      const result = await service.getByType();

      const cashResult = (result as { type: string; total: number }[]).find((r) => r.type === 'cash');
      expect(cashResult).toBeDefined();
      expect(cashResult!.total).toBe(3000);
    });

    it('returns null total for accounts without snapshots', async () => {
      insertAccount({ type: 'bonds' });

      const result = await service.getByType();

      const bondsResult = (result as { type: string; total: number | null }[]).find((r) => r.type === 'bonds');
      expect(bondsResult).toBeDefined();
      expect(bondsResult!.total).toBeNull();
    });
  });
});
