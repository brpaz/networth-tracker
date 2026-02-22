import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { createTestDatabase, closeTestDatabase, getTestDatabase } from '../test/setup-db';
vi.mock('../database', () => ({
  useDatabase: () => getTestDatabase(),
}));

vi.stubGlobal('useRuntimeConfig', vi.fn());

import { useHealthService } from './health.service';

const mockUseRuntimeConfig = vi.mocked(useRuntimeConfig as unknown as () => Record<string, string>);

beforeEach(() => {
  createTestDatabase();
  mockUseRuntimeConfig.mockReturnValue({ version: '1.2.3', gitRef: 'abc123' });
});

afterAll(() => {
  closeTestDatabase();
});

describe('useHealthService', () => {
  describe('checkHealth', () => {
    it('returns pass status when database is reachable', async () => {
      const service = useHealthService();
      const result = await service.checkHealth();
      expect(result.status).toBe('pass');
    });

    it('returns serviceId and description', async () => {
      const service = useHealthService();
      const result = await service.checkHealth();
      expect(result.serviceId).toBe('networth-tracker');
      expect(result.description).toBe('Net Worth Tracker API');
    });

    it('returns version and releaseId from runtimeConfig', async () => {
      const service = useHealthService();
      const result = await service.checkHealth();
      expect(result.version).toBe('1.2.3');
      expect(result.releaseId).toBe('abc123');
    });

    it('returns undefined version/releaseId when runtimeConfig values are empty', async () => {
      mockUseRuntimeConfig.mockReturnValue({ version: '', gitRef: '' });
      const service = useHealthService();
      const result = await service.checkHealth();
      expect(result.version).toBeUndefined();
      expect(result.releaseId).toBeUndefined();
    });

    it('includes database:connectivity check with pass status', async () => {
      const service = useHealthService();
      const result = await service.checkHealth();
      expect(result.checks?.['database:connectivity']).toHaveLength(1);
      expect(result.checks?.['database:connectivity'][0]).toMatchObject({
        componentType: 'datastore',
        status: 'pass',
      });
    });

    it('includes a valid ISO time field in the database check', async () => {
      const service = useHealthService();
      const result = await service.checkHealth();
      const time = result.checks?.['database:connectivity'][0].time;
      expect(time).toBeDefined();
      expect(new Date(time!).toISOString()).toBe(time);
    });

    it('does not include output field when database check passes', async () => {
      const service = useHealthService();
      const result = await service.checkHealth();
      expect(result.checks?.['database:connectivity'][0].output).toBeUndefined();
    });

    it('returns fail status when database is unreachable', async () => {
      const db = getTestDatabase();
      vi.spyOn(db, 'get').mockImplementation(() => {
        throw new Error('SQLITE_CANTOPEN: unable to open database file');
      });

      const service = useHealthService();
      const result = await service.checkHealth();
      expect(result.status).toBe('fail');
      expect(result.checks?.['database:connectivity'][0].status).toBe('fail');
    });

    it('includes error message in output when database check fails', async () => {
      const db = getTestDatabase();
      vi.spyOn(db, 'get').mockImplementation(() => {
        throw new Error('connection refused');
      });

      const service = useHealthService();
      const result = await service.checkHealth();

      expect(result.checks?.['database:connectivity'][0].output).toBe('connection refused');
    });

    it('uses fallback output message when error is not an Error instance', async () => {
      const db = getTestDatabase();
      vi.spyOn(db, 'get').mockImplementation(() => {
        throw 'unexpected failure';
      });

      const service = useHealthService();
      const result = await service.checkHealth();

      expect(result.checks?.['database:connectivity'][0].output).toBe('Database connectivity check failed');
    });
  });
});
