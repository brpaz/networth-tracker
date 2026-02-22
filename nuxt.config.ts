export default defineNuxtConfig({
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
