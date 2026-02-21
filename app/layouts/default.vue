<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const colorMode = useColorMode();

const items: NavigationMenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/',
  },
  {
    label: 'Accounts',
    icon: 'i-lucide-wallet',
    to: '/accounts',
  },
  {
    label: 'Simulator',
    icon: 'i-lucide-trending-up',
    to: '/simulator',
  },
];

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
}

const colorModeIcon = computed(() =>
  colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon',
);
</script>

<template>
  <div class="flex h-dvh">
    <aside class="hidden md:flex w-60 flex-col border-r border-(--ui-border) bg-(--ui-bg-elevated)">
      <div class="flex items-center gap-2 px-4 py-4">
        <UIcon name="i-lucide-landmark" class="size-5 text-primary" />
        <span class="font-bold text-sm">Net Worth Tracker</span>
      </div>

      <nav class="flex-1 px-2">
        <UNavigationMenu :items="items" orientation="vertical" />
      </nav>

      <div class="px-4 py-4">
        <UButton
          :icon="colorModeIcon"
          variant="ghost"
          color="neutral"
          block
          :label="colorMode.value === 'dark' ? 'Light mode' : 'Dark mode'"
          @click="toggleColorMode"
        />
      </div>
    </aside>

    <div class="flex flex-1 flex-col min-w-0">
      <header
        class="flex md:hidden items-center justify-between border-b border-(--ui-border) px-4 py-3"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-landmark" class="size-5 text-primary" />
          <span class="font-bold text-sm">Net Worth Tracker</span>
        </div>
        <UButton :icon="colorModeIcon" variant="ghost" color="neutral" @click="toggleColorMode" />
      </header>

      <nav class="flex md:hidden border-b border-(--ui-border) px-2 py-2">
        <UNavigationMenu :items="items" />
      </nav>

      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
      <AppFooter />
    </div>
  </div>
</template>
