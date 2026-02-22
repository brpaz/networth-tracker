import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './[id].get';
import { NotFoundError } from '../../errors';

const mockGetAccount = vi.fn();

vi.mock('../../services/account.service', () => ({
  useAccountService: () => ({ getAccount: mockGetAccount }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/accounts/:id', () => {
  it('returns the account when found', async () => {
    const account = { id: 1, name: 'Savings', type: 'cash', currency: 'EUR' };
    mockGetAccount.mockResolvedValue(account);

    const { status, body } = await callHandler(handler, {
      path: '/api/accounts/1',
      routerParams: { id: '1' },
    });

    expect(status).toBe(200);
    expect(body).toEqual(account);
    expect(mockGetAccount).toHaveBeenCalledWith(1);
  });

  it('returns 404 when account does not exist', async () => {
    mockGetAccount.mockRejectedValue(new NotFoundError('Account not found'));

    const { status } = await callHandler(handler, {
      path: '/api/accounts/999',
      routerParams: { id: '999' },
    });

    expect(status).toBe(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/accounts/abc',
      routerParams: { id: 'abc' },
    });

    expect(status).toBe(400);
    expect(mockGetAccount).not.toHaveBeenCalled();
  });
});
