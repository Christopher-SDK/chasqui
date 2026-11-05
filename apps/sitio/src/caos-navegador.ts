/**
 * La decisión de caos de @chasqui/chaos-engine (src/decision.ts) para el navegador: el mismo
 * algoritmo, con WebCrypto en vez de node:crypto. test/caos.test.ts comprueba que da exactamente lo
 * mismo que el motor real para miles de semillas y claves.
 */
import { PERFILES } from '../../../packages/chaos-engine/src/perfiles.js';
import type { Falla, Regla } from '../../../packages/chaos-engine/src/modelo.js';

export { PERFILES };

/** Número en [0, 1): primeros 4 bytes (big-endian) de sha256(semilla \0 partes…) / 2^32. */
export async function azar(semilla: string, ...partes: string[]): Promise<number> {
  const datos = new TextEncoder().encode([semilla, ...partes].join('\u0000'));
  const h = new DataView(await crypto.subtle.digest('SHA-256', datos));
  return h.getUint32(0, false) / 2 ** 32;
}

export interface Peticion {
  servicio: string;
  ruta: string;
  clave: string;
}

/** Fallas que el motor real aplicaría a esta petición con estas reglas y esta semilla. */
export async function decidir(
  reglas: readonly Regla[],
  semilla: string,
  p: Peticion,
): Promise<Falla[]> {
  const fallas: Falla[] = [];
  for (const [i, r] of reglas.entries()) {
    if (r.servicio !== undefined && r.servicio !== p.servicio) continue;
    if (r.ruta !== undefined && !p.ruta.startsWith(r.ruta)) continue;
    if ((await azar(semilla, String(i), p.clave)) * 100 < r.porcentaje) fallas.push(r.falla);
  }
  return fallas;
}

/** Latencia de una falla: fija, o un punto del rango elegido de forma determinista. */
export async function milisegundos(
  ms: number | readonly [number, number],
  semilla: string,
  clave: string,
): Promise<number> {
  if (typeof ms === 'number') return ms;
  const [min, max] = ms[0] <= ms[1] ? ms : [ms[1], ms[0]];
  return Math.round(min + (await azar(semilla, 'latencia', clave)) * (max - min));
}
