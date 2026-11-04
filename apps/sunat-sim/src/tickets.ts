import { mensajeError } from '@chasqui/catalogos';
import {
  desempaquetar,
  empaquetarCdr,
  generarCdr,
  validarXml,
  verificarFirma,
} from '@chasqui/ubl-core';
import type { Falla } from '@chasqui/chaos-engine';
import { siguiente } from './db.js';
import { enLima, type Canal, type Dependencias } from './recepcion.js';

/**
 * Resumen diario (RC) y comunicación de baja (RA): sendSummary devuelve un ticket y el resultado
 * se obtiene con getStatus. Estados de getStatus (Greenter, ExtService): 98 en proceso,
 * 0 procesado, 99 procesado con errores.
 */

const NOMBRE = /^(\d{11})-(RC|RA)-(\d{8})-(\d{1,5})\.zip$/;

/** Milisegundos que un ticket permanece «en proceso». Configurable para pruebas y caos. */
/** Fecha de resolución de un ticket que nunca resuelve. */
export const NUNCA = '9999-12-31T23:59:59.999Z';

export const DEMORA_TICKET_MS = Number(process.env.DEMORA_TICKET_MS ?? 2000);

export type ResultadoResumen =
  { tipo: 'excepcion'; codigo: string; mensaje: string } | { tipo: 'ticket'; ticket: string };

export async function recibirResumen(
  deps: Dependencias,
  nombreZip: string,
  zip: Uint8Array,
  canal: Canal,
  caos: readonly Falla[] = [],
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
  // Las reglas XSL oficiales se aplican al recibir; el resultado se entrega con getStatus.
  const veredicto = validarXml(abierto.xml, abierto.nombreXml);
  const codigo = !firma.valida ? firma.codigo : (veredicto.error?.codigo ?? '0');
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
      // Caos «ticketEterno»: el ticket queda en proceso (98) para siempre.
      listo_en: caos.some((f) => f.tipo === 'ticketEterno')
        ? NUNCA
        : new Date(ahora.getTime() + DEMORA_TICKET_MS).toISOString(),
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
  let codigo = t.codigo;
  if (codigo === '0') {
    const ruc = t.nombre.slice(0, 11);
    codigo =
      t.tipo === 'RA'
        ? await aplicarBaja(deps, t.xml, ruc, ahora)
        : await aplicarResumen(deps, t.xml, ruc);
  }
  const aceptado = codigo === '0';
  const { fecha, hora } = enLima(ahora);
  const cdrXml = generarCdr({
    nombre: t.nombre,
    serieNumero: t.nombre.slice(12),
    rucEmisor: t.nombre.slice(0, 11),
    codigo,
    descripcion: aceptado
      ? `El ${t.tipo === 'RA' ? 'Comunicacion de baja' : 'Resumen diario'} ${t.nombre.slice(12)}, ha sido aceptado`
      : mensajeError(codigo),
    observaciones: [],
    fecha,
    hora,
    id: ticket,
  });
  const cdrZip = empaquetarCdr(t.nombre, cdrXml);
  const estado = aceptado ? '0' : '99';
  await deps.db
    .updateTable('tickets')
    .set({ estado, codigo, cdr: Buffer.from(cdrZip).toString('base64') })
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

const lineasBaja = (xml: string) =>
  [
    ...xml.matchAll(
      /<cbc:DocumentTypeCode>(\d{2})<\/cbc:DocumentTypeCode><sac:DocumentSerialID>([^<]+)<\/sac:DocumentSerialID><sac:DocumentNumberID>(\d+)<\/sac:DocumentNumberID>/g,
    ),
  ].map(([, tipo = '', serie = '', numero = '0']) => ({ tipo, serie, numero: Number(numero) }));

/**
 * Reglas de servidor de la baja (CatalogoErrores.xml): 2105 no registrado, 2323 ya dado de baja,
 * 2958 fuera de plazo desde la recepción. Si todo pasa, los comprobantes quedan anulados.
 * Devuelve '0' o el código de rechazo.
 */
async function aplicarBaja(
  deps: Dependencias,
  xml: string,
  ruc: string,
  ahora: Date,
): Promise<string> {
  const lineas = lineasBaja(xml);
  for (const l of lineas) {
    const c = await deps.db
      .selectFrom('comprobantes')
      .select(['estado', 'recibido_en'])
      .where('ruc', '=', ruc)
      .where('tipo', '=', l.tipo)
      .where('serie', '=', l.serie)
      .where('numero', '=', l.numero)
      .executeTakeFirst();
    if (!c || c.estado === 'rechazado') return '2105';
    if (c.estado === 'anulado') return '2323';
    const dias = (ahora.getTime() - Date.parse(c.recibido_en)) / 86_400_000;
    if (dias > deps.config.plazoBajaDias) return '2958';
  }
  for (const l of lineas) {
    await deps.db
      .updateTable('comprobantes')
      .set({ estado: 'anulado' })
      .where('ruc', '=', ruc)
      .where('tipo', '=', l.tipo)
      .where('serie', '=', l.serie)
      .where('numero', '=', l.numero)
      .execute();
  }
  return '0';
}

/**
 * Efecto del resumen diario: registra cada boleta o nota según su condición (catálogo 19):
 * 1 adicionar, 2 modificar y 3 anular. Las boletas resumidas no traen XML propio.
 */
async function aplicarResumen(deps: Dependencias, xml: string, ruc: string): Promise<string> {
  const fecha = /<cbc:ReferenceDate>([^<]+)</.exec(xml)?.[1] ?? '';
  const lineas = xml.matchAll(
    /<cbc:DocumentTypeCode>(\d{2})<\/cbc:DocumentTypeCode><cbc:ID>([^<-]+)-(\d+)<\/cbc:ID>[\s\S]*?<cbc:ConditionCode>(\d)<\/cbc:ConditionCode>/g,
  );
  for (const [, tipo = '', serie = '', numero = '0', condicion = '1'] of lineas) {
    const estado = condicion === '3' ? 'anulado' : 'aceptado';
    const id = `${ruc}-${tipo}-${serie}-${numero}`;
    const existe = await deps.db
      .selectFrom('comprobantes')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();
    if (existe)
      await deps.db.updateTable('comprobantes').set({ estado }).where('id', '=', id).execute();
    else
      await deps.db
        .insertInto('comprobantes')
        .values({
          id,
          ruc,
          tipo,
          serie,
          numero: Number(numero),
          fecha_emision: fecha,
          hash: '',
          estado,
          codigo: '0',
          mensaje: 'Informado en resumen diario',
          observaciones: '[]',
          canal: 'resumen',
          xml: '',
          cdr: null,
          recibido_en: deps.ahora().toISOString(),
        })
        .execute();
  }
  return '0';
}
