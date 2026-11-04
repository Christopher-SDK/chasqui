import type { Moneda, TipoDocIdentidad } from '@chasqui/catalogos';
import type { ComprobanteCalculado } from './calculos.js';
import { Decimal, type DecimalLike } from './decimal.js';
import type { Emisor } from './modelo.js';
import { NS, serieNumero } from './xml.js';

/**
 * Comunicación de baja (VoidedDocuments, RA) y resumen diario de boletas (SummaryDocuments, RC).
 * Estructura contrastada con las plantillas de Greenter (voided.xml.twig, summary.xml.twig) y
 * validada contra ValidaExprRegSummaryVoided-1.0.1.xsl y ValidaExprRegSummary-1.1.0.xsl.
 */

export interface LineaBaja {
  tipo: '01' | '07' | '08';
  serie: string;
  numero: number;
  motivo: string;
}

export interface ComunicacionBaja {
  emisor: Emisor;
  correlativo: number;
  /** Fecha de la comunicación (AAAA-MM-DD); va en el nombre del archivo. */
  fechaComunicacion: string;
  /** Fecha de emisión de los comprobantes que se dan de baja. */
  fechaReferencia: string;
  lineas: LineaBaja[];
}

export interface LineaResumen {
  tipo: '03' | '07' | '08';
  serieNumero: string;
  cliente: { tipoDocumento: TipoDocIdentidad; numeroDocumento: string };
  /** Catálogo 19: 1 adicionar, 2 modificar, 3 anular. */
  condicion: '1' | '2' | '3';
  total: DecimalLike;
  gravadas?: DecimalLike;
  exoneradas?: DecimalLike;
  inafectas?: DecimalLike;
  igv: DecimalLike;
  /** Boleta que modifica una nota de crédito o débito. */
  referencia?: { tipo: '03'; serieNumero: string };
}

export interface ResumenDiario {
  emisor: Emisor;
  correlativo: number;
  /** Fecha de generación del resumen; va en el nombre del archivo. */
  fechaResumen: string;
  /** Fecha de emisión de las boletas resumidas. */
  fechaReferencia: string;
  moneda: Moneda;
  lineas: LineaResumen[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sinGuiones = (f: string) => f.replaceAll('-', '');
const monto = (d: DecimalLike) => Decimal.de(d).aTexto(2);

export const nombreBaja = (b: ComunicacionBaja) =>
  `${b.emisor.ruc}-RA-${sinGuiones(b.fechaComunicacion)}-${String(b.correlativo)}`;

export const nombreResumen = (r: ResumenDiario) =>
  `${r.emisor.ruc}-RC-${sinGuiones(r.fechaResumen)}-${String(r.correlativo)}`;

function cabecera(
  raiz: string,
  ns: string,
  version: string,
  id: string,
  ref: string,
  fecha: string,
  e: Emisor,
) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<${raiz} xmlns="${ns}" xmlns:cac="${NS.cac}" xmlns:cbc="${NS.cbc}" xmlns:ds="${NS.ds}" xmlns:ext="${NS.ext}" xmlns:sac="urn:sunat:names:specification:ubl:peru:schema:xsd:SunatAggregateComponents-1">` +
    '<ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent/></ext:UBLExtension></ext:UBLExtensions>' +
    `<cbc:UBLVersionID>2.0</cbc:UBLVersionID><cbc:CustomizationID>${version}</cbc:CustomizationID>` +
    `<cbc:ID>${esc(id)}</cbc:ID><cbc:ReferenceDate>${ref}</cbc:ReferenceDate><cbc:IssueDate>${fecha}</cbc:IssueDate>` +
    `<cac:Signature><cbc:ID>${e.ruc}</cbc:ID><cac:SignatoryParty><cac:PartyIdentification><cbc:ID>${e.ruc}</cbc:ID></cac:PartyIdentification>` +
    `<cac:PartyName><cbc:Name>${esc(e.razonSocial)}</cbc:Name></cac:PartyName></cac:SignatoryParty>` +
    '<cac:DigitalSignatureAttachment><cac:ExternalReference><cbc:URI>#SignatureSP</cbc:URI></cac:ExternalReference></cac:DigitalSignatureAttachment></cac:Signature>' +
    `<cac:AccountingSupplierParty><cbc:CustomerAssignedAccountID>${e.ruc}</cbc:CustomerAssignedAccountID><cbc:AdditionalAccountID>6</cbc:AdditionalAccountID>` +
    `<cac:Party><cac:PartyLegalEntity><cbc:RegistrationName>${esc(e.razonSocial)}</cbc:RegistrationName></cac:PartyLegalEntity></cac:Party></cac:AccountingSupplierParty>`
  );
}

export function generarBaja(b: ComunicacionBaja): string {
  const id = nombreBaja(b).slice(12);
  const lineas = b.lineas
    .map(
      (l, i) =>
        `<sac:VoidedDocumentsLine><cbc:LineID>${String(i + 1)}</cbc:LineID><cbc:DocumentTypeCode>${l.tipo}</cbc:DocumentTypeCode>` +
        `<sac:DocumentSerialID>${esc(l.serie)}</sac:DocumentSerialID><sac:DocumentNumberID>${String(l.numero)}</sac:DocumentNumberID>` +
        `<sac:VoidReasonDescription>${esc(l.motivo)}</sac:VoidReasonDescription></sac:VoidedDocumentsLine>`,
    )
    .join('');
  return (
    cabecera(
      'VoidedDocuments',
      'urn:sunat:names:specification:ubl:peru:schema:xsd:VoidedDocuments-1',
      '1.0',
      id,
      b.fechaReferencia,
      b.fechaComunicacion,
      b.emisor,
    ) +
    lineas +
    '</VoidedDocuments>'
  );
}

export function generarResumen(r: ResumenDiario): string {
  const id = nombreResumen(r).slice(12);
  const m = (d: DecimalLike) => `currencyID="${r.moneda}">${monto(d)}`;
  const pagos = (l: LineaResumen) =>
    (
      [
        ['01', l.gravadas],
        ['02', l.exoneradas],
        ['03', l.inafectas],
      ] as const
    )
      .filter(([, v]) => v !== undefined && !Decimal.de(v).esCero())
      .map(
        ([cod, v]) =>
          `<sac:BillingPayment><cbc:PaidAmount ${m(v ?? 0)}</cbc:PaidAmount><cbc:InstructionID>${cod}</cbc:InstructionID></sac:BillingPayment>`,
      )
      .join('');
  const lineas = r.lineas
    .map(
      (l, i) =>
        `<sac:SummaryDocumentsLine><cbc:LineID>${String(i + 1)}</cbc:LineID><cbc:DocumentTypeCode>${l.tipo}</cbc:DocumentTypeCode><cbc:ID>${esc(l.serieNumero)}</cbc:ID>` +
        `<cac:AccountingCustomerParty><cbc:CustomerAssignedAccountID>${esc(l.cliente.numeroDocumento)}</cbc:CustomerAssignedAccountID><cbc:AdditionalAccountID>${l.cliente.tipoDocumento}</cbc:AdditionalAccountID></cac:AccountingCustomerParty>` +
        (l.referencia
          ? `<cac:BillingReference><cac:InvoiceDocumentReference><cbc:ID>${esc(l.referencia.serieNumero)}</cbc:ID><cbc:DocumentTypeCode>${l.referencia.tipo}</cbc:DocumentTypeCode></cac:InvoiceDocumentReference></cac:BillingReference>`
          : '') +
        `<cac:Status><cbc:ConditionCode>${l.condicion}</cbc:ConditionCode></cac:Status>` +
        `<sac:TotalAmount ${m(l.total)}</sac:TotalAmount>` +
        pagos(l) +
        `<cac:TaxTotal><cbc:TaxAmount ${m(l.igv)}</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxAmount ${m(l.igv)}</cbc:TaxAmount>` +
        '<cac:TaxCategory><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal>' +
        '</sac:SummaryDocumentsLine>',
    )
    .join('');
  return (
    cabecera(
      'SummaryDocuments',
      'urn:sunat:names:specification:ubl:peru:schema:xsd:SummaryDocuments-1',
      '1.1',
      id,
      r.fechaReferencia,
      r.fechaResumen,
      r.emisor,
    ) +
    lineas +
    '</SummaryDocuments>'
  );
}

/** Línea de resumen a partir de una boleta (o nota) ya calculada. */
export function lineaResumen(
  c: ComprobanteCalculado,
  condicion: LineaResumen['condicion'] = '1',
): LineaResumen {
  const comp = c.comprobante;
  const base = (t: string) => c.totales.porTributo.find((p) => p.tributo === t)?.base;
  const gravadas = base('1000');
  const exoneradas = base('9997');
  const inafectas = base('9998');
  return {
    tipo: comp.tipo === '01' ? '03' : comp.tipo === '03' ? '03' : comp.tipo,
    serieNumero: serieNumero(comp),
    cliente: {
      tipoDocumento: comp.cliente.tipoDocumento,
      numeroDocumento: comp.cliente.numeroDocumento,
    },
    condicion,
    total: c.totales.importeTotal,
    ...(gravadas ? { gravadas } : {}),
    ...(exoneradas ? { exoneradas } : {}),
    ...(inafectas ? { inafectas } : {}),
    igv: c.totales.igv,
    ...((comp.tipo === '07' || comp.tipo === '08') && comp.referencia.tipo === '03'
      ? { referencia: { tipo: '03' as const, serieNumero: comp.referencia.serieNumero } }
      : {}),
  };
}
