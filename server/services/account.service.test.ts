import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { createTestDatabase, closeTestDatabase, getTestDatabase } from '../test/setup-db';
import { NotFoundError } from '../errors';

vi.mock('../database', () => ({
  useDatabase: () => getTestDatabase(),
}));

import { useAccountService } from './account.service';
import { accounts, accountSnapshots } from '../database/schema';

beforeEach(() => {
  createTestDatabase();
});

afterAll(() => {
  closeTestDatabase();
});

describe('useAccountService', () => {
  let service: ReturnType<typeof useAccountService>;

  beforeEach(() => {
    service = useAccountService();
  });

  describe('listAccounts', () => {
    it('returns empty array when no accounts exist', async () => {
      const result = await service.listAccounts();
      expect(result).toEqual([]);
    });

    it('returns all accounts with currentValue', async () => {
      const db = getTestDatabase();
      const [account] = db
        .insert(accounts)
        .values({ name: 'Savings', type: 'cash', currency: 'EUR' })
        .returning()
        .all();
      db.insert(accountSnapshots).values({ accountId: account.id, value: 5000 }).run();

      const result = await service.listAccounts();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Savings');
      expect(result[0].currentValue).toBe(5000);
    });
  });

  describe('getAccount', () => {
    it('returns account when found', async () => {
      const db = getTestDatabase();
      const [created] = db
        .insert(accounts)
        .values({ name: 'Stocks', type: 'stocks', currency: 'USD' })
        .returning()
        .all();

      const result = await service.getAccount(created.id);

      expect(result.name).toBe('Stocks');
      expect(result.type).toBe('stocks');
    });

    it('throws NotFoundError when account not found', async () => {
      await expect(service.getAccount(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createAccount', () => {
    it('creates and returns the new account', async () => {
      const result = await service.createAccount({
        name: 'New Account',
        type: 'cash',
        currency: 'EUR',
      });

      expect(result.id).toBeDefined();
      expect(result.name).toBe('New Account');
      expect(result.type).toBe('cash');
      expect(result.currency).toBe('EUR');
    });

    it('persists to the database', async () => {
      const created = await service.createAccount({
        name: 'Persisted',
        type: 'stocks',
        currency: 'USD',
      });

      const found = await service.getAccount(created.id);
      expect(found.name).toBe('Persisted');
    });
  });

  describe('updateAccount', () => {
    it('updates and returns the account', async () => {
      const created = await service.createAccount({
        name: 'Old Name',
        type: 'cash',
        currency: 'EUR',
      });

      const result = await service.updateAccount(created.id, { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(result.type).toBe('cash');
    });

    it('updates only specified fields', async () => {
      const created = await service.createAccount({
        name: 'Test',
        type: 'cash',
        currency: 'EUR',
      });

      const result = await service.updateAccount(created.id, { currency: 'USD' });

      expect(result.name).toBe('Test');
      expect(result.currency).toBe('USD');
    });

    it('throws NotFoundError for non-existent account', async () => {
      await expect(service.updateAccount(999, { name: 'X' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAccount', () => {
    it('deletes the account', async () => {
      const created = await service.createAccount({
        name: 'ToDelete',
        type: 'cash',
        currency: 'EUR',
      });

      await service.deleteAccount(created.id);

      await expect(service.getAccount(created.id)).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError for non-existent account', async () => {
      await expect(service.deleteAccount(999)).rejects.toThrow(NotFoundError);
    });
  });
});
