import { mensajeError } from '@chasqui/catalogos';
import xpath from 'xpath';
import { NS } from '../xml.js';
import type { TipoComprobante } from '../modelo.js';
import { Contexto, Rechazo, XmlIlegible, parsear, type Hallazgo } from './motor.js';
import { ARCHIVO_XSL, SECUENCIAS } from './reglas.js';

export type { Hallazgo } from './motor.js';

export type EstadoValidacion = 'aceptado' | 'observado' | 'rechazado';

export interface Veredicto {
  estado: EstadoValidacion;
  /** Error que detuvo la validación (solo si estado = 'rechazado'). */
  error?: Hallazgo;
  /** Observaciones acumuladas hasta el final o hasta el error. */
  observaciones: Hallazgo[];
}

// El número no se limita aquí: el formato SERIE-CORRELATIVO lo valida la regla 1001 del XSL.
const NOMBRE = /^(\d{11})-(01|03|07|08)-([A-Z0-9]{4})-(\d+)\.xml$/;

/**
 * Valida un comprobante UBL 2.1 con el subconjunto de reglas oficiales de SUNAT portado en
 * ./reglas.ts. `nombreArchivo` es el nombre del XML dentro del ZIP (RUC-TIPO-SERIE-NUMERO.xml):
 * igual que en SUNAT, el tipo del nombre decide qué reglas se aplican.
 */
export function validarXml(xml: string, nombreArchivo: string): Veredicto {
  const m = NOMBRE.exec(nombreArchivo);
  if (!m) return rechazo('0159', 'nombre de archivo');
  const tipo = m[2] as TipoComprobante;

  let doc: Document;
  try {
    doc = parsear(xml);
  } catch (e) {
    if (e instanceof XmlIlegible) return rechazo('0306', 'parser XML');
    throw e;
  }

  const raiz = doc.documentElement;
  const n = nombreArchivo;
  // Variables de la plantilla principal del XSL (bloque «INICIO SUNAT»).
  const ctx = new Contexto(raiz, ARCHIVO_XSL[tipo], {
    nombreArchivoEnviado: n,
    numeroRuc: n.substring(0, 11),
    tipoComprobante: n.substring(12, 14),
    numeroSerie: n.substring(15, 19),
    numeroComprobante: n.substring(20, n.length - 4),
    // Conjuntos de nodos, como en el XSL: si el nodo falta, toda comparación con él es falsa.
    monedaComprobante: nodos('cbc:DocumentCurrencyCode/text()', raiz),
    tipoOperacion: nodos('cbc:InvoiceTypeCode/@listID', raiz),
  });

  try {
    SECUENCIAS[tipo](ctx);
  } catch (e) {
    if (e instanceof Rechazo)
      return { estado: 'rechazado', error: e.hallazgo, observaciones: ctx.observaciones };
    throw e;
  }
  return {
    estado: ctx.observaciones.length ? 'observado' : 'aceptado',
    observaciones: ctx.observaciones,
  };
}

const seleccionar = xpath.useNamespaces({ cbc: NS.cbc });

function nodos(expr: string, contexto: Node): Node[] {
  return seleccionar(expr, contexto) as Node[];
}

function rechazo(codigo: string, fuente: string): Veredicto {
  return {
    estado: 'rechazado',
    error: { codigo, mensaje: mensajeError(codigo), fuente },
    observaciones: [],
  };
}
