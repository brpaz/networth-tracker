<script setup lang="ts">
import type { Account } from '~/types';

definePageMeta({ layout: 'default' });

const initialAmount = ref(10000);
const yearlyRate = ref(7);
const years = ref(20);
const inflationRate = ref(2);
const adjustForInflation = ref(false);
const capitalGainsTaxRate = ref(14);
const adjustForCapitalGainsTax = ref(false);

const { data: accounts } = await useFetch<Account[]>('/api/accounts');
if (accounts.value) {
  const total = accounts.value.reduce((sum, a) => sum + (a.currentValue || 0), 0);
  if (total > 0) {
    initialAmount.value = total;
  }
}

const simulationData = computed(() => {
  const data = [];
  let current = initialAmount.value;
  const effectiveRate = adjustForInflation.value
    ? yearlyRate.value - inflationRate.value
    : yearlyRate.value;
  const cgtMultiplier = adjustForCapitalGainsTax.value ? 1 - capitalGainsTaxRate.value / 100 : 1;

  for (let i = 0; i <= years.value; i++) {
    data.push({
      year: i,
      value: Math.round(current * 100) / 100,
    });
    const yearlyGains = current * (effectiveRate / 100);
    current += yearlyGains * cgtMultiplier;
  }
  return data;
});

const finalValue = computed(
  () => simulationData.value[simulationData.value.length - 1]?.value || 0,
);
const totalGrowth = computed(() => finalValue.value - initialAmount.value);
</script>

<template>
  <div class="p-6 space-y-6">
    <UCard>
      <template #header>
        <h3 class="font-semibold">Growth Simulator</h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UFormField label="Initial Amount">
          <UInputNumber v-model="initialAmount" :min="0" :step="1000" />
        </UFormField>
        <UFormField label="Yearly Rate (%)">
          <UInputNumber v-model="yearlyRate" :min="0" :max="100" :step="0.5" />
        </UFormField>
        <UFormField label="Time (years)">
          <UInputNumber v-model="years" :min="1" :max="50" />
        </UFormField>
      </div>

      <div class="mb-6 space-y-3">
        <UCheckbox v-model="adjustForInflation" label="Adjust for inflation" />
        <UFormField v-if="adjustForInflation" label="Inflation Rate (%)">
          <UInputNumber v-model="inflationRate" :min="0" :max="100" :step="0.5" />
        </UFormField>
        <UCheckbox v-model="adjustForCapitalGainsTax" label="Adjust for capital gains tax" />
        <UFormField v-if="adjustForCapitalGainsTax" label="Capital Gains Tax Rate (%)">
          <UInputNumber v-model="capitalGainsTaxRate" :min="0" :max="100" :step="0.5" />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UCard variant="subtle">
          <p class="text-xs text-muted">Final Value</p>
          <p class="text-xl font-bold text-primary">
            {{ useFormatters().formatCurrency(finalValue) }}
          </p>
        </UCard>
        <UCard variant="subtle">
          <p class="text-xs text-muted">Total Growth</p>
          <p class="text-xl font-bold text-green-600">
            +{{ useFormatters().formatCurrency(totalGrowth) }}
          </p>
        </UCard>
        <UCard variant="subtle">
          <p class="text-xs text-muted">Growth Multiplier</p>
          <p class="text-xl font-bold">{{ (finalValue / initialAmount).toFixed(2) }}x</p>
        </UCard>
      </div>

      <GrowthSimulatorChart :data="simulationData" />
    </UCard>
  </div>
</template>
