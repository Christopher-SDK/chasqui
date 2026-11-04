import { levantarEcosistema } from './index.js';

/**
 * Modo todo en uno: los cuatro servicios en un proceso, sin Docker.
 *   CHASQUI_PUERTO_BASE=7100 → sunat 7100, pagos 7200, identidad 7300, caos 7400.
 */
const base = Number(process.env.CHASQUI_PUERTO_BASE ?? 7100);
const eco = await levantarEcosistema({
  puertos: { sunat: base, pagos: base + 100, identidad: base + 200, caos: base + 300 },
  registro: process.env.CHASQUI_REGISTRO === '1',
});
console.log(`Chasqui en marcha: ${JSON.stringify(eco.urls)}`);
for (const s of ['SIGINT', 'SIGTERM'] as const)
  process.on(s, () => {
    void eco.cerrar().then(() => process.exit(0));
  });
