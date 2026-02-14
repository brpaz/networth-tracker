import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockGet = vi.fn()
const mockReturning = vi.fn()
const mockLimit = vi.fn(() => Promise.resolve([]))
const mockOrderBy = vi.fn(() => ({ limit: mockLimit }))
const mockWhere = vi.fn(() => ({
  get: mockGet,
  returning: mockReturning,
  orderBy: mockOrderBy,
}))
const mockFrom = vi.fn(() => ({ orderBy: mockOrderBy, where: mockWhere }))
const mockValues = vi.fn(() => ({ returning: mockReturning }))
const mockSet = vi.fn(() => ({ where: mockWhere }))

const mockDb = {
  select: vi.fn(() => ({ from: mockFrom })),
  insert: vi.fn(() => ({ values: mockValues })),
  update: vi.fn(() => ({ set: mockSet })),
  delete: vi.fn(() => ({ where: mockWhere })),
}

vi.mock('../database', () => ({
  useDatabase: () => mockDb,
}))

import { useAccountRepository } from './account.repository'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAccountRepository', () => {
  const repo = useAccountRepository()

  describe('findAll', () => {
    it('queries accounts ordered by updatedAt', async () => {
      const fakeAccounts = [
        { id: 1, name: 'Savings', type: 'cash', currency: 'EUR', currentValue: 1000 },
      ]
      mockOrderBy.mockResolvedValueOnce(fakeAccounts)

      const result = await repo.findAll()

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalled()
      expect(result).toEqual(fakeAccounts)
    })
  })

  describe('findById', () => {
    it('returns account when found', async () => {
      const fakeAccount = { id: 1, name: 'Stocks', type: 'stocks', currency: 'USD' }
      mockGet.mockResolvedValueOnce(fakeAccount)

      const result = await repo.findById(1)

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
      expect(result).toEqual(fakeAccount)
    })

    it('returns undefined for non-existent account', async () => {
      mockGet.mockResolvedValueOnce(undefined)

      const result = await repo.findById(999)

      expect(result).toBeUndefined()
    })
  })

  describe('create', () => {
    it('inserts and returns the new account', async () => {
      const newAccount = { id: 1, name: 'Savings', type: 'cash', currency: 'EUR' }
      mockReturning.mockResolvedValueOnce([newAccount])

      const result = await repo.create({ name: 'Savings', type: 'cash', currency: 'EUR' })

      expect(mockDb.insert).toHaveBeenCalled()
      expect(mockValues).toHaveBeenCalledWith({ name: 'Savings', type: 'cash', currency: 'EUR' })
      expect(result).toEqual(newAccount)
    })
  })

  describe('update', () => {
    it('updates and returns the account', async () => {
      const updated = { id: 1, name: 'New Name', type: 'cash', currency: 'EUR' }
      mockReturning.mockResolvedValueOnce([updated])

      const result = await repo.update(1, { name: 'New Name' })

      expect(mockDb.update).toHaveBeenCalled()
      expect(mockSet).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
      expect(result).toEqual(updated)
    })
  })

  describe('delete', () => {
    it('deletes the account by id', async () => {
      mockWhere.mockResolvedValueOnce(undefined)

      await repo.delete(1)

      expect(mockDb.delete).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
    })
  })

  describe('touchUpdatedAt', () => {
    it('updates the updatedAt timestamp', async () => {
      mockWhere.mockResolvedValueOnce(undefined)

      await repo.touchUpdatedAt(1)

      expect(mockDb.update).toHaveBeenCalled()
      expect(mockSet).toHaveBeenCalled()
      expect(mockWhere).toHaveBeenCalled()
    })
  })
})
