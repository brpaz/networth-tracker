import { desc, eq, sql } from 'drizzle-orm'
import { useDatabase } from '../database'
import { accounts } from '../database/schema'

export function useAccountRepository() {
  const db = useDatabase()

  return {
    async findAll() {
      return db
        .select({
          id: accounts.id,
          name: accounts.name,
          type: accounts.type,
          currency: accounts.currency,
          createdAt: accounts.createdAt,
          updatedAt: accounts.updatedAt,
          currentValue: sql<number | null>`(
            SELECT "account_snapshots"."value"
            FROM "account_snapshots"
            WHERE "account_snapshots"."account_id" = "accounts"."id"
            ORDER BY "account_snapshots"."recorded_at" DESC
            LIMIT 1
          )`.as('current_value'),
        })
        .from(accounts)
        .orderBy(desc(accounts.updatedAt))
    },

    async findById(id: number) {
      return db.select().from(accounts).where(eq(accounts.id, id)).get()
    },

    async create(data: { name: string; type: string; currency: string }) {
      const [account] = await db.insert(accounts).values(data).returning()
      return account
    },

    async update(id: number, data: Partial<{ name: string; type: string; currency: string }>) {
      const [account] = await db
        .update(accounts)
        .set({ ...data, updatedAt: sql`(unixepoch())` })
        .where(eq(accounts.id, id))
        .returning()
      return account
    },

    async delete(id: number) {
      await db.delete(accounts).where(eq(accounts.id, id))
    },

    async touchUpdatedAt(id: number) {
      await db
        .update(accounts)
        .set({ updatedAt: sql`(unixepoch())` })
        .where(eq(accounts.id, id))
    },
  }
}
