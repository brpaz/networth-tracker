import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../database/schema';

let _sqlite: Database.Database | null = null;
let _db: BetterSQLite3Database<typeof schema> | null = null;

export function createTestDatabase(): BetterSQLite3Database<typeof schema> {
  if (_sqlite) {
    _sqlite.close();
  }

  _sqlite = new Database(':memory:');
  _sqlite.pragma('journal_mode = WAL');
  _sqlite.pragma('foreign_keys = ON');

  _db = drizzle(_sqlite, { schema });
  migrate(_db, { migrationsFolder: './server/database/migrations' });

  return _db;
}

export function getTestDatabase(): BetterSQLite3Database<typeof schema> {
  if (!_db) {
    throw new Error('Test database not initialized. Call createTestDatabase() in beforeEach.');
  }
  return _db;
}

export function closeTestDatabase(): void {
  if (_sqlite) {
    _sqlite.close();
    _sqlite = null;
    _db = null;
  }
}
