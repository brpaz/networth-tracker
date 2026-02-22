import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './[id].put';
import { NotFoundError } from '../../errors';

const mockUpdateAccount = vi.fn();

vi.mock('../../services/account.service', () => ({
  useAccountService: () => ({ updateAccount: mockUpdateAccount }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PUT /api/accounts/:id', () => {
  it('updates and returns the account', async () => {
    const updated = { id: 1, name: 'Updated', type: 'cash', currency: 'EUR' };
    mockUpdateAccount.mockResolvedValue(updated);

    const { status, body } = await callHandler(handler, {
      path: '/api/accounts/1',
      method: 'PUT',
      body: { name: 'Updated' },
      routerParams: { id: '1' },
    });

    expect(status).toBe(200);
    expect(body).toEqual(updated);
    expect(mockUpdateAccount).toHaveBeenCalledWith(1, { name: 'Updated' });
  });

  it('returns 404 when account does not exist', async () => {
    mockUpdateAccount.mockRejectedValue(new NotFoundError('Account not found'));

    const { status } = await callHandler(handler, {
      path: '/api/accounts/999',
      method: 'PUT',
      body: { name: 'X' },
      routerParams: { id: '999' },
    });

    expect(status).toBe(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/accounts/abc',
      method: 'PUT',
      body: { name: 'X' },
      routerParams: { id: 'abc' },
    });

    expect(status).toBe(400);
    expect(mockUpdateAccount).not.toHaveBeenCalled();
  });

  it('returns 500 for an invalid field value', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/accounts/1',
      method: 'PUT',
      body: { type: 'not_a_valid_type' },
      routerParams: { id: '1' },
    });

    expect(status).toBe(500);
    expect(mockUpdateAccount).not.toHaveBeenCalled();
  });
});
