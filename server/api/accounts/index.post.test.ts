import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './index.post';

const mockCreateAccount = vi.fn();

vi.mock('../../services/account.service', () => ({
  useAccountService: () => ({ createAccount: mockCreateAccount }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/accounts', () => {
  it('creates an account and returns 201', async () => {
    const created = { id: 1, name: 'Savings', type: 'cash', currency: 'EUR' };
    mockCreateAccount.mockResolvedValue(created);

    const { status, body } = await callHandler(handler, {
      path: '/api/accounts',
      method: 'POST',
      body: { name: 'Savings', type: 'cash', currency: 'EUR' },
    });

    expect(status).toBe(201);
    expect(body).toEqual(created);
    expect(mockCreateAccount).toHaveBeenCalledWith({ name: 'Savings', type: 'cash', currency: 'EUR' });
  });

  it('uses EUR as default currency when omitted', async () => {
    const created = { id: 2, name: 'Stocks', type: 'stocks', currency: 'EUR' };
    mockCreateAccount.mockResolvedValue(created);

    await callHandler(handler, {
      path: '/api/accounts',
      method: 'POST',
      body: { name: 'Stocks', type: 'stocks' },
    });

    expect(mockCreateAccount).toHaveBeenCalledWith(expect.objectContaining({ currency: 'EUR' }));
  });

  it('returns 500 when required fields are missing', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/accounts',
      method: 'POST',
      body: { type: 'cash' },
    });

    expect(status).toBe(500);
    expect(mockCreateAccount).not.toHaveBeenCalled();
  });

  it('returns 500 for an invalid account type', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/accounts',
      method: 'POST',
      body: { name: 'Test', type: 'invalid_type' },
    });

    expect(status).toBe(500);
    expect(mockCreateAccount).not.toHaveBeenCalled();
  });
});
