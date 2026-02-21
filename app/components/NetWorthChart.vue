<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

const props = defineProps<{
  data: Array<{ date: string; total: number }> | null;
}>();

const chartData = computed(() => ({
  labels: (props.data || []).map((d) => d.date),
  datasets: [
    {
      label: 'Net Worth',
      data: (props.data || []).map((d) => d.total),
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      fill: true,
      tension: 0.3,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: false,
    },
  },
};
</script>

<template>
  <div class="h-64">
    <Line v-if="data && data.length" :data="chartData" :options="chartOptions" />
    <div v-else class="flex items-center justify-center h-full text-muted">No data yet</div>
  </div>
</template>
