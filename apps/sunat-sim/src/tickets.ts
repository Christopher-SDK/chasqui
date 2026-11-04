import { mensajeError } from '@chasqui/catalogos';
import { desempaquetar, empaquetarCdr, generarCdr, verificarFirma } from '@chasqui/ubl-core';
import { siguiente } from './db.js';
import { enLima, type Canal, type Dependencias } from './recepcion.js';

/**
 * Resumen diario (RC) y comunicación de baja (RA): sendSummary devuelve un ticket y el resultado
 * se obtiene con getStatus. Estados de getStatus (Greenter, ExtService): 98 en proceso,
 * 0 procesado, 99 procesado con errores.
 */

const NOMBRE = /^(\d{11})-(RC|RA)-(\d{8})-(\d{1,5})\.zip$/;

/** Milisegundos que un ticket permanece «en proceso». Configurable para pruebas y caos. */
export const DEMORA_TICKET_MS = Number(process.env.DEMORA_TICKET_MS ?? 2000);

export type ResultadoResumen =
  { tipo: 'excepcion'; codigo: string; mensaje: string } | { tipo: 'ticket'; ticket: string };

export async function recibirResumen(
  deps: Dependencias,
  nombreZip: string,
  zip: Uint8Array,
  canal: Canal,
): Promise<ResultadoResumen> {
  const m = NOMBRE.exec(nombreZip);
  if (!m) return { tipo: 'excepcion', codigo: '0151', mensaje: mensajeError('0151') };
  const abierto = desempaquetar(nombreZip, zip);
  if (!abierto.ok)
    return { tipo: 'excepcion', codigo: abierto.codigo, mensaje: mensajeError(abierto.codigo) };
  const firma = verificarFirma(abierto.xml);
  if (!firma.valida && firma.codigo === '1059')
    return { tipo: 'excepcion', codigo: '1059', mensaje: mensajeError('1059') };

  const ahora = deps.ahora();
  const ticket = `${enLima(ahora).fecha.replaceAll('-', '')}${String(await siguiente(deps.db, 'ticket')).padStart(7, '0')}`;
  const codigo = firma.valida ? '0' : firma.codigo;
  await deps.db
    .insertInto('tickets')
    .values({
      ticket,
      tipo: m[2] ?? '',
      nombre: nombreZip.replace(/\.zip$/i, ''),
      estado: '98',
      codigo,
      cdr: null,
      xml: abierto.xml,
      creado_en: ahora.toISOString(),
      listo_en: new Date(ahora.getTime() + DEMORA_TICKET_MS).toISOString(),
    })
    .execute();
  deps.eventos.emitir({
    tipo: 'ticket',
    servicio: 'sunat-sim',
    canal,
    nombre: nombreZip,
    ticket,
    estado: '98',
    en: ahora.toISOString(),
  });
  return { tipo: 'ticket', ticket };
}

export type ResultadoTicket =
  | { tipo: 'excepcion'; codigo: string; mensaje: string }
  | { tipo: 'estado'; estado: '98' | '0' | '99'; cdrZip?: Uint8Array };

export async function consultarTicket(
  deps: Dependencias,
  ticket: string,
): Promise<ResultadoTicket> {
  const t = await deps.db
    .selectFrom('tickets')
    .selectAll()
    .where('ticket', '=', ticket)
    .executeTakeFirst();
  if (!t) return { tipo: 'excepcion', codigo: '0127', mensaje: mensajeError('0127') };
  const ahora = deps.ahora();
  if (t.estado === '98' && ahora.toISOString() < t.listo_en)
    return { tipo: 'estado', estado: '98' };
  if (t.estado !== '98' && t.cdr)
    return { tipo: 'estado', estado: t.estado as '0' | '99', cdrZip: Buffer.from(t.cdr, 'base64') };

  // Se resuelve en la primera consulta posterior a `listo_en`: determinista y sin temporizadores.
  const aceptado = t.codigo === '0';
  if (aceptado && t.tipo === 'RA') await aplicarBaja(deps, t.xml, t.nombre.slice(0, 11));
  const { fecha, hora } = enLima(ahora);
  const cdrXml = generarCdr({
    nombre: t.nombre,
    serieNumero: t.nombre.slice(12),
    rucEmisor: t.nombre.slice(0, 11),
    codigo: t.codigo,
    descripcion: aceptado
      ? `El ${t.tipo === 'RA' ? 'Comunicacion de baja' : 'Resumen diario'} ${t.nombre.slice(12)}, ha sido aceptado`
      : mensajeError(t.codigo),
    observaciones: [],
    fecha,
    hora,
    id: ticket,
  });
  const cdrZip = empaquetarCdr(t.nombre, cdrXml);
  const estado = aceptado ? '0' : '99';
  await deps.db
    .updateTable('tickets')
    .set({ estado, cdr: Buffer.from(cdrZip).toString('base64') })
    .where('ticket', '=', ticket)
    .execute();
  deps.eventos.emitir({
    tipo: 'ticket',
    servicio: 'sunat-sim',
    nombre: t.nombre,
    ticket,
    estado,
    en: ahora.toISOString(),
  });
  return { tipo: 'estado', estado, cdrZip };
}

/** Marca como anulados los comprobantes listados en la comunicación de baja. */
async function aplicarBaja(deps: Dependencias, xml: string, ruc: string) {
  const lineas = xml.matchAll(
    /<cbc:DocumentTypeCode>(\d{2})<\/cbc:DocumentTypeCode>\s*<sac:DocumentSerialID>([^<]+)<\/sac:DocumentSerialID>\s*<sac:DocumentNumberID>(\d+)<\/sac:DocumentNumberID>/g,
  );
  for (const [, tipo = '', serie = '', numero = '0'] of lineas) {
    await deps.db
      .updateTable('comprobantes')
      .set({ estado: 'anulado' })
      .where('ruc', '=', ruc)
      .where('tipo', '=', tipo)
      .where('serie', '=', serie)
      .where('numero', '=', Number(numero))
      .execute();
  }
}
