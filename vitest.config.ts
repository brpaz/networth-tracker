import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    include: ['app/**/*.test.ts', 'server/**/*.test.ts'],
    reporters: ['default', 'html', 'junit'],
    outputFile: {
      html: 'reports/unit/index.html',
      junit: 'reports/unit/junit.xml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'reports/coverage',
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
