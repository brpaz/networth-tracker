import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createError } from 'h3'

vi.stubGlobal('createError', createError)

const mockRepo = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  touchUpdatedAt: vi.fn(),
}

vi.mock('../repositories/account.repository', () => ({
  useAccountRepository: () => mockRepo,
}))

import { useAccountService } from './account.service'

describe('useAccountService', () => {
  const service = useAccountService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listAccounts delegates to repo.findAll', async () => {
    const accounts = [{ id: 1, name: 'Test' }]
    mockRepo.findAll.mockResolvedValue(accounts)

    const result = await service.listAccounts()

    expect(mockRepo.findAll).toHaveBeenCalledOnce()
    expect(result).toEqual(accounts)
  })

  it('getAccount returns account when found', async () => {
    const account = { id: 1, name: 'Test' }
    mockRepo.findById.mockResolvedValue(account)

    const result = await service.getAccount(1)

    expect(mockRepo.findById).toHaveBeenCalledWith(1)
    expect(result).toEqual(account)
  })

  it('getAccount throws 404 when not found', async () => {
    mockRepo.findById.mockResolvedValue(undefined)

    await expect(service.getAccount(999)).rejects.toThrow()
    expect(mockRepo.findById).toHaveBeenCalledWith(999)
  })

  it('createAccount delegates to repo.create', async () => {
    const data = { name: 'New', type: 'cash', currency: 'EUR' }
    const created = { id: 1, ...data }
    mockRepo.create.mockResolvedValue(created)

    const result = await service.createAccount(data)

    expect(mockRepo.create).toHaveBeenCalledWith(data)
    expect(result).toEqual(created)
  })

  it('updateAccount verifies existence then updates', async () => {
    const account = { id: 1, name: 'Old' }
    mockRepo.findById.mockResolvedValue(account)
    mockRepo.update.mockResolvedValue({ ...account, name: 'New' })

    const result = await service.updateAccount(1, { name: 'New' })

    expect(mockRepo.findById).toHaveBeenCalledWith(1)
    expect(mockRepo.update).toHaveBeenCalledWith(1, { name: 'New' })
    expect(result.name).toBe('New')
  })

  it('updateAccount throws 404 for non-existent account', async () => {
    mockRepo.findById.mockResolvedValue(undefined)

    await expect(service.updateAccount(999, { name: 'X' })).rejects.toThrow()
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('deleteAccount verifies existence then deletes', async () => {
    const account = { id: 1, name: 'ToDelete' }
    mockRepo.findById.mockResolvedValue(account)
    mockRepo.delete.mockResolvedValue(undefined)

    await service.deleteAccount(1)

    expect(mockRepo.findById).toHaveBeenCalledWith(1)
    expect(mockRepo.delete).toHaveBeenCalledWith(1)
  })

  it('deleteAccount throws 404 for non-existent account', async () => {
    mockRepo.findById.mockResolvedValue(undefined)

    await expect(service.deleteAccount(999)).rejects.toThrow()
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })
})
