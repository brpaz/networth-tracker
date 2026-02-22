import { sql } from 'drizzle-orm';
import { useDatabase } from '../database';
import type { HealthCheckResponse } from '../types/health';

async function checkDatabaseConnectivity() {
  try {
    const db = useDatabase();
    await db.get(sql`SELECT 1`);
    return { status: 'pass' as const, output: undefined };
  } catch (error) {
    return {
      status: 'fail' as const,
      output: error instanceof Error ? error.message : 'Database connectivity check failed',
    };
  }
}

export function useHealthService() {
  return {
    async checkHealth(): Promise<HealthCheckResponse> {
      const databaseCheck = await checkDatabaseConnectivity();
      const overallStatus = databaseCheck.status === 'fail' ? 'fail' : 'pass';

      return {
        status: overallStatus,
        version: useRuntimeConfig().version || undefined,
        releaseId: useRuntimeConfig().gitRef || undefined,
        serviceId: 'networth-tracker',
        description: 'Net Worth Tracker API',

        checks: {
          'database:connectivity': [
            {
              componentType: 'datastore',
              status: databaseCheck.status,
              time: new Date().toISOString(),
              ...(databaseCheck.output && { output: databaseCheck.output }),
            },
          ],
        },
      };
    },
  };
}
