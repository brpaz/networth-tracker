import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { createTestDatabase, closeTestDatabase, getTestDatabase } from '../test/setup-db';
import { NotFoundError } from '../errors';

vi.mock('../database', () => ({
  useDatabase: () => getTestDatabase(),
}));

import { useSnapshotService } from './snapshot.service';
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

describe('useSnapshotService', () => {
  let service: ReturnType<typeof useSnapshotService>;

  beforeEach(() => {
    service = useSnapshotService();
  });

  describe('recordSnapshot', () => {
    it('creates snapshot for existing account', async () => {
      const account = insertAccount();

      const result = await service.recordSnapshot({ accountId: account.id, value: 5000 });

      expect(result.id).toBeDefined();
      expect(result.accountId).toBe(account.id);
      expect(result.value).toBe(5000);
    });

    it('persists the snapshot to the database', async () => {
      const account = insertAccount();

      await service.recordSnapshot({ accountId: account.id, value: 3000 });

      const db = getTestDatabase();
      const snapshots = db.select().from(accountSnapshots).all();
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].value).toBe(3000);
    });

    it('throws NotFoundError when account does not exist', async () => {
      await expect(service.recordSnapshot({ accountId: 999, value: 100 })).rejects.toThrow(NotFoundError);

      const db = getTestDatabase();
      const snapshots = db.select().from(accountSnapshots).all();
      expect(snapshots).toHaveLength(0);
    });
  });

  describe('getAccountSnapshots', () => {
    it('returns snapshots for existing account', async () => {
      const account = insertAccount();
      const db = getTestDatabase();
      db.insert(accountSnapshots).values({ accountId: account.id, value: 1000 }).run();
      db.insert(accountSnapshots).values({ accountId: account.id, value: 2000 }).run();

      const result = await service.getAccountSnapshots(account.id);

      expect(result).toHaveLength(2);
    });

    it('respects custom limit', async () => {
      const account = insertAccount();
      const db = getTestDatabase();
      db.insert(accountSnapshots).values({ accountId: account.id, value: 1000 }).run();
      db.insert(accountSnapshots).values({ accountId: account.id, value: 2000 }).run();
      db.insert(accountSnapshots).values({ accountId: account.id, value: 3000 }).run();

      const result = await service.getAccountSnapshots(account.id, 2);

      expect(result).toHaveLength(2);
    });

    it('throws NotFoundError when account does not exist', async () => {
      await expect(service.getAccountSnapshots(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteSnapshot', () => {
    it('deletes snapshot and returns it', async () => {
      const account = insertAccount();
      const db = getTestDatabase();
      const [snapshot] = db.insert(accountSnapshots).values({ accountId: account.id, value: 5000 }).returning().all();

      const result = await service.deleteSnapshot(snapshot.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(snapshot.id);
    });

    it('actually removes snapshot from database', async () => {
      const account = insertAccount();
      const db = getTestDatabase();
      const [snapshot] = db.insert(accountSnapshots).values({ accountId: account.id, value: 5000 }).returning().all();

      await service.deleteSnapshot(snapshot.id);

      const remaining = db.select().from(accountSnapshots).all();
      expect(remaining).toHaveLength(0);
    });

    it('throws NotFoundError when snapshot does not exist', async () => {
      await expect(service.deleteSnapshot(999)).rejects.toThrow(NotFoundError);
    });
  });
});
