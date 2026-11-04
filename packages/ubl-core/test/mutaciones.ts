import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import xpath from 'xpath';
import { NS } from '../src/xml.js';

type Sel = (expr: string) => Element[];

/** Aplica una mutación sobre el DOM del XML y lo vuelve a serializar. */
export function mutar(xml: string, fn: (sel: Sel, doc: Document) => void): string {
  const doc = new DOMParser().parseFromString(xml, 'text/xml') as unknown as Document;
  const sel: Sel = (expr) =>
    xpath.useNamespaces({ cac: NS.cac, cbc: NS.cbc, ext: NS.ext, ds: NS.ds })(
      expr,
      doc,
    ) as Element[];
  fn(sel, doc);
  return new XMLSerializer().serializeToString(
    doc as unknown as Parameters<XMLSerializer['serializeToString']>[0],
  );
}

const texto = (v: string) => (el: Element) => {
  el.textContent = v;
};
const quitar = (el: Element) => el.parentNode?.removeChild(el);
const attr = (k: string, v: string) => (el: Element) => {
  el.setAttribute(k, v);
};

export interface Mutacion {
  nombre: string;
  /** Tipos a los que aplica (por defecto, todos). */
  tipos?: ('01' | '03' | '07' | '08')[];
  /** Cambia el nombre del archivo en vez del XML. */
  nombreArchivo?: (n: string) => string;
  aplicar?: (sel: Sel) => void;
}

const raiz = '/*';
const linea1 = `${raiz}/*[local-name()='InvoiceLine' or local-name()='CreditNoteLine' or local-name()='DebitNoteLine'][1]`;
const subLinea1 = `${linea1}/cac:TaxTotal/cac:TaxSubtotal[1]`;
const total = `${raiz}/*[local-name()='LegalMonetaryTotal' or local-name()='RequestedMonetaryTotal']`;
const cada = (expr: string, f: (el: Element) => void) => (sel: Sel) => {
  sel(expr).forEach(f);
};

/** Mutaciones dirigidas a reglas implementadas. El veredicto oficial lo da el oráculo. */
export const MUTACIONES: Mutacion[] = [
  {
    nombre: 'RUC del nombre ≠ RUC del emisor',
    nombreArchivo: (n) => n.replace(/^\d{11}/, '20999999999'),
  },
  {
    nombre: 'serie del nombre ≠ serie del XML',
    aplicar: cada(
      `${raiz}/cbc:ID`,
      (e) => (e.textContent = e.textContent.replace(/^(.)(...)/, '$1ZZZ')),
    ),
  },
  {
    nombre: 'número del nombre ≠ número del XML',
    aplicar: cada(`${raiz}/cbc:ID`, (e) => (e.textContent = `${e.textContent}9`)),
  },
  { nombre: 'UBLVersionID 2.0', aplicar: cada(`${raiz}/cbc:UBLVersionID`, texto('2.0')) },
  { nombre: 'sin UBLVersionID', aplicar: cada(`${raiz}/cbc:UBLVersionID`, quitar) },
  { nombre: 'CustomizationID 1.0', aplicar: cada(`${raiz}/cbc:CustomizationID`, texto('1.0')) },
  { nombre: 'sin CustomizationID', aplicar: cada(`${raiz}/cbc:CustomizationID`, quitar) },
  {
    nombre: 'InvoiceTypeCode distinto',
    tipos: ['01', '03'],
    aplicar: cada(`${raiz}/cbc:InvoiceTypeCode`, texto('07')),
  },
  {
    nombre: 'sin InvoiceTypeCode',
    tipos: ['01', '03'],
    aplicar: cada(`${raiz}/cbc:InvoiceTypeCode`, quitar),
  },
  { nombre: 'sin moneda', aplicar: cada(`${raiz}/cbc:DocumentCurrencyCode`, quitar) },
  {
    nombre: 'moneda fuera del catálogo 02',
    aplicar: cada(`${raiz}/cbc:DocumentCurrencyCode`, texto('QQQ')),
  },
  {
    nombre: 'currencyID distinto en una línea',
    aplicar: cada(`${linea1}/cbc:LineExtensionAmount`, attr('currencyID', 'EUR')),
  },
  {
    nombre: 'motivo de nota fuera de catálogo',
    tipos: ['07', '08'],
    aplicar: cada(`${raiz}/cac:DiscrepancyResponse/cbc:ResponseCode`, texto('99')),
  },
  {
    nombre: 'sin motivo de nota',
    tipos: ['07', '08'],
    aplicar: cada(`${raiz}/cac:DiscrepancyResponse/cbc:ResponseCode`, quitar),
  },
  {
    nombre: 'sustento de nota de 1 carácter',
    tipos: ['07', '08'],
    aplicar: cada(`${raiz}/cac:DiscrepancyResponse/cbc:Description`, texto('X')),
  },
  {
    nombre: 'sin documento de referencia',
    tipos: ['07', '08'],
    aplicar: cada(`${raiz}/cac:BillingReference/cac:InvoiceDocumentReference`, quitar),
  },
  {
    nombre: 'schemeID del emisor ≠ 6',
    tipos: ['01', '03'],
    aplicar: cada(
      `${raiz}/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID`,
      attr('schemeID', '1'),
    ),
  },
  {
    nombre: 'sin razón social del emisor',
    aplicar: cada(
      `${raiz}/cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      quitar,
    ),
  },
  {
    nombre: 'RUC del cliente con 10 dígitos',
    tipos: ['01', '07', '08'],
    aplicar: cada(
      `${raiz}/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID`,
      texto('2000000000'),
    ),
  },
  {
    nombre: 'nombre del cliente de 2 caracteres',
    aplicar: cada(
      `${raiz}/cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      texto('AB'),
    ),
  },
  {
    nombre: 'sin nombre del cliente',
    aplicar: cada(
      `${raiz}/cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`,
      quitar,
    ),
  },
  {
    nombre: 'factura a cliente con DNI',
    tipos: ['01'],
    aplicar: cada(
      `${raiz}/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID`,
      (e) => {
        e.setAttribute('schemeID', '1');
        e.textContent = '00000001';
      },
    ),
  },
  {
    nombre: 'DNI del cliente con 7 dígitos',
    tipos: ['01'],
    aplicar: cada(
      `${raiz}/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID`,
      (e) => {
        e.setAttribute('schemeID', '1');
        e.textContent = '1234567';
      },
    ),
  },
  {
    nombre: 'número de línea 0',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cbc:ID`, texto('0')),
  },
  {
    nombre: 'número de línea duplicado',
    aplicar: (sel) => {
      const ids = sel(
        `${raiz}/*[local-name()='InvoiceLine' or local-name()='CreditNoteLine' or local-name()='DebitNoteLine']/cbc:ID`,
      );
      const [primero, segundo] = ids;
      if (primero && segundo) segundo.textContent = primero.textContent;
    },
  },
  {
    nombre: 'sin unitCode',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cbc:InvoicedQuantity`, (e) => {
      e.removeAttribute('unitCode');
    }),
  },
  {
    nombre: 'cantidad 0',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cbc:InvoicedQuantity`, texto('0')),
  },
  {
    nombre: 'cantidad no numérica',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cbc:InvoicedQuantity`, texto('dos')),
  },
  {
    nombre: 'sin descripción del ítem',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cac:Item/cbc:Description`, quitar),
  },
  {
    nombre: 'valor unitario con 11 decimales',
    aplicar: cada(`${linea1}/cac:Price/cbc:PriceAmount`, texto('1.12345678901')),
  },
  { nombre: 'sin valor unitario', aplicar: cada(`${linea1}/cac:Price/cbc:PriceAmount`, quitar) },
  {
    nombre: 'sin precio de referencia',
    tipos: ['01', '03'],
    aplicar: cada(
      `${linea1}/cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount`,
      quitar,
    ),
  },
  { nombre: 'línea sin TaxTotal', aplicar: cada(`${linea1}/cac:TaxTotal`, quitar) },
  {
    nombre: 'IGV de línea alterado',
    aplicar: cada(
      `${subLinea1}/cbc:TaxAmount`,
      (e) => (e.textContent = (Number(e.textContent) + 5).toFixed(2)),
    ),
  },
  {
    nombre: 'IGV de línea con 3 decimales',
    aplicar: cada(`${subLinea1}/cbc:TaxAmount`, (e) => (e.textContent = `${e.textContent}1`)),
  },
  {
    nombre: 'sin afectación del IGV',
    aplicar: cada(`${subLinea1}/cac:TaxCategory/cbc:TaxExemptionReasonCode`, quitar),
  },
  { nombre: 'sin Percent', aplicar: cada(`${subLinea1}/cac:TaxCategory/cbc:Percent`, quitar) },
  {
    nombre: 'Percent 15 en línea gravada',
    aplicar: cada(
      `${subLinea1}[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cac:TaxCategory/cbc:Percent`,
      texto('15'),
    ),
  },
  {
    nombre: 'sin código de tributo en línea',
    aplicar: cada(`${subLinea1}/cac:TaxCategory/cac:TaxScheme/cbc:ID`, quitar),
  },
  {
    nombre: 'tributo de línea fuera del catálogo 05',
    aplicar: cada(`${subLinea1}/cac:TaxCategory/cac:TaxScheme/cbc:ID`, texto('1234')),
  },
  {
    nombre: 'valor de venta de línea con 3 decimales',
    aplicar: cada(
      `${linea1}/cbc:LineExtensionAmount`,
      (e) => (e.textContent = `${e.textContent}1`),
    ),
  },
  {
    nombre: 'TaxTotal de línea con formato inválido',
    aplicar: cada(`${linea1}/cac:TaxTotal/cbc:TaxAmount`, texto('1,00')),
  },
  { nombre: 'sin TaxTotal de cabecera', aplicar: cada(`${raiz}/cac:TaxTotal`, quitar) },
  {
    nombre: 'TaxTotal de cabecera con formato inválido',
    aplicar: cada(`${raiz}/cac:TaxTotal/cbc:TaxAmount`, texto('abc')),
  },
  {
    nombre: 'base de subtotal de cabecera inválida',
    aplicar: cada(`${raiz}/cac:TaxTotal/cac:TaxSubtotal[1]/cbc:TaxableAmount`, texto('-5')),
  },
  {
    nombre: 'tributo de cabecera fuera del catálogo',
    aplicar: cada(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[1]/cac:TaxCategory/cac:TaxScheme/cbc:ID`,
      texto('1234'),
    ),
  },
  {
    nombre: 'suma del IGV de cabecera alterada',
    aplicar: cada(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cbc:TaxAmount`,
      (e) => (e.textContent = (Number(e.textContent) + 7).toFixed(2)),
    ),
  },
  {
    nombre: 'TaxInclusiveAmount alterado',
    aplicar: cada(
      `${total}/cbc:TaxInclusiveAmount`,
      (e) => (e.textContent = (Number(e.textContent) + 9).toFixed(2)),
    ),
  },
  {
    nombre: 'LineExtensionAmount total desfasado',
    aplicar: cada(
      `${total}/cbc:LineExtensionAmount`,
      (e) => (e.textContent = (Number(e.textContent) + 3).toFixed(2)),
    ),
  },
  {
    nombre: 'PayableAmount desfasado',
    aplicar: cada(
      `${total}/cbc:PayableAmount`,
      (e) => (e.textContent = (Number(e.textContent) + 4).toFixed(2)),
    ),
  },
  {
    nombre: 'PayableAmount con formato inválido',
    aplicar: cada(`${total}/cbc:PayableAmount`, texto('10.999')),
  },
  {
    nombre: 'desfase dentro de la tolerancia (±1)',
    aplicar: cada(
      `${total}/cbc:PayableAmount`,
      (e) => (e.textContent = (Number(e.textContent) + 0.5).toFixed(2)),
    ),
  },
];
