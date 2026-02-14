import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

const databaseUrl = (process.env.DATABASE_URL || 'file:./data/networth.db').replace('file:', '')
const sqlite = new Database(databaseUrl)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite)
migrate(db, { migrationsFolder: './server/database/migrations' })

console.log('Migrations applied successfully')
sqlite.close()
