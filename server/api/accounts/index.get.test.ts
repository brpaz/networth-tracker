import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './index.get';

const mockListAccounts = vi.fn();

vi.mock('../../services/account.service', () => ({
  useAccountService: () => ({ listAccounts: mockListAccounts }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/accounts', () => {
  it('returns the list of accounts', async () => {
    const accounts = [{ id: 1, name: 'Savings', type: 'cash', currency: 'EUR' }];
    mockListAccounts.mockResolvedValue(accounts);

    const { status, body } = await callHandler(handler, { path: '/api/accounts' });

    expect(status).toBe(200);
    expect(body).toEqual(accounts);
    expect(mockListAccounts).toHaveBeenCalledOnce();
  });

  it('returns empty array when no accounts exist', async () => {
    mockListAccounts.mockResolvedValue([]);

    const { status, body } = await callHandler(handler, { path: '/api/accounts' });

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });
});
