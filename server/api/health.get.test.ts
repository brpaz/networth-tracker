import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callHandler } from '../test/handler-utils';
import handler from './health.get';

const mockCheckHealth = vi.fn();

vi.mock('../services/health.service', () => ({
  useHealthService: () => ({ checkHealth: mockCheckHealth }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/health', () => {
  it('returns 200 with pass status when database is reachable', async () => {
    mockCheckHealth.mockResolvedValue({
      status: 'pass',
      serviceId: 'networth-tracker',
      description: 'Net Worth Tracker API',
      checks: {},
    });

    const { status, body } = await callHandler(handler, { path: '/api/health' });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      status: 'pass',
      serviceId: 'networth-tracker',
    });
  });

  it('returns 503 with fail status when database is unreachable', async () => {
    mockCheckHealth.mockResolvedValue({
      status: 'fail',
      serviceId: 'networth-tracker',
      description: 'Net Worth Tracker API',
      checks: {},
    });

    const { status, body } = await callHandler(handler, { path: '/api/health' });

    expect(status).toBe(503);
    expect(body).toMatchObject({
      status: 'fail',
      serviceId: 'networth-tracker',
    });
  });

  it('includes the database connectivity check in the response', async () => {
    mockCheckHealth.mockResolvedValue({
      status: 'pass',
      serviceId: 'networth-tracker',
      description: 'Net Worth Tracker API',
      checks: {
        'database:connectivity': [{ componentType: 'datastore', status: 'pass', time: new Date().toISOString() }],
      },
    });

    const { body } = (await callHandler(handler, { path: '/api/health' })) as {
      body: { checks: { 'database:connectivity': Array<{ status: string; componentType: string }> } };
    };

    expect(body.checks['database:connectivity']).toHaveLength(1);
    expect(body.checks['database:connectivity'][0]).toMatchObject({
      componentType: 'datastore',
      status: 'pass',
    });
  });
});
