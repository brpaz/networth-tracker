import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './[id].delete';
import { NotFoundError } from '../../errors';

const mockDeleteAccount = vi.fn();

vi.mock('../../services/account.service', () => ({
  useAccountService: () => ({ deleteAccount: mockDeleteAccount }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DELETE /api/accounts/:id', () => {
  it('deletes the account and returns 204', async () => {
    mockDeleteAccount.mockResolvedValue(undefined);

    const { status } = await callHandler(handler, {
      path: '/api/accounts/1',
      method: 'DELETE',
      routerParams: { id: '1' },
    });

    expect(status).toBe(204);
    expect(mockDeleteAccount).toHaveBeenCalledWith(1);
  });

  it('returns 404 when account does not exist', async () => {
    mockDeleteAccount.mockRejectedValue(new NotFoundError('Account not found'));

    const { status } = await callHandler(handler, {
      path: '/api/accounts/999',
      method: 'DELETE',
      routerParams: { id: '999' },
    });

    expect(status).toBe(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/accounts/abc',
      method: 'DELETE',
      routerParams: { id: 'abc' },
    });

    expect(status).toBe(400);
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });
});
