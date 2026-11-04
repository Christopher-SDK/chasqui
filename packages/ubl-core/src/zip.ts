import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';

/**
 * Empaquetado como lo espera sendBill: un ZIP llamado RUC-TIPO-SERIE-NUMERO.zip que contiene
 * un único RUC-TIPO-SERIE-NUMERO.xml. Códigos oficiales de CatalogoErrores.xml.
 */

// Fecha fija: el mismo XML produce siempre el mismo ZIP (determinismo en pruebas y en CI).
const FECHA_FIJA = new Date('2026-01-01T00:00:00Z');

export function empaquetar(nombreBase: string, xml: string): Uint8Array {
  return zipSync({ [`${nombreBase}.xml`]: [strToU8(xml), { mtime: FECHA_FIJA }] });
}

export type ResultadoZip =
  | { ok: true; nombreXml: string; xml: string }
  | { ok: false; codigo: '0151' | '0155' | '0156' | '0159' | '0160' | '0161'; detalle: string };

// Comprobantes (RUC-TIPO-SERIE-NUMERO) y resúmenes o bajas (RUC-RC|RA-AAAAMMDD-CORRELATIVO).
const NOMBRE_ZIP = /^\d{11}-((01|03|07|08|09)-[A-Z0-9]{3,4}-\d{1,8}|(RC|RA)-\d{8}-\d{1,5})\.zip$/i;

/** Abre el ZIP de sendBill y valida nombres y contenido. */
export function desempaquetar(nombreZip: string, datos: Uint8Array): ResultadoZip {
  if (!NOMBRE_ZIP.test(nombreZip))
    return { ok: false, codigo: '0151', detalle: `Nombre de ZIP inválido: ${nombreZip}` };
  let archivos: Record<string, Uint8Array>;
  try {
    archivos = unzipSync(datos);
  } catch (e) {
    return { ok: false, codigo: '0156', detalle: `ZIP corrupto: ${String(e)}` };
  }
  const entradas = Object.entries(archivos).filter(([n]) => !n.endsWith('/'));
  const [primera] = entradas;
  if (!primera) return { ok: false, codigo: '0155', detalle: 'El ZIP está vacío' };
  const [nombreXml, contenido] = primera;
  if (!/\.xml$/i.test(nombreXml))
    return { ok: false, codigo: '0159', detalle: `Nombre de XML inválido: ${nombreXml}` };
  if (nombreXml.replace(/\.xml$/i, '') !== nombreZip.replace(/\.zip$/i, '')) {
    return { ok: false, codigo: '0161', detalle: `${nombreXml} no coincide con ${nombreZip}` };
  }
  if (contenido.length === 0) return { ok: false, codigo: '0160', detalle: 'El XML está vacío' };
  // Sin el BOM UTF-8 que agregan muchos generadores (.NET, Excel): el parser lo rechazaría.
  return { ok: true, nombreXml, xml: strFromU8(contenido).replace(/^\uFEFF/, '') };
}
