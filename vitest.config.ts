import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({
  resolve: {
    alias: {
      h3: path.resolve('./node_modules/.pnpm/h3@1.15.5/node_modules/h3'),
    },
  },
  test: {
    include: ['app/**/*.test.ts', 'server/**/*.test.ts'],
    environment: 'happy-dom',
    setupFiles: ['server/test/setup-globals.ts'],
    reporters: [
      'default',
      ['html', { outputFile: 'reports/unit/index.html' }],
      ['junit', { outputFile: 'reports/unit/junit.xml' }],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'reports/coverage',
      reportOnFailure: true,
      include: [
        'app/components/**/*',
        'app/composables/**/*',
        'app/utils/**/*',
        'app/plugins/**/*',
        'app/middleware/**/*',
        'server/**/*',
      ],
      exclude: ['**/*.test.ts', '**/types/**', '**/index.ts', '**/*.vue', '**/*.sql', '**/*.json'],
    },
  },
});
