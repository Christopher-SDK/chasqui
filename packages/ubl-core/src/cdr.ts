import { DOMParser } from '@xmldom/xmldom';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import xpath from 'xpath';
import { CERTIFICADO_SIMULADOR, CLAVE_SIMULADOR } from './certificado-prueba.js';
import { firmar } from './firma.js';
import { NS } from './xml.js';

/**
 * Constancia de Recepción (CDR): ApplicationResponse UBL 2.0 firmado y empaquetado en
 * R-<nombre>.zip. Estructura tomada de CDR reales (Greenter, packages/ws/tests/Resources).
 *
 * El emisor del CDR es el «receptor simulado» de Chasqui (RUC ficticio 20000000000), nunca SUNAT.
 */

export const RUC_SIMULADOR = '20000000000';

export interface DatosCdr {
  /** Nombre base del comprobante: RUC-TIPO-SERIE-NUMERO. */
  nombre: string;
  /** Serie-número del comprobante (DocumentReference/ID). */
  serieNumero: string;
  rucEmisor: string;
  /** Identificación del adquiriente, formato «tipo-número» (p. ej. 6-20000000002). */
  receptor?: string;
  /** '0' si fue aceptado; si no, el código de rechazo (2000-3999). */
  codigo: string;
  descripcion: string;
  observaciones: { codigo: string; mensaje: string }[];
  /** Fecha y hora de respuesta (AAAA-MM-DD y hh:mm:ss). */
  fecha: string;
  hora: string;
  /** Identificador único del CDR. */
  id: string;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generarCdr(d: DatosCdr): string {
  const notas = d.observaciones
    .map((o) => `<cbc:Note>${esc(`${o.codigo} - ${o.mensaje}`)}</cbc:Note>`)
    .join('');
  const receptor = d.receptor
    ? `<cac:RecipientParty><cac:PartyIdentification><cbc:ID>${esc(d.receptor)}</cbc:ID></cac:PartyIdentification></cac:RecipientParty>`
    : '';
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<ar:ApplicationResponse xmlns:ar="urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2" xmlns:cac="${NS.cac}" xmlns:cbc="${NS.cbc}" xmlns:ds="${NS.ds}" xmlns:ext="${NS.ext}">` +
    '<ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent/></ext:UBLExtension></ext:UBLExtensions>' +
    '<cbc:UBLVersionID>2.0</cbc:UBLVersionID><cbc:CustomizationID>1.0</cbc:CustomizationID>' +
    `<cbc:ID>${esc(d.id)}</cbc:ID><cbc:IssueDate>${d.fecha}</cbc:IssueDate><cbc:IssueTime>${d.hora}</cbc:IssueTime>` +
    `<cbc:ResponseDate>${d.fecha}</cbc:ResponseDate><cbc:ResponseTime>${d.hora}</cbc:ResponseTime>` +
    notas +
    `<cac:Signature><cbc:ID>${RUC_SIMULADOR}</cbc:ID><cac:SignatoryParty><cac:PartyIdentification><cbc:ID>${RUC_SIMULADOR}</cbc:ID></cac:PartyIdentification>` +
    '<cac:PartyName><cbc:Name>CHASQUI SIMULADOR (NO ES SUNAT)</cbc:Name></cac:PartyName></cac:SignatoryParty>' +
    '<cac:DigitalSignatureAttachment><cac:ExternalReference><cbc:URI>#SignatureSP</cbc:URI></cac:ExternalReference></cac:DigitalSignatureAttachment></cac:Signature>' +
    `<cac:SenderParty><cac:PartyIdentification><cbc:ID>${RUC_SIMULADOR}</cbc:ID></cac:PartyIdentification></cac:SenderParty>` +
    `<cac:ReceiverParty><cac:PartyIdentification><cbc:ID>${esc(d.rucEmisor)}</cbc:ID></cac:PartyIdentification></cac:ReceiverParty>` +
    '<cac:DocumentResponse><cac:Response>' +
    `<cbc:ReferenceID>${esc(d.serieNumero)}</cbc:ReferenceID><cbc:ResponseCode>${esc(d.codigo)}</cbc:ResponseCode><cbc:Description>${esc(d.descripcion)}</cbc:Description>` +
    `</cac:Response><cac:DocumentReference><cbc:ID>${esc(d.serieNumero)}</cbc:ID></cac:DocumentReference>${receptor}</cac:DocumentResponse>` +
    '</ar:ApplicationResponse>';
  return firmar(xml, { certificado: CERTIFICADO_SIMULADOR, clave: CLAVE_SIMULADOR });
}

const FECHA_FIJA = new Date('2026-01-01T00:00:00Z');

/** ZIP del CDR, como lo devuelve sendBill: R-<nombre>.zip con R-<nombre>.xml. */
export function empaquetarCdr(nombre: string, xml: string): Uint8Array {
  return zipSync({ [`R-${nombre}.xml`]: [strToU8(xml), { mtime: FECHA_FIJA }] });
}

export interface CdrLeido {
  codigo: string;
  descripcion: string;
  serieNumero: string;
  observaciones: { codigo: string; mensaje: string }[];
  aceptado: boolean;
  xml: string;
}

/** Lee un CDR (ZIP o XML). Sirve para CDR de Chasqui y de SUNAT, que comparten estructura. */
export function leerCdr(cdr: Uint8Array | string): CdrLeido {
  const xml =
    typeof cdr === 'string'
      ? cdr
      : strFromU8(Object.values(unzipSync(cdr)).find((c) => c.length > 0) ?? new Uint8Array());
  const doc = new DOMParser().parseFromString(xml, 'text/xml') as unknown as Node;
  const sel = xpath.useNamespaces({ cbc: NS.cbc, cac: NS.cac });
  const txt = (e: string) => sel(`string(${e})`, doc) as unknown as string;
  const codigo = txt('//cac:DocumentResponse/cac:Response/cbc:ResponseCode');
  const observaciones = (sel('/*/cbc:Note', doc) as Node[]).map((n) => {
    const [c = '', ...resto] = (n.textContent ?? '').split(' - ');
    return { codigo: c.trim(), mensaje: resto.join(' - ').trim() };
  });
  return {
    codigo,
    descripcion: txt('//cac:DocumentResponse/cac:Response/cbc:Description'),
    serieNumero: txt('//cac:DocumentResponse/cac:Response/cbc:ReferenceID'),
    observaciones,
    aceptado: codigo === '0',
    xml,
  };
}
