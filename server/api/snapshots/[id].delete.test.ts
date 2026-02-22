import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './[id].delete';
import { NotFoundError } from '../../errors';

const mockDeleteSnapshot = vi.fn();

vi.mock('../../services/snapshot.service', () => ({
  useSnapshotService: () => ({ deleteSnapshot: mockDeleteSnapshot }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DELETE /api/snapshots/:id', () => {
  it('deletes the snapshot and returns 204', async () => {
    mockDeleteSnapshot.mockResolvedValue(undefined);

    const { status } = await callHandler(handler, {
      path: '/api/snapshots/1',
      method: 'DELETE',
      routerParams: { id: '1' },
    });

    expect(status).toBe(204);
    expect(mockDeleteSnapshot).toHaveBeenCalledWith(1);
  });

  it('returns 404 when snapshot does not exist', async () => {
    mockDeleteSnapshot.mockRejectedValue(new NotFoundError('Snapshot not found'));

    const { status } = await callHandler(handler, {
      path: '/api/snapshots/999',
      method: 'DELETE',
      routerParams: { id: '999' },
    });

    expect(status).toBe(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    const { status } = await callHandler(handler, {
      path: '/api/snapshots/abc',
      method: 'DELETE',
      routerParams: { id: 'abc' },
    });

    expect(status).toBe(400);
    expect(mockDeleteSnapshot).not.toHaveBeenCalled();
  });
});
