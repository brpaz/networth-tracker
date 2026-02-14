import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockReturning = vi.fn()
const mockLimit = vi.fn()
const mockOrderBy = vi.fn(() => ({ limit: mockLimit }))
const mockWhere = vi.fn(() => ({
  orderBy: mockOrderBy,
  limit: mockLimit,
  returning: mockReturning,
}))
const mockFrom = vi.fn(() => ({ where: mockWhere }))
const mockValues = vi.fn(() => ({ returning: mockReturning }))

const mockDb = {
  select: vi.fn(() => ({ from: mockFrom })),
  insert: vi.fn(() => ({ values: mockValues })),
  delete: vi.fn(() => ({ where: mockWhere })),
}

vi.mock('../database', () => ({
  useDatabase: () => mockDb,
}))

import { useSnapshotRepository } from './snapshot.repository'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSnapshotRepository', () => {
  const repo = useSnapshotRepository()

  describe('create', () => {
    it('inserts and returns the new snapshot', async () => {
      const newSnapshot = { id: 1, accountId: 1, value: 5000, recordedAt: new Date() }
      mockReturning.mockResolvedValueOnce([newSnapshot])

      const result = await repo.create({ accountId: 1, value: 5000 })

      expect(mockDb.insert).toHaveBeenCalled()
      expect(mockValues).toHaveBeenCalledWith({ accountId: 1, value: 5000 })
      expect(result).toEqual(newSnapshot)
    })
  })

  describe('findById', () => {
    it('returns snapshot when found', async () => {
      const snapshot = { id: 1, accountId: 1, value: 5000, recordedAt: new Date() }
      mockLimit.mockResolvedValueOnce([snapshot])

      const result = await repo.findById(1)

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
      expect(mockLimit).toHaveBeenCalledWith(1)
      expect(result).toEqual(snapshot)
    })

    it('returns undefined when snapshot does not exist', async () => {
      mockLimit.mockResolvedValueOnce([])

      const result = await repo.findById(999)

      expect(result).toBeUndefined()
    })
  })

  describe('findByAccountId', () => {
    it('returns snapshots ordered by date desc', async () => {
      const snapshots = [
        { id: 3, accountId: 1, value: 3000, recordedAt: new Date() },
        { id: 2, accountId: 1, value: 2000, recordedAt: new Date() },
        { id: 1, accountId: 1, value: 1000, recordedAt: new Date() },
      ]
      mockLimit.mockResolvedValueOnce(snapshots)

      const result = await repo.findByAccountId(1)

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
      expect(mockOrderBy).toHaveBeenCalled()
      expect(mockLimit).toHaveBeenCalledWith(100)
      expect(result).toEqual(snapshots)
    })

    it('respects custom limit parameter', async () => {
      mockLimit.mockResolvedValueOnce([])

      await repo.findByAccountId(1, 5)

      expect(mockLimit).toHaveBeenCalledWith(5)
    })

    it('returns empty array when no snapshots exist', async () => {
      mockLimit.mockResolvedValueOnce([])

      const result = await repo.findByAccountId(1)

      expect(result).toEqual([])
    })
  })

  describe('deleteById', () => {
    it('deletes and returns the snapshot', async () => {
      const deleted = { id: 1, accountId: 1, value: 5000, recordedAt: new Date() }
      mockReturning.mockResolvedValueOnce([deleted])

      const result = await repo.deleteById(1)

      expect(mockDb.delete).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
      expect(mockReturning).toHaveBeenCalled()
      expect(result).toEqual(deleted)
    })

    it('returns undefined when snapshot does not exist', async () => {
      mockReturning.mockResolvedValueOnce([])

      const result = await repo.deleteById(999)

      expect(result).toBeUndefined()
    })
  })
})
