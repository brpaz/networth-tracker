import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Net Worth Tracker',
  description:
    'A simple net worth tracking application built with Nuxt, Nuxt UI and SQLite for data storage.',

  srcExclude: ['**/README.md'],

  ignoreDeadLinks: [/^https?:\/\/localhost/],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/getting-started' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Tech Stack', link: '/tech-stack' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Architecture', link: '/architecture' },
          { text: 'Development Environment', link: '/development' },
          { text: 'CI/CD', link: '/ci-cd' },
        ],
      },
      {
        text: 'Architecture Decision Records',
        items: [
          {
            text: 'ADR-001: SQLite over PostgreSQL',
            link: '/adr/001-use-sqlite-instead-of-postgresql',
          },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/brpaz/networth-tracker' }],

    search: {
      provider: 'local',
    },
  },
});
