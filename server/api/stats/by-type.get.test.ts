import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './by-type.get';

const mockGetByType = vi.fn();

vi.mock('../../services/stats.service', () => ({
  useStatsService: () => ({ getByType: mockGetByType }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/stats/by-type', () => {
  it('returns account breakdown by type', async () => {
    const breakdown = [
      { type: 'cash', total: 5000 },
      { type: 'stocks', total: 10000 },
    ];
    mockGetByType.mockResolvedValue(breakdown);

    const { status, body } = await callHandler(handler, {
      path: '/api/stats/by-type',
    });

    expect(status).toBe(200);
    expect(body).toEqual(breakdown);
    expect(mockGetByType).toHaveBeenCalledOnce();
  });

  it('returns empty array when no data exists', async () => {
    mockGetByType.mockResolvedValue([]);

    const { status, body } = await callHandler(handler, {
      path: '/api/stats/by-type',
    });

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });
});
