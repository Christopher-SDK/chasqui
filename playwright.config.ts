import { defineConfig, devices } from '@playwright/test';

/**
 * E2E del panel contra el ecosistema en un proceso (puertos 7110-7410) y el panel en Vite (:7510),
 * para no chocar con el Docker local en 7100-7600. Trazas y video se guardan siempre en CI y al
 * fallar en local.
 */
const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  reporter: CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'reports/e2e' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'reports/e2e' }]],
  outputDir: 'reports/e2e-resultados',
  use: {
    baseURL: 'http://127.0.0.1:7510',
    trace: CI ? 'on' : 'retain-on-failure',
    video: CI ? 'on' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: 'pnpm --filter @chasqui/ecosistema start',
      env: { CHASQUI_PUERTO_BASE: '7110' },
      url: 'http://127.0.0.1:7410/salud',
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
    {
      command: 'pnpm --filter @chasqui/panel exec vite --port 7510 --host 127.0.0.1 --strictPort',
      env: {
        SUNAT_URL: 'http://127.0.0.1:7110',
        PAGOS_URL: 'http://127.0.0.1:7210',
        IDENTIDAD_URL: 'http://127.0.0.1:7310',
        CAOS_URL: 'http://127.0.0.1:7410',
      },
      url: 'http://127.0.0.1:7510',
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
  ],
});
