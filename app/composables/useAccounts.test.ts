import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal(
  'ref',
  vi.fn((val: unknown) => ({ value: val })),
)

import { useAccounts } from './useAccounts'

describe('useAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchAccounts populates accounts', async () => {
    const data = [
      {
        id: 1,
        name: 'Savings',
        type: 'cash',
        currency: 'EUR',
        currentValue: 100,
        createdAt: 0,
        updatedAt: 0,
      },
    ]
    mockFetch.mockResolvedValue(data)

    const { accounts, fetchAccounts } = useAccounts()
    await fetchAccounts()

    expect(mockFetch).toHaveBeenCalledWith('/api/accounts')
    expect(accounts.value).toEqual(data)
  })

  it('createAccount calls POST and prepends to list', async () => {
    const newAccount = {
      id: 2,
      name: 'Stocks',
      type: 'stocks',
      currency: 'EUR',
      currentValue: null,
      createdAt: 0,
      updatedAt: 0,
    }
    mockFetch.mockResolvedValue(newAccount)

    const { accounts, createAccount } = useAccounts()
    const result = await createAccount({ name: 'Stocks', type: 'stocks', currency: 'EUR' })

    expect(mockFetch).toHaveBeenCalledWith('/api/accounts', {
      method: 'POST',
      body: { name: 'Stocks', type: 'stocks', currency: 'EUR' },
    })
    expect(result).toEqual(newAccount)
    expect(accounts.value[0]).toEqual(newAccount)
  })

  it('updateAccount calls PUT and updates list', async () => {
    const updated = {
      id: 1,
      name: 'Updated',
      type: 'cash',
      currency: 'EUR',
      currentValue: 200,
      createdAt: 0,
      updatedAt: 0,
    }
    mockFetch.mockResolvedValue(updated)

    const { accounts, updateAccount } = useAccounts()
    accounts.value = [
      {
        id: 1,
        name: 'Old',
        type: 'cash',
        currency: 'EUR',
        currentValue: 100,
        createdAt: 0,
        updatedAt: 0,
      },
    ]

    const result = await updateAccount(1, { name: 'Updated' })

    expect(mockFetch).toHaveBeenCalledWith('/api/accounts/1', {
      method: 'PUT',
      body: { name: 'Updated' },
    })
    expect(result).toEqual(updated)
    expect(accounts.value[0]).toEqual(updated)
  })

  it('deleteAccount calls DELETE and removes from list', async () => {
    mockFetch.mockResolvedValue(undefined)

    const { accounts, deleteAccount } = useAccounts()
    accounts.value = [
      {
        id: 1,
        name: 'A',
        type: 'cash',
        currency: 'EUR',
        currentValue: 0,
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 2,
        name: 'B',
        type: 'stocks',
        currency: 'EUR',
        currentValue: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    ]

    await deleteAccount(1)

    expect(mockFetch).toHaveBeenCalledWith('/api/accounts/1', { method: 'DELETE' })
    expect(accounts.value).toHaveLength(1)
    expect(accounts.value[0].id).toBe(2)
  })

  it('recordSnapshot calls POST and refreshes accounts', async () => {
    mockFetch.mockResolvedValue(undefined)

    const { recordSnapshot } = useAccounts()
    await recordSnapshot(1, 5000)

    expect(mockFetch).toHaveBeenCalledWith('/api/snapshots', {
      method: 'POST',
      body: { accountId: 1, value: 5000 },
    })
    expect(mockFetch).toHaveBeenCalledWith('/api/accounts')
  })
})
