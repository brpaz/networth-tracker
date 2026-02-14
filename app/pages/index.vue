<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: accounts } = await useFetch('/api/accounts')
const { data: networth } = await useFetch('/api/stats/networth')
const { data: byType } = await useFetch('/api/stats/by-type')

const totalNetWorth = computed(() =>
  (accounts.value || []).reduce((sum, a) => sum + (a.currentValue || 0), 0),
)
</script>

<template>
  <div class="p-6 space-y-6">
    <UCard>
      <div class="text-center">
        <p class="text-sm text-muted">Total Net Worth</p>
        <p class="text-4xl font-bold text-primary">
          {{ useFormatters().formatCurrency(totalNetWorth) }}
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
      </UCard>
    </div>

    <UCard>
      <template #header>
        <h3 class="font-semibold">Accounts</h3>
      </template>
      <UTable
        :data="accounts || []"
        :columns="[
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'type', header: 'Type' },
          { accessorKey: 'currentValue', header: 'Value' },
          { accessorKey: 'currency', header: 'Currency' },
        ]"
      />
    </UCard>
  </div>
</template>
