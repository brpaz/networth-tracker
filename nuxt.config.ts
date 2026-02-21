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
    public: {
      version: process.env.VERSION || 'dev',
      gitRef: process.env.GIT_REF || '',
    },
  },

  compatibilityDate: '2025-02-14',
});
