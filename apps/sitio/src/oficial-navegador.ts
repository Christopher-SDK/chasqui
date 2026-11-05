import {
  Hoja,
  type Catalogos,
  type HojaCompilada,
} from '../../../packages/ubl-core/src/validador/xslt.js';

/**
 * Sustituye a packages/ubl-core/src/validador/oficial.ts en el navegador (alias en vite.config.ts):
 * las hojas oficiales compiladas se piden por fetch a /reglas/ y se cachean. `precargar` debe
 * resolverse antes de llamar a validarXml, que es síncrono.
 */
export type NombreHoja =
  'factura' | 'boleta' | 'nota-credito' | 'nota-debito' | 'guia-remitente' | 'resumen' | 'baja';

const datos = new Map<string, Promise<unknown>>();
const listos = new Map<string, unknown>();
const hojas = new Map<NombreHoja, Hoja>();

function pedir(nombre: string): Promise<unknown> {
  let p = datos.get(nombre);
  if (!p) {
    p = fetch(`/reglas/${nombre}.json`).then((r) => {
      if (!r.ok)
        throw new Error(`No se pudieron cargar las reglas (${nombre}): HTTP ${String(r.status)}`);
      return r.json();
    });
    p.then((d) => listos.set(nombre, d)).catch(() => datos.delete(nombre));
    datos.set(nombre, p);
  }
  return p;
}

export async function precargar(nombre: NombreHoja): Promise<void> {
  await Promise.all([pedir('catalogos'), pedir(nombre)]);
}

export function hoja(nombre: NombreHoja): Hoja {
  let h = hojas.get(nombre);
  if (!h) {
    const hc = listos.get(nombre),
      cat = listos.get('catalogos');
    if (!hc || !cat) throw new Error(`Reglas no precargadas: ${nombre}`);
    h = new Hoja(hc as HojaCompilada, cat as Catalogos);
    hojas.set(nombre, h);
  }
  return h;
}
