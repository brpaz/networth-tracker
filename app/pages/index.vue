<script setup lang="ts">
import type { Account } from '~/types';

definePageMeta({ layout: 'default' });

const baseCurrency = useBaseCurrency();

const { data: accounts } = await useFetch<Account[]>('/api/accounts');
const { data: networth } = await useFetch('/api/stats/networth');
const { data: byType } = await useFetch<{ type: string; total: number }[]>('/api/stats/by-type');

const totalNetWorth = computed(() => (accounts.value || []).reduce((sum, a) => sum + (a.currentValue || 0), 0));

function pct(value: number | null) {
  if (!totalNetWorth.value || !value) return '0.0%';
  return ((value / totalNetWorth.value) * 100).toFixed(1) + '%';
}

const typeBreakdown = computed(() => {
  if (!byType.value || !totalNetWorth.value) return [];
  return byType.value
    .filter((t) => t.total > 0)
    .map((t) => ({
      ...t,
      pct: ((t.total / totalNetWorth.value) * 100).toFixed(1) + '%',
    }))
    .sort((a, b) => b.total - a.total);
});

const tableColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'currency', header: 'Currency' },
  { accessorKey: 'currentValue', header: 'Value' },
  { accessorKey: '_pct', header: '% of Total' },
];
</script>

<template>
  <div class="p-6 space-y-6">
    <UCard>
      <div class="text-center">
        <p class="text-sm text-muted">Total Net Worth</p>
        <p class="text-4xl font-bold text-primary">
          {{ formatCurrency(totalNetWorth, baseCurrency) }}
        </p>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Net Worth Evolution</h3>
        </template>
        <NetWorthChart :data="networth" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold">By Account Type</h3>
        </template>
        <AccountTypeChart :data="byType" />
        <ul class="mt-4 space-y-2">
          <li v-for="t in typeBreakdown" :key="t.type" class="flex items-center justify-between text-sm">
            <span class="capitalize text-muted">{{ t.type.replace('_', ' ') }}</span>
            <div class="flex items-center gap-3">
              <span>{{ formatCurrency(t.total, baseCurrency) }}</span>
              <UBadge variant="subtle" color="primary" class="w-16 justify-center">
                {{ t.pct }}
              </UBadge>
            </div>
          </li>
        </ul>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <h3 class="font-semibold">Accounts</h3>
      </template>
      <UTable :data="accounts || []" :columns="tableColumns">
        <template #currentValue-cell="{ row }">
          {{ formatCurrency(row.original.currentValue || 0, row.original.currency) }}
        </template>
        <template #_pct-cell="{ row }">
          <UBadge variant="subtle" color="primary">
            {{ pct(row.original.currentValue) }}
          </UBadge>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
