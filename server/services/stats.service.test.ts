import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockAll = vi.fn()

const mockDb = {
  all: mockAll,
}

vi.mock('../database', () => ({
  useDatabase: () => mockDb,
}))

import { useStatsService } from './stats.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStatsService', () => {
  const service = useStatsService()

  describe('getNetWorthHistory', () => {
    it('returns aggregated net worth data', async () => {
      const fakeHistory = [
        { date: '2025-01-01', total: 5000 },
        { date: '2025-01-02', total: 5200 },
      ]
      mockAll.mockResolvedValueOnce(fakeHistory)

      const result = await service.getNetWorthHistory()

      expect(mockAll).toHaveBeenCalled()
      expect(result).toEqual(fakeHistory)
    })

    it('returns empty array when no data exists', async () => {
      mockAll.mockResolvedValueOnce([])

      const result = await service.getNetWorthHistory()

      expect(result).toEqual([])
    })

    it('accepts a custom days parameter', async () => {
      mockAll.mockResolvedValueOnce([])

      await service.getNetWorthHistory(30)

      expect(mockAll).toHaveBeenCalled()
    })
  })

  describe('getByType', () => {
    it('returns totals grouped by account type', async () => {
      const fakeByType = [
        { type: 'cash', total: 1500 },
        { type: 'stocks', total: 3000 },
      ]
      mockAll.mockResolvedValueOnce(fakeByType)

      const result = await service.getByType()

      expect(mockAll).toHaveBeenCalled()
      expect(result).toEqual(fakeByType)
    })

    it('returns empty array when no accounts exist', async () => {
      mockAll.mockResolvedValueOnce([])

      const result = await service.getByType()

      expect(result).toEqual([])
    })
  })
})
