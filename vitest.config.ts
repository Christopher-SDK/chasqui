import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['apps/*', 'packages/*', 'examples/*'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**', 'apps/*/src/**'],
      exclude: ['**/generado.ts', '**/certificado-prueba.ts', 'apps/*/src/index.ts'],
      // Mínimo exigido al núcleo (README › Estrategia de pruebas). Bajar de aquí rompe la CI.
      thresholds: {
        'packages/ubl-core/src/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
        'packages/chaos-engine/src/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
        'packages/catalogos/src/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
        'packages/test-kit/src/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
      },
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'reports/coverage',
    },
  },
});
