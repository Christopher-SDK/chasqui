import { createHash } from 'node:crypto';
import { mensajeError } from '@chasqui/catalogos';
import {
  desempaquetar,
  empaquetarCdr,
  generarCdr,
  validarXml,
  verificarFirma,
  type Hallazgo,
} from '@chasqui/ubl-core';
import { siguiente, type Db, type EstadoComprobante } from './db.js';
import type { Eventos } from './eventos.js';

/**
 * Recepción de comprobantes (sendBill). Además de las reglas del XSL oficial, aplica las reglas
 * de servidor que SUNAT no publica como XSL: duplicados (1032/1033), firma (1059/2335) y plazos
 * (2108/2329). Orden y alcance en docs/adr/0006.
 *
 * Semántica de códigos (Greenter, BaseSunat::isExceptionCode): 0100-1999 son excepciones (fault
 * SOAP, sin CDR); 2000-3999 son rechazos con CDR; 4000+ son observaciones dentro del CDR.
 */

export interface Config {
  /** Días calendario para enviar el comprobante (2108). TODO verificar por tipo. */
  plazoEnvioDias: number;
  /** Días hacia adelante que se tolera la fecha de emisión (2329, «mayor a dos días»). */
  toleranciaFuturoDias: number;
}

export const CONFIG_POR_DEFECTO: Config = { plazoEnvioDias: 3, toleranciaFuturoDias: 2 };

export interface Dependencias {
  db: Db;
  ahora: () => Date;
  eventos: Eventos;
  config: Config;
}

export type Canal = 'soap' | 'rest';

export type ResultadoRecepcion =
  | { tipo: 'excepcion'; codigo: string; mensaje: string; nombre: string }
  | {
      tipo: 'cdr';
      id: string;
      estado: Exclude<EstadoComprobante, 'anulado'>;
      codigo: string;
      mensaje: string;
      observaciones: Hallazgo[];
      cdrZip: Uint8Array;
      cdrXml: string;
      nombre: string;
    };

const NOMBRES: Record<string, string> = {
  '01': 'La Factura',
  '03': 'La Boleta de Venta',
  '07': 'La Nota de Credito',
  '08': 'La Nota de Debito',
};

/** Fecha y hora en Lima (UTC-5, sin horario de verano). */
export function enLima(d: Date): { fecha: string; hora: string } {
  const iso = new Date(d.getTime() - 5 * 3600_000).toISOString();
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 19) };
}

const diasEntre = (a: string, b: string) =>
  (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;

export async function recibir(
  deps: Dependencias,
  nombreZip: string,
  zip: Uint8Array,
  canal: Canal,
): Promise<ResultadoRecepcion> {
  const nombre = nombreZip.replace(/\.zip$/i, '');
  const excepcion = (codigo: string, detalle?: string): ResultadoRecepcion => {
    const r = {
      tipo: 'excepcion' as const,
      codigo,
      mensaje: detalle ?? mensajeError(codigo),
      nombre,
    };
    deps.eventos.emitir({
      tipo: 'excepcion',
      servicio: 'sunat-sim',
      canal,
      nombre,
      codigo,
      mensaje: r.mensaje,
      en: deps.ahora().toISOString(),
    });
    return r;
  };

  const abierto = desempaquetar(nombreZip, zip);
  if (!abierto.ok) return excepcion(abierto.codigo);
  const [ruc = '', tipo = '', serie = '', numeroTxt = '0'] = nombre.split('-');
  if (!(tipo in NOMBRES)) return excepcion('0151', `sendBill no recibe el tipo ${tipo}`);
  const numero = Number(numeroTxt);

  // Duplicados: un comprobante se registra una sola vez (1033); si quedó rechazado o anulado, 1032.
  const previo = await deps.db
    .selectFrom('comprobantes')
    .select('estado')
    .where('ruc', '=', ruc)
    .where('tipo', '=', tipo)
    .where('serie', '=', serie)
    .where('numero', '=', numero)
    .executeTakeFirst();
  if (previo)
    return excepcion(
      previo.estado === 'rechazado' || previo.estado === 'anulado' ? '1032' : '1033',
    );

  const firma = verificarFirma(abierto.xml);
  let veredicto = validarXml(abierto.xml, abierto.nombreXml);
  if (veredicto.error?.codigo === '0306') return excepcion('0306');
  if (!firma.valida) {
    if (Number(firma.codigo) < 2000)
      return excepcion(firma.codigo, `${mensajeError(firma.codigo)}: ${firma.detalle}`);
    veredicto = {
      estado: 'rechazado',
      error: { codigo: firma.codigo, mensaje: mensajeError(firma.codigo), fuente: 'firma' },
      observaciones: [],
    };
  }

  const fechaEmision = /<cbc:IssueDate>([^<]+)<\/cbc:IssueDate>/.exec(abierto.xml)?.[1] ?? '';
  const { fecha, hora } = enLima(deps.ahora());
  if (veredicto.estado !== 'rechazado' && fechaEmision) {
    const atraso = diasEntre(fechaEmision, fecha);
    const codigo =
      -atraso > deps.config.toleranciaFuturoDias
        ? '2329'
        : atraso > deps.config.plazoEnvioDias
          ? '2108'
          : null;
    if (codigo)
      veredicto = {
        estado: 'rechazado',
        error: { codigo, mensaje: mensajeError(codigo), fuente: 'plazos' },
        observaciones: veredicto.observaciones,
      };
  }

  if (veredicto.error && Number(veredicto.error.codigo) < 2000)
    return excepcion(veredicto.error.codigo);

  const serieNumero = `${serie}-${String(numero)}`;
  const aceptado = veredicto.estado !== 'rechazado';
  const codigo = aceptado ? '0' : (veredicto.error?.codigo ?? '0100');
  const mensaje = aceptado
    ? `${NOMBRES[tipo] ?? 'El comprobante'} numero ${serie}-${numeroTxt.padStart(8, '0')}, ha sido aceptada`
    : (veredicto.error?.mensaje ?? '');
  const id = String(await siguiente(deps.db, 'cdr')).padStart(12, '0');
  const receptorTipo = /<cac:AccountingCustomerParty>[\s\S]*?schemeID="([^"]+)">([^<]+)</.exec(
    abierto.xml,
  );
  const cdrXml = generarCdr({
    nombre,
    serieNumero,
    rucEmisor: ruc,
    ...(receptorTipo ? { receptor: `${receptorTipo[1] ?? ''}-${receptorTipo[2] ?? ''}` } : {}),
    codigo,
    descripcion: mensaje,
    observaciones: veredicto.observaciones.map((o) => ({ codigo: o.codigo, mensaje: o.mensaje })),
    fecha,
    hora,
    id,
  });
  const cdrZip = empaquetarCdr(nombre, cdrXml);
  const estado = veredicto.estado;

  await deps.db
    .insertInto('comprobantes')
    .values({
      id: nombre,
      ruc,
      tipo,
      serie,
      numero,
      fecha_emision: fechaEmision,
      hash: createHash('sha256').update(abierto.xml).digest('hex'),
      estado,
      codigo,
      mensaje,
      observaciones: JSON.stringify(veredicto.observaciones),
      canal,
      xml: abierto.xml,
      cdr: Buffer.from(cdrZip).toString('base64'),
      recibido_en: deps.ahora().toISOString(),
    })
    .execute();

  deps.eventos.emitir({
    tipo: 'comprobante',
    servicio: 'sunat-sim',
    canal,
    nombre,
    estado,
    codigo,
    mensaje,
    observaciones: veredicto.observaciones.map((o) => o.codigo),
    en: deps.ahora().toISOString(),
  });
  return {
    tipo: 'cdr',
    id: nombre,
    estado,
    codigo,
    mensaje,
    observaciones: veredicto.observaciones,
    cdrZip,
    cdrXml,
    nombre,
  };
}
