import { readFileSync } from 'node:fs';
import { Hoja, type Catalogos, type HojaCompilada } from './xslt.js';

/**
 * Hojas oficiales compiladas por scripts/compilar-reglas.mjs (src/validador/oficial/*.json). Se
 * cargan la primera vez que se usan.
 */
export type NombreHoja =
  'factura' | 'boleta' | 'nota-credito' | 'nota-debito' | 'guia-remitente' | 'resumen' | 'baja';

const leer = (archivo: string): unknown =>
  JSON.parse(readFileSync(new URL(`./oficial/${archivo}`, import.meta.url), 'utf8'));

let catalogos: Catalogos | undefined;
const hojas = new Map<NombreHoja, Hoja>();

export function hoja(nombre: NombreHoja): Hoja {
  let h = hojas.get(nombre);
  if (!h) {
    catalogos ??= leer('catalogos.json') as Catalogos;
    h = new Hoja(leer(`${nombre}.json`) as HojaCompilada, catalogos);
    hojas.set(nombre, h);
  }
  return h;
}
