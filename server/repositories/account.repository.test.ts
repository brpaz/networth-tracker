import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { createTestDatabase, closeTestDatabase, getTestDatabase } from '../test/setup-db';

vi.mock('../database', () => ({
  useDatabase: () => getTestDatabase(),
}));

import { useAccountRepository } from './account.repository';
import { accounts, accountSnapshots } from '../database/schema';

beforeEach(() => {
  createTestDatabase();
});

afterAll(() => {
  closeTestDatabase();
});

describe('useAccountRepository', () => {
  let repo: ReturnType<typeof useAccountRepository>;

  beforeEach(() => {
    repo = useAccountRepository();
  });

  describe('findAll', () => {
    it('returns empty array when no accounts exist', async () => {
      const result = await repo.findAll();
      expect(result).toEqual([]);
    });

    it('returns accounts ordered by updatedAt desc', async () => {
      const db = getTestDatabase();
      const past = new Date(Date.now() - 60000);
      const now = new Date();
      db.insert(accounts)
        .values({ name: 'Older', type: 'cash', currency: 'EUR', updatedAt: past })
        .run();
      db.insert(accounts)
        .values({ name: 'Newer', type: 'stocks', currency: 'USD', updatedAt: now })
        .run();

      const result = await repo.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Newer');
      expect(result[1].name).toBe('Older');
    });

    it('includes currentValue from latest snapshot', async () => {
      const db = getTestDatabase();
      const [account] = db
        .insert(accounts)
        .values({ name: 'Savings', type: 'cash', currency: 'EUR' })
        .returning()
        .all();
      const earlier = new Date(Date.now() - 60000);
      const later = new Date();
      db.insert(accountSnapshots)
        .values({ accountId: account.id, value: 1000, recordedAt: earlier })
        .run();
      db.insert(accountSnapshots)
        .values({ accountId: account.id, value: 2000, recordedAt: later })
        .run();

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].currentValue).toBe(2000);
    });

    it('returns null currentValue when no snapshots exist', async () => {
      const db = getTestDatabase();
      db.insert(accounts).values({ name: 'Empty', type: 'cash', currency: 'EUR' }).run();

      const result = await repo.findAll();

      expect(result[0].currentValue).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns account when found', async () => {
      const db = getTestDatabase();
      const [created] = db
        .insert(accounts)
        .values({ name: 'Stocks', type: 'stocks', currency: 'USD' })
        .returning()
        .all();

      const result = await repo.findById(created.id);

      expect(result).toBeDefined();
      expect(result!.name).toBe('Stocks');
      expect(result!.type).toBe('stocks');
      expect(result!.currency).toBe('USD');
    });

    it('returns undefined for non-existent account', async () => {
      const result = await repo.findById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('inserts and returns the new account', async () => {
      const result = await repo.create({ name: 'Savings', type: 'cash', currency: 'EUR' });

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Savings');
      expect(result.type).toBe('cash');
      expect(result.currency).toBe('EUR');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('auto-increments id', async () => {
      const first = await repo.create({ name: 'First', type: 'cash', currency: 'EUR' });
      const second = await repo.create({ name: 'Second', type: 'stocks', currency: 'USD' });

      expect(second.id).toBeGreaterThan(first.id);
    });
  });

  describe('update', () => {
    it('updates and returns the account', async () => {
      const created = await repo.create({ name: 'Old Name', type: 'cash', currency: 'EUR' });

      const result = await repo.update(created.id, { name: 'New Name' });

      expect(result.id).toBe(created.id);
      expect(result.name).toBe('New Name');
      expect(result.type).toBe('cash');
    });

    it('updates only specified fields', async () => {
      const created = await repo.create({ name: 'Test', type: 'cash', currency: 'EUR' });

      const result = await repo.update(created.id, { currency: 'USD' });

      expect(result.name).toBe('Test');
      expect(result.currency).toBe('USD');
    });
  });

  describe('delete', () => {
    it('deletes the account by id', async () => {
      const created = await repo.create({ name: 'ToDelete', type: 'cash', currency: 'EUR' });

      await repo.delete(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('cascades deletion to snapshots', async () => {
      const db = getTestDatabase();
      const created = await repo.create({ name: 'WithSnapshots', type: 'cash', currency: 'EUR' });
      db.insert(accountSnapshots).values({ accountId: created.id, value: 1000 }).run();

      await repo.delete(created.id);

      const snapshots = db.select().from(accountSnapshots).all();
      expect(snapshots).toHaveLength(0);
    });
  });

  describe('touchUpdatedAt', () => {
    it('updates the updatedAt timestamp', async () => {
      const created = await repo.create({ name: 'Touch', type: 'cash', currency: 'EUR' });
      const originalUpdatedAt = created.updatedAt;

      await new Promise((r) => setTimeout(r, 1100));
      await repo.touchUpdatedAt(created.id);

      const updated = await repo.findById(created.id);
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });
});
