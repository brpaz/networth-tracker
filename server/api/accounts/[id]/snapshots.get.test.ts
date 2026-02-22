import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../../test/handler-utils';
import handler from './snapshots.get';
import { NotFoundError } from '../../../errors';

const mockGetAccountSnapshots = vi.fn();

vi.mock('../../../services/snapshot.service', () => ({
  useSnapshotService: () => ({ getAccountSnapshots: mockGetAccountSnapshots }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/accounts/:id/snapshots', () => {
  it('returns snapshots for an account', async () => {
    const snapshots = [{ id: 1, accountId: 1, value: 1000 }];
    mockGetAccountSnapshots.mockResolvedValue(snapshots);

    const { status, body } = await callHandler(handler, {
      path: '/api/accounts/1/snapshots',
      routerParams: { id: '1' },
    });

    expect(status).toBe(200);
    expect(body).toEqual(snapshots);
    expect(mockGetAccountSnapshots).toHaveBeenCalledWith(1, 100);
  });

  it('respects the limit query param', async () => {
    mockGetAccountSnapshots.mockResolvedValue([]);

    await callHandler(handler, {
      path: '/api/accounts/1/snapshots',
      query: { limit: '10' },
      routerParams: { id: '1' },
    });

    expect(mockGetAccountSnapshots).toHaveBeenCalledWith(1, 10);
  });

  it('returns 404 when account does not exist', async () => {
    mockGetAccountSnapshots.mockRejectedValue(new NotFoundError('Account not found'));

    const { status } = await callHandler(handler, {
      path: '/api/accounts/999/snapshots',
      routerParams: { id: '999' },
    });

    expect(status).toBe(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/accounts/abc/snapshots',
      routerParams: { id: 'abc' },
    });

    expect(status).toBe(400);
    expect(mockGetAccountSnapshots).not.toHaveBeenCalled();
  });
});
