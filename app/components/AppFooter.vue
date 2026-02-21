<script setup lang="ts">
const {
  public: { version, gitRef },
} = useRuntimeConfig();

const year = new Date().getFullYear();
</script>

<template>
  <footer
    class="border-t border-(--ui-border) px-6 py-3 text-xs text-muted flex items-center justify-between gap-4"
  >
    <span>&copy; {{ year }} Bruno Paz</span>
    <span class="flex items-center gap-2">
      <span>v{{ version }}</span>
      <span v-if="gitRef" class="font-mono opacity-60">{{ gitRef.slice(0, 7) }}</span>
    </span>
  </footer>
</template>
