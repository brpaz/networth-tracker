import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const databaseUrl = (process.env.DATABASE_URL || 'file:./data/networth.db').replace('file:', '');
const sqlite = new Database(databaseUrl);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);

const possiblePaths = [
  join(__dirname, './migrations'),
  join(__dirname, '../../migrations'),
  './server/database/migrations',
];

const migrationsFolder = possiblePaths.find((path) => existsSync(path));

if (!migrationsFolder) {
  throw new Error(`Migrations folder not found. Tried: ${possiblePaths.join(', ')}`);
}

migrate(db, { migrationsFolder });

console.log('Migrations applied successfully');
sqlite.close();
