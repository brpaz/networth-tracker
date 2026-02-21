import { defineConfig } from '@playwright/test';

const port = parseInt(process.env.PORT ?? '3000', 10);

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './reports/e2e-results',
  webServer: {
    command: 'pnpm dev',
    port,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: `http://localhost:${port}`,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/e2e' }],
    ['junit', { outputFile: 'reports/e2e-results.xml' }],
  ],
});
