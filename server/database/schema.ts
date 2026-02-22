import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accountTypes = ['stocks', 'cash', 'crypto', 'real_estate', 'bonds', 'retirement', 'other'] as const;

export type AccountType = (typeof accountTypes)[number];

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: accountTypes }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const accountSnapshots = sqliteTable('account_snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  value: real('value').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
