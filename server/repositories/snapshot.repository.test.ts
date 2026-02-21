import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { createTestDatabase, closeTestDatabase, getTestDatabase } from '../test/setup-db';

vi.mock('../database', () => ({
  useDatabase: () => getTestDatabase(),
}));

import { useSnapshotRepository } from './snapshot.repository';
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

describe('useSnapshotRepository', () => {
  let repo: ReturnType<typeof useSnapshotRepository>;

  beforeEach(() => {
    repo = useSnapshotRepository();
  });

  describe('create', () => {
    it('inserts and returns the new snapshot', async () => {
      const account = insertAccount();

      const result = await repo.create({ accountId: account.id, value: 5000 });

      expect(result.id).toBeDefined();
      expect(result.accountId).toBe(account.id);
      expect(result.value).toBe(5000);
      expect(result.recordedAt).toBeDefined();
    });

    it('auto-increments id', async () => {
      const account = insertAccount();

      const first = await repo.create({ accountId: account.id, value: 1000 });
      const second = await repo.create({ accountId: account.id, value: 2000 });

      expect(second.id).toBeGreaterThan(first.id);
    });
  });

  describe('findById', () => {
    it('returns snapshot when found', async () => {
      const account = insertAccount();
      const created = await repo.create({ accountId: account.id, value: 5000 });

      const result = await repo.findById(created.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(created.id);
      expect(result!.value).toBe(5000);
      expect(result!.accountId).toBe(account.id);
    });

    it('returns undefined when snapshot does not exist', async () => {
      const result = await repo.findById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('findByAccountId', () => {
    it('returns snapshots ordered by recordedAt desc', async () => {
      const db = getTestDatabase();
      const account = insertAccount();

      db.insert(accountSnapshots)
        .values({ accountId: account.id, value: 1000, recordedAt: new Date(1000000) })
        .run();
      db.insert(accountSnapshots)
        .values({ accountId: account.id, value: 3000, recordedAt: new Date(3000000) })
        .run();
      db.insert(accountSnapshots)
        .values({ accountId: account.id, value: 2000, recordedAt: new Date(2000000) })
        .run();

      const result = await repo.findByAccountId(account.id);

      expect(result).toHaveLength(3);
      expect(result[0].value).toBe(3000);
      expect(result[1].value).toBe(2000);
      expect(result[2].value).toBe(1000);
    });

    it('respects custom limit parameter', async () => {
      const account = insertAccount();
      await repo.create({ accountId: account.id, value: 1000 });
      await repo.create({ accountId: account.id, value: 2000 });
      await repo.create({ accountId: account.id, value: 3000 });

      const result = await repo.findByAccountId(account.id, 2);

      expect(result).toHaveLength(2);
    });

    it('defaults to limit of 100', async () => {
      const account = insertAccount();
      await repo.create({ accountId: account.id, value: 1000 });

      const result = await repo.findByAccountId(account.id);

      expect(result).toHaveLength(1);
    });

    it('returns empty array when no snapshots exist', async () => {
      const account = insertAccount();

      const result = await repo.findByAccountId(account.id);

      expect(result).toEqual([]);
    });

    it('only returns snapshots for the specified account', async () => {
      const account1 = insertAccount({ name: 'Account 1' });
      const account2 = insertAccount({ name: 'Account 2' });
      await repo.create({ accountId: account1.id, value: 1000 });
      await repo.create({ accountId: account2.id, value: 2000 });

      const result = await repo.findByAccountId(account1.id);

      expect(result).toHaveLength(1);
      expect(result[0].accountId).toBe(account1.id);
    });
  });

  describe('deleteById', () => {
    it('deletes and returns the snapshot', async () => {
      const account = insertAccount();
      const created = await repo.create({ accountId: account.id, value: 5000 });

      const result = await repo.deleteById(created.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(created.id);
      expect(result!.value).toBe(5000);
    });

    it('returns undefined when snapshot does not exist', async () => {
      const result = await repo.deleteById(999);
      expect(result).toBeUndefined();
    });

    it('actually removes the snapshot from database', async () => {
      const account = insertAccount();
      const created = await repo.create({ accountId: account.id, value: 5000 });

      await repo.deleteById(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeUndefined();
    });
  });
});
