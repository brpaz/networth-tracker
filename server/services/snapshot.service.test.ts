import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createError } from 'h3'

vi.stubGlobal('createError', createError)

const mockSnapshotRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByAccountId: vi.fn(),
  deleteById: vi.fn(),
}

const mockAccountRepo = {
  findById: vi.fn(),
  touchUpdatedAt: vi.fn(),
}

vi.mock('../repositories/snapshot.repository', () => ({
  useSnapshotRepository: () => mockSnapshotRepo,
}))

vi.mock('../repositories/account.repository', () => ({
  useAccountRepository: () => mockAccountRepo,
}))

import { useSnapshotService } from './snapshot.service'

describe('useSnapshotService', () => {
  const service = useSnapshotService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('recordSnapshot', () => {
    it('creates snapshot and touches account updatedAt', async () => {
      const account = { id: 1, name: 'Test' }
      const snapshot = { id: 1, accountId: 1, value: 5000, recordedAt: new Date() }
      mockAccountRepo.findById.mockResolvedValue(account)
      mockSnapshotRepo.create.mockResolvedValue(snapshot)
      mockAccountRepo.touchUpdatedAt.mockResolvedValue(undefined)

      const result = await service.recordSnapshot({ accountId: 1, value: 5000 })

      expect(mockAccountRepo.findById).toHaveBeenCalledWith(1)
      expect(mockSnapshotRepo.create).toHaveBeenCalledWith({ accountId: 1, value: 5000 })
      expect(mockAccountRepo.touchUpdatedAt).toHaveBeenCalledWith(1)
      expect(result).toEqual(snapshot)
    })

    it('throws 404 when account does not exist', async () => {
      mockAccountRepo.findById.mockResolvedValue(undefined)

      await expect(service.recordSnapshot({ accountId: 999, value: 100 })).rejects.toThrow()
      expect(mockSnapshotRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('getAccountSnapshots', () => {
    it('returns snapshots for existing account', async () => {
      const account = { id: 1, name: 'Test' }
      const snapshots = [{ id: 1, accountId: 1, value: 1000, recordedAt: new Date() }]
      mockAccountRepo.findById.mockResolvedValue(account)
      mockSnapshotRepo.findByAccountId.mockResolvedValue(snapshots)

      const result = await service.getAccountSnapshots(1, 50)

      expect(mockAccountRepo.findById).toHaveBeenCalledWith(1)
      expect(mockSnapshotRepo.findByAccountId).toHaveBeenCalledWith(1, 50)
      expect(result).toEqual(snapshots)
    })

    it('throws 404 when account does not exist', async () => {
      mockAccountRepo.findById.mockResolvedValue(undefined)

      await expect(service.getAccountSnapshots(999)).rejects.toThrow()
      expect(mockSnapshotRepo.findByAccountId).not.toHaveBeenCalled()
    })
  })

  describe('deleteSnapshot', () => {
    it('deletes snapshot and touches account updatedAt', async () => {
      const snapshot = { id: 1, accountId: 1, value: 5000, recordedAt: new Date() }
      mockSnapshotRepo.findById.mockResolvedValue(snapshot)
      mockSnapshotRepo.deleteById.mockResolvedValue(snapshot)
      mockAccountRepo.touchUpdatedAt.mockResolvedValue(undefined)

      const result = await service.deleteSnapshot(1)

      expect(mockSnapshotRepo.findById).toHaveBeenCalledWith(1)
      expect(mockSnapshotRepo.deleteById).toHaveBeenCalledWith(1)
      expect(mockAccountRepo.touchUpdatedAt).toHaveBeenCalledWith(1)
      expect(result).toEqual(snapshot)
    })

    it('throws 404 when snapshot does not exist', async () => {
      mockSnapshotRepo.findById.mockResolvedValue(undefined)

      await expect(service.deleteSnapshot(999)).rejects.toThrow()
      expect(mockSnapshotRepo.deleteById).not.toHaveBeenCalled()
      expect(mockAccountRepo.touchUpdatedAt).not.toHaveBeenCalled()
    })
  })
})
