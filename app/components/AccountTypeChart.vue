<script setup lang="ts">
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  data: Array<{ type: string; total: number }> | null;
}>();

const colors = [
  'rgb(147, 51, 234)',
  'rgb(59, 130, 246)',
  'rgb(16, 185, 129)',
  'rgb(245, 158, 11)',
  'rgb(239, 68, 68)',
  'rgb(107, 114, 128)',
];

const chartData = computed(() => ({
  labels: (props.data || []).map((d) => d.type),
  datasets: [
    {
      data: (props.data || []).map((d) => d.total),
      backgroundColor: colors.slice(0, (props.data || []).length),
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};
</script>

<template>
  <div class="h-64">
    <Doughnut v-if="data && data.length" :data="chartData" :options="chartOptions" />
    <div v-else class="flex items-center justify-center h-full text-muted">No data yet</div>
  </div>
</template>
