import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './index.post';
import { NotFoundError } from '../../errors';

const mockRecordSnapshot = vi.fn();

vi.mock('../../services/snapshot.service', () => ({
  useSnapshotService: () => ({ recordSnapshot: mockRecordSnapshot }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/snapshots', () => {
  it('records a snapshot and returns 201', async () => {
    const snapshot = { id: 1, accountId: 1, value: 5000 };
    mockRecordSnapshot.mockResolvedValue(snapshot);

    const { status, body } = await callHandler(handler, {
      path: '/api/snapshots',
      method: 'POST',
      body: { accountId: 1, value: 5000 },
    });

    expect(status).toBe(201);
    expect(body).toEqual(snapshot);
    expect(mockRecordSnapshot).toHaveBeenCalledWith({ accountId: 1, value: 5000 });
  });

  it('returns 404 when the referenced account does not exist', async () => {
    mockRecordSnapshot.mockRejectedValue(new NotFoundError('Account not found'));

    const { status } = await callHandler(handler, {
      path: '/api/snapshots',
      method: 'POST',
      body: { accountId: 999, value: 100 },
    });

    expect(status).toBe(404);
  });

  it('returns 500 when required fields are missing', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/snapshots',
      method: 'POST',
      body: { value: 100 },
    });

    expect(status).toBe(500);
    expect(mockRecordSnapshot).not.toHaveBeenCalled();
  });

  it('returns 500 for a non-integer accountId', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/snapshots',
      method: 'POST',
      body: { accountId: 1.5, value: 100 },
    });

    expect(status).toBe(500);
    expect(mockRecordSnapshot).not.toHaveBeenCalled();
  });
});
