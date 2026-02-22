<script setup lang="ts">
import type { Account, Snapshot } from '~/types';

definePageMeta({ layout: 'default' });

const baseCurrency = useBaseCurrency();
const route = useRoute();
const toast = useToast();
const accountId = Number(route.params.id);

const { data: account, error: accountError } = await useFetch<Account>(`/api/accounts/${accountId}`);

if (accountError.value) {
  throw createError({ statusCode: 404, statusMessage: 'Account not found' });
}

const {
  data: snapshots,
  refresh: refreshSnapshots,
  status,
} = await useFetch<Snapshot[]>(`/api/accounts/${accountId}/snapshots`);

async function deleteSnapshot(snapshotId: number) {
  try {
    await $fetch(`/api/snapshots/${snapshotId}`, { method: 'DELETE' });
    toast.add({ title: 'Snapshot removed', color: 'success' });
    await refreshSnapshots();
  } catch {
    toast.add({ title: 'Error removing snapshot', color: 'error' });
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/accounts" />
      <div>
        <h2 class="text-xl font-bold">{{ account?.name }}</h2>
        <p class="text-sm text-muted">{{ account?.type }}</p>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">Value History</h3>
          <p v-if="snapshots?.length" class="text-sm text-muted">
            {{ snapshots.length }} {{ snapshots.length === 1 ? 'entry' : 'entries' }}
          </p>
        </div>
      </template>

      <div v-if="status === 'pending'" class="text-center py-4">Loading...</div>

      <div v-else-if="!snapshots?.length" class="text-center py-8 text-muted">
        <p>No value history yet. Update the account value to start tracking.</p>
      </div>

      <UTable
        v-else
        :data="snapshots"
        :columns="[
          { accessorKey: 'recordedAt', header: 'Date' },
          { accessorKey: 'value', header: 'Value' },
          { accessorKey: 'actions', header: '' },
        ]"
      >
        <template #recordedAt-cell="{ row }">
          {{ formatDate(row.original.recordedAt) }}
        </template>
        <template #value-cell="{ row }">
          <span class="font-medium">
            {{ formatCurrency(row.original.value, baseCurrency) }}
          </span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UButton
              icon="i-lucide-trash-2"
              variant="ghost"
              color="error"
              size="sm"
              @click="deleteSnapshot(row.original.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
