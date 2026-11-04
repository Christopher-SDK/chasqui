import { createHash } from 'node:crypto';
import { Falla, type EstadoCaos, type Regla } from './modelo.js';
import { perfil } from './perfiles.js';

/**
 * Número en [0, 1) derivado de la semilla y de una clave estable de la petición. A diferencia de
 * un PRNG secuencial, el resultado no depende del orden en que llegan las peticiones: la misma
 * semilla y la misma clave dan siempre la misma decisión, también con tráfico concurrente (ADR 0007).
 */
export function azar(semilla: string, ...partes: string[]): number {
  const h = createHash('sha256')
    .update([semilla, ...partes].join('\u0000'))
    .digest();
  return h.readUInt32BE(0) / 2 ** 32;
}

export interface Peticion {
  servicio: string;
  ruta: string;
  /** Clave estable: X-Chasqui-Clave, Idempotency-Key o método + ruta + contador. */
  clave: string;
  /** Valor de la cabecera X-Chasqui-Chaos, si viene. */
  cabecera?: string | undefined;
}

export class CabeceraInvalida extends Error {}

/** Reglas efectivas para una petición: las del estado, o las que pide la cabecera. */
export function reglasEfectivas(estado: EstadoCaos, cabecera?: string): readonly Regla[] {
  if (cabecera === undefined || cabecera === '') return estado.reglas;
  if (cabecera === 'ninguno') return [];
  if (cabecera.startsWith('falla:')) {
    const r = Falla.safeParse({ tipo: cabecera.slice(6) });
    if (!r.success) throw new CabeceraInvalida(`Falla desconocida: ${cabecera.slice(6)}`);
    return [{ porcentaje: 100, falla: r.data }];
  }
  const p = perfil(cabecera);
  if (!p) throw new CabeceraInvalida(`Perfil desconocido: ${cabecera}`);
  return p.reglas;
}

/** Fallas que corresponden a la petición, en el orden de las reglas. */
export function decidir(estado: EstadoCaos, p: Peticion): Falla[] {
  return reglasEfectivas(estado, p.cabecera).flatMap((r, i) => {
    if (r.servicio !== undefined && r.servicio !== p.servicio) return [];
    if (r.ruta !== undefined && !p.ruta.startsWith(r.ruta)) return [];
    return azar(estado.semilla, String(i), p.clave) * 100 < r.porcentaje ? [r.falla] : [];
  });
}

/** Milisegundos de una latencia: fijos, o un punto del rango elegido de forma determinista. */
export function milisegundos(
  ms: number | readonly [number, number],
  semilla: string,
  clave: string,
): number {
  if (typeof ms === 'number') return ms;
  const [min, max] = ms[0] <= ms[1] ? ms : [ms[1], ms[0]];
  return Math.round(min + azar(semilla, 'latencia', clave) * (max - min));
}
