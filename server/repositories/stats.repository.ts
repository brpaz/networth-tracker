import { sql } from 'drizzle-orm';
import { useDatabase } from '../database';
import { accounts, accountSnapshots } from '../database/schema';
import type { NetWorthDataPoint, AccountTypeBreakdown } from '../types/stats';

export function useStatsRepository() {
  const db = useDatabase();

  return {
    async getNetWorthHistory(days = 365): Promise<NetWorthDataPoint[]> {
      return db.all(sql`
        WITH daily_values AS (
          SELECT
            date(${accountSnapshots.recordedAt}, 'unixepoch') as date,
            ${accountSnapshots.accountId} as account_id,
            ${accountSnapshots.value} as value,
            ROW_NUMBER() OVER (
              PARTITION BY ${accountSnapshots.accountId}, date(${accountSnapshots.recordedAt}, 'unixepoch')
              ORDER BY ${accountSnapshots.recordedAt} DESC
            ) as rn
          FROM ${accountSnapshots}
          WHERE ${accountSnapshots.recordedAt} >= unixepoch('now', '-' || ${days} || ' days')
        )
        SELECT date, SUM(value) as total
        FROM daily_values
        WHERE rn = 1
        GROUP BY date
        ORDER BY date ASC
      `) as NetWorthDataPoint[];
    },

    async getByType(): Promise<AccountTypeBreakdown[]> {
      return db.all(sql`
        SELECT
          ${accounts.type} as type,
          SUM(latest.value) as total
        FROM ${accounts}
        LEFT JOIN (
          SELECT
            ${accountSnapshots.accountId} as account_id,
            ${accountSnapshots.value} as value,
            ROW_NUMBER() OVER (
              PARTITION BY ${accountSnapshots.accountId}
              ORDER BY ${accountSnapshots.recordedAt} DESC
            ) as rn
          FROM ${accountSnapshots}
        ) latest ON latest.account_id = ${accounts.id} AND latest.rn = 1
        GROUP BY ${accounts.type}
      `) as AccountTypeBreakdown[];
    },
  };
}
