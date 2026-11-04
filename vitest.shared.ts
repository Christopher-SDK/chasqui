import { defineConfig } from 'vitest/config';

/** Base de cada proyecto: resuelve los paquetes del workspace desde `src` (condición `source`). */
export default defineConfig({
  resolve: { conditions: ['source'] },
  ssr: { resolve: { conditions: ['source'] } },
  // Pact no envía telemetría.
  test: { env: { PACT_DO_NOT_TRACK: 'true' } },
});
