import type { Account } from '~/types'

export function useAccounts() {
  const accounts = ref<Account[]>([])
  const loading = ref(false)

  const fetchAccounts = async () => {
    loading.value = true
    try {
      const data = await $fetch<Account[]>('/api/accounts')
      accounts.value = data
    } finally {
      loading.value = false
    }
  }

  const createAccount = async (data: { name: string; type: string; currency: string }) => {
    const account = await $fetch<Account>('/api/accounts', {
      method: 'POST',
      body: data,
    })
    accounts.value.unshift(account)
    return account
  }

  const updateAccount = async (
    id: number,
    data: Partial<{ name: string; type: string; currency: string }>,
  ) => {
    const account = await $fetch<Account>(`/api/accounts/${id}`, {
      method: 'PUT',
      body: data,
    })
    const index = accounts.value.findIndex((a) => a.id === id)
    if (index !== -1) accounts.value[index] = account
    return account
  }

  const deleteAccount = async (id: number) => {
    await $fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    accounts.value = accounts.value.filter((a) => a.id !== id)
  }

  const recordSnapshot = async (accountId: number, value: number) => {
    await $fetch('/api/snapshots', {
      method: 'POST',
      body: { accountId, value },
    })
    await fetchAccounts()
  }

  return {
    accounts,
    loading,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    recordSnapshot,
  }
}
