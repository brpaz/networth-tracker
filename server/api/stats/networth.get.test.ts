import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../../test/handler-utils';
import handler from './networth.get';

const mockGetNetWorthHistory = vi.fn();

vi.mock('../../services/stats.service', () => ({
  useStatsService: () => ({ getNetWorthHistory: mockGetNetWorthHistory }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/stats/networth', () => {
  it('returns net worth history with default 365-day window', async () => {
    const history = [{ date: '2025-01-01', value: 10000 }];
    mockGetNetWorthHistory.mockResolvedValue(history);

    const { status, body } = await callHandler(handler, {
      path: '/api/stats/networth',
    });

    expect(status).toBe(200);
    expect(body).toEqual(history);
    expect(mockGetNetWorthHistory).toHaveBeenCalledWith(365);
  });

  it('respects the days query param', async () => {
    mockGetNetWorthHistory.mockResolvedValue([]);

    await callHandler(handler, {
      path: '/api/stats/networth',
      query: { days: '30' },
    });

    expect(mockGetNetWorthHistory).toHaveBeenCalledWith(30);
  });
});
