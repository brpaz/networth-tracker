import { desc, eq } from 'drizzle-orm'
import { useDatabase } from '../database'
import { accountSnapshots } from '../database/schema'

export function useSnapshotRepository() {
  const db = useDatabase()

  return {
    async create(data: { accountId: number; value: number }) {
      const [snapshot] = await db.insert(accountSnapshots).values(data).returning()
      return snapshot
    },

    async findById(id: number) {
      const [snapshot] = await db
        .select()
        .from(accountSnapshots)
        .where(eq(accountSnapshots.id, id))
        .limit(1)
      return snapshot
    },

    async findByAccountId(accountId: number, limit = 100) {
      return db
        .select()
        .from(accountSnapshots)
        .where(eq(accountSnapshots.accountId, accountId))
        .orderBy(desc(accountSnapshots.recordedAt))
        .limit(limit)
    },

    async deleteById(id: number) {
      const [deleted] = await db
        .delete(accountSnapshots)
        .where(eq(accountSnapshots.id, id))
        .returning()
      return deleted
    },
  }
}
