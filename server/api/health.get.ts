import { sql } from 'drizzle-orm';
import type { H3Event } from 'h3';
import { useDatabase } from '../database';

interface HealthCheckResponse {
  status: 'pass' | 'fail' | 'warn';
  version?: string;
  releaseId?: string;
  serviceId: string;
  description: string;
  checks?: {
    [key: string]: Array<{
      componentType: string;
      status: 'pass' | 'fail' | 'warn';
      time: string;
      output?: string;
    }>;
  };
}

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

export default defineEventHandler(async (event: H3Event) => {
  const databaseCheck = await checkDatabaseConnectivity();
  const overallStatus = databaseCheck.status === 'fail' ? 'fail' : 'pass';

  const response: HealthCheckResponse = {
    status: overallStatus,
    version: process.env.VERSION || undefined,
    releaseId: process.env.GIT_REF || undefined,
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

  setResponseHeaders(event, {
    'Content-Type': 'application/health+json',
    'Cache-Control': 'max-age=3600',
  });

  setResponseStatus(event, overallStatus === 'fail' ? 503 : 200);

  return response;
});
