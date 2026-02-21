import { defineConfig } from '@playwright/test';

const port = parseInt(process.env.PORT ?? '3000', 10);

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './reports/e2e',
  webServer: {
    command: 'pnpm dev',
    port,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: `http://localhost:${port}`,
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/e2e' }],
    ['junit', { outputFile: 'reports/e2e/playwright-results.xml' }],
  ],
});
