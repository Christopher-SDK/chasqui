import { mensajeError } from '@chasqui/catalogos';
import { XmlIlegible, parsear, type Hallazgo } from './parseo.js';
import { hoja, type NombreHoja } from './oficial.js';
import { ejecutarHoja } from './xslt.js';

export type { Hallazgo } from './parseo.js';

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
const NOMBRE_GUIA = /^(\d{11})-09-([A-Z0-9]{4})-(\d+)\.xml$/;
const NOMBRE_RESUMEN = /^(\d{11})-(RC|RA)-(\d{8})-(\d+)\.xml$/;

const HOJA_POR_TIPO = {
  '01': 'factura',
  '03': 'boleta',
  '07': 'nota-credito',
  '08': 'nota-debito',
  '09': 'guia-remitente',
  RC: 'resumen',
  RA: 'baja',
} as const satisfies Record<string, NombreHoja>;

export interface OpcionesValidacion {
  /**
   * Fecha de hoy (AAAA-MM-DD) que ven las reglas con current-date(). Por defecto, la fecha en
   * Lima. Las pruebas de conformidad fijan la misma que el oráculo.
   */
  hoy?: string;
}

/**
 * Valida un comprobante, guía, resumen o baja con las reglas oficiales completas de SUNAT
 * (hojas XSL del paquete SFS/OSE, ejecutadas por ./xslt.ts). `nombreArchivo` es el nombre del XML
 * dentro del ZIP: igual que en SUNAT, su tipo decide qué hoja se aplica.
 */
export function validarXml(
  xml: string,
  nombreArchivo: string,
  opciones: OpcionesValidacion = {},
): Veredicto {
  const tipo =
    NOMBRE.exec(nombreArchivo)?.[2] ??
    (NOMBRE_GUIA.test(nombreArchivo) ? '09' : NOMBRE_RESUMEN.exec(nombreArchivo)?.[2]);
  if (!tipo) return rechazo('0159', 'nombre de archivo');

  let doc: Document;
  try {
    doc = parsear(xml);
  } catch (e) {
    if (e instanceof XmlIlegible) return rechazo('0306', 'parser XML');
    throw e;
  }

  const r = ejecutarHoja(hoja(HOJA_POR_TIPO[tipo as keyof typeof HOJA_POR_TIPO]), doc, {
    parametros: { nombreArchivoEnviado: nombreArchivo },
    hoy: opciones.hoy ?? hoyEnLima(),
  });
  if (r.error) return { estado: 'rechazado', error: r.error, observaciones: r.observaciones };
  return {
    estado: r.observaciones.length ? 'observado' : 'aceptado',
    observaciones: r.observaciones,
  };
}

function hoyEnLima(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
}

function rechazo(codigo: string, fuente: string): Veredicto {
  return {
    estado: 'rechazado',
    error: { codigo, mensaje: mensajeError(codigo), fuente },
    observaciones: [],
  };
}
