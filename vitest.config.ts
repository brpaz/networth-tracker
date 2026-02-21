import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['app/**/*.test.ts', 'server/**/*.test.ts'],
    environment: 'happy-dom',
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
      exclude: ['**/*.test.ts', '**/types/**', '**/index.ts'],
    },
  },
});
