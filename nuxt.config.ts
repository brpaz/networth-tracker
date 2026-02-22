export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '192x192', href: '/icon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icon-512x512.png' },
      ],
    },
  },

  modules: ['@nuxt/ui', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  nitro: {
    preset: 'node-server',
  },

  typescript: {
    strict: true,
  },

  runtimeConfig: {
    databaseUrl: 'file:./data/networth.db',
    version: process.env.VERSION || '',
    gitRef: process.env.GIT_REF || '',
    public: {
      baseCurrency: 'EUR',
    },
  },

  compatibilityDate: '2025-02-14',
});
