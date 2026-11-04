import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { conditions: ['source'] },
  test: {
    projects: ['apps/*', 'packages/*', 'examples/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'reports/coverage',
    },
  },
});
