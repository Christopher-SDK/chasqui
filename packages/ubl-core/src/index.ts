export * from './modelo.js';
export { Decimal, type DecimalLike } from './decimal.js';
export { calcular, calcularLinea, TASA_IGV, PORCENTAJE_IGV } from './calculos.js';
export type { ComprobanteCalculado, LineaCalculada, Totales, TotalPorTributo } from './calculos.js';
export { generarXml, nombreArchivo, serieNumero, NS, ID_FIRMA } from './xml.js';
export { firmar, verificarFirma, type OpcionesFirma, type ResultadoFirma } from './firma.js';
export { empaquetar, desempaquetar, type ResultadoZip } from './zip.js';
export {
  validarXml,
  type Veredicto,
  type EstadoValidacion,
  type Hallazgo,
} from './validador/index.js';
export { CERTIFICADO_PRUEBA, CLAVE_PRUEBA } from './certificado-prueba.js';
export {
  generarCdr,
  empaquetarCdr,
  leerCdr,
  RUC_SIMULADOR,
  type DatosCdr,
  type CdrLeido,
} from './cdr.js';

import { calcular } from './calculos.js';
import { firmar, type OpcionesFirma } from './firma.js';
import type { Comprobante } from './modelo.js';
import { generarXml, nombreArchivo } from './xml.js';
import { empaquetar } from './zip.js';

/** Atajo: calcula, genera, firma y empaqueta. Devuelve lo que se envía a sendBill. */
export function emitir(c: Comprobante, firma: OpcionesFirma = {}) {
  const nombre = nombreArchivo(c);
  const xml = firmar(generarXml(calcular(c)), firma);
  return {
    nombreZip: `${nombre}.zip`,
    nombreXml: `${nombre}.xml`,
    xml,
    zip: empaquetar(nombre, xml),
  };
}
export {
  generarBaja,
  generarResumen,
  lineaResumen,
  nombreBaja,
  nombreResumen,
  type ComunicacionBaja,
  type LineaBaja,
  type LineaResumen,
  type ResumenDiario,
} from './resumenes.js';
export { generarGuia, nombreGuia, type GuiaRemision } from './guia.js';
