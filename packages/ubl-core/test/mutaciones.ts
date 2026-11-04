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

const montos = (expr: string, delta: number) =>
  cada(expr, (e) => (e.textContent = (Number(e.textContent) + delta).toFixed(2)));
const clienteId = `${raiz}/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID`;
const clienteNombre = `${raiz}/cac:AccountingCustomerParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName`;
const igvLineas = `${raiz}/*[local-name()='InvoiceLine' or local-name()='CreditNoteLine' or local-name()='DebitNoteLine']/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']`;

/** Recalcula los montos de las líneas gravadas con otra tasa del IGV, de forma coherente. */
function conTasa(tasa: number, soloPrimera = false) {
  return (sel: Sel) => {
    const subtotales = sel(igvLineas);
    const elegidos = soloPrimera ? subtotales.slice(0, 1) : subtotales;
    let delta = 0;
    for (const s of elegidos) {
      const base = Number(s.getElementsByTagNameNS(NS.cbc, 'TaxableAmount')[0]?.textContent ?? '0');
      const monto = s.getElementsByTagNameNS(NS.cbc, 'TaxAmount')[0];
      const percent = s.getElementsByTagNameNS(NS.cbc, 'Percent')[0];
      const total = s.parentNode as Element;
      const totalMonto = Array.from(total.childNodes).find(
        (n) => (n as Element).localName === 'TaxAmount',
      ) as Element | undefined;
      if (!monto || !percent || !totalMonto) continue;
      const nuevo = Math.round(base * tasa * 100) / 100;
      delta += nuevo - Number(monto.textContent);
      monto.textContent = nuevo.toFixed(2);
      totalMonto.textContent = nuevo.toFixed(2);
      percent.textContent = String(tasa * 100);
    }
    for (const expr of [
      `${raiz}/cac:TaxTotal/cbc:TaxAmount`,
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cbc:TaxAmount`,
      `${total}/cbc:TaxInclusiveAmount`,
      `${total}/cbc:PayableAmount`,
    ])
      sel(expr).forEach((e) => (e.textContent = (Number(e.textContent) + delta).toFixed(2)));
  };
}

/** Mutaciones de borde y de rama (para matar mutantes del validador). */
export const MUTACIONES_BORDE: Mutacion[] = [
  {
    nombre: 'correlativo de 8 dígitos',
    nombreArchivo: (n) => n.replace(/-\d+$/, '-99999999'),
    aplicar: cada(
      `${raiz}/cbc:ID`,
      (e) => (e.textContent = e.textContent.replace(/-\d+$/, '-99999999')),
    ),
  },
  {
    nombre: 'correlativo de 9 dígitos',
    nombreArchivo: (n) => n.replace(/-\d+$/, '-123456789'),
    aplicar: cada(
      `${raiz}/cbc:ID`,
      (e) => (e.textContent = e.textContent.replace(/-\d+$/, '-123456789')),
    ),
  },
  {
    nombre: 'serie numérica de contingencia',
    nombreArchivo: (n) => n.replace(/-[A-Z0-9]{4}-/, '-0001-'),
    aplicar: cada(
      `${raiz}/cbc:ID`,
      (e) => (e.textContent = e.textContent.replace(/^..../, '0001')),
    ),
  },
  {
    nombre: 'serie con letra inicial ajena',
    nombreArchivo: (n) => n.replace(/-[A-Z0-9]{4}-/, '-X001-'),
    aplicar: cada(
      `${raiz}/cbc:ID`,
      (e) => (e.textContent = e.textContent.replace(/^..../, 'X001')),
    ),
  },
  {
    nombre: 'CustomizationID 2.0 con sufijo',
    aplicar: cada(`${raiz}/cbc:CustomizationID`, texto('2.01')),
  },
  {
    nombre: 'UBLVersionID 2.1 con prefijo',
    aplicar: cada(`${raiz}/cbc:UBLVersionID`, texto('v2.1')),
  },
  {
    nombre: 'InvoiceTypeCode 011',
    tipos: ['01', '03'],
    aplicar: cada(`${raiz}/cbc:InvoiceTypeCode`, (e) => (e.textContent = `${e.textContent}1`)),
  },
  { nombre: 'nombre del cliente de 3 caracteres', aplicar: cada(clienteNombre, texto('ABC')) },
  {
    nombre: 'nombre del cliente con espacio inicial',
    aplicar: cada(clienteNombre, texto(' ABC S.A.')),
  },
  {
    nombre: 'nombre del cliente de 1000 caracteres',
    aplicar: cada(clienteNombre, texto('A'.repeat(1000))),
  },
  {
    nombre: 'nombre del cliente de 1500 caracteres',
    aplicar: cada(clienteNombre, texto('A'.repeat(1500))),
  },
  { nombre: 'RUC del cliente con 12 dígitos', aplicar: cada(clienteId, texto('200000000021')) },
  { nombre: 'RUC del cliente con letras', aplicar: cada(clienteId, texto('2000000000A')) },
  {
    nombre: 'DNI del cliente con 9 dígitos',
    tipos: ['01', '03'],
    aplicar: cada(clienteId, (e) => {
      e.setAttribute('schemeID', '1');
      e.textContent = '123456789';
    }),
  },
  {
    nombre: 'carné de extranjería de 15 caracteres',
    aplicar: cada(clienteId, (e) => {
      e.setAttribute('schemeID', '4');
      e.textContent = 'X'.repeat(15);
    }),
  },
  {
    nombre: 'carné de extranjería de 16 caracteres',
    aplicar: cada(clienteId, (e) => {
      e.setAttribute('schemeID', '4');
      e.textContent = 'X'.repeat(16);
    }),
  },
  {
    nombre: 'cliente con guion',
    tipos: ['01', '03'],
    aplicar: cada(clienteId, (e) => {
      e.setAttribute('schemeID', '0');
      e.textContent = '-';
    }),
  },
  {
    nombre: 'cliente sin schemeID',
    aplicar: cada(clienteId, (e) => {
      e.removeAttribute('schemeID');
    }),
  },
  { nombre: 'sin identificación del cliente', aplicar: cada(clienteId, quitar) },
  {
    nombre: 'operación de exportación a cliente con RUC',
    tipos: ['01'],
    aplicar: cada(`${raiz}/cbc:InvoiceTypeCode`, attr('listID', '0200')),
  },
  {
    nombre: 'operación 0112 a cliente con carné',
    tipos: ['01'],
    aplicar: (sel) => {
      sel(`${raiz}/cbc:InvoiceTypeCode`).forEach(attr('listID', '0112'));
      sel(clienteId).forEach((e) => {
        e.setAttribute('schemeID', '4');
        e.textContent = 'X123';
      });
    },
  },
  {
    nombre: 'operación 0401 con documento fuera de catálogo',
    tipos: ['01'],
    aplicar: (sel) => {
      sel(`${raiz}/cbc:InvoiceTypeCode`).forEach(attr('listID', '0401'));
      sel(clienteId).forEach(attr('schemeID', 'Z'));
    },
  },
  {
    nombre: 'sustento de nota de 2 caracteres',
    tipos: ['07', '08'],
    aplicar: cada(`${raiz}/cac:DiscrepancyResponse/cbc:Description`, texto('XY')),
  },
  {
    nombre: 'sustento de nota de 501 caracteres',
    tipos: ['07', '08'],
    aplicar: cada(`${raiz}/cac:DiscrepancyResponse/cbc:Description`, texto('X'.repeat(501))),
  },
  {
    nombre: 'motivo de nota en blanco',
    tipos: ['07', '08'],
    aplicar: cada(`${raiz}/cac:DiscrepancyResponse/cbc:ResponseCode`, texto(' ')),
  },
  {
    nombre: 'NC motivo 10 sin referencia',
    tipos: ['07'],
    aplicar: (sel) => {
      sel(`${raiz}/cac:DiscrepancyResponse/cbc:ResponseCode`).forEach(texto('10'));
      sel(`${raiz}/cac:BillingReference`).forEach(quitar);
    },
  },
  {
    nombre: 'ND motivo 03 sin referencia',
    tipos: ['08'],
    aplicar: (sel) => {
      sel(`${raiz}/cac:DiscrepancyResponse/cbc:ResponseCode`).forEach(texto('03'));
      sel(`${raiz}/cac:BillingReference/cac:InvoiceDocumentReference`).forEach(quitar);
    },
  },
  {
    nombre: 'nota sin BillingReference',
    tipos: ['07', '08'],
    aplicar: cada(`${raiz}/cac:BillingReference`, quitar),
  },
  {
    nombre: 'nota sobre una boleta',
    tipos: ['07', '08'],
    aplicar: cada(
      `${raiz}/cac:BillingReference/cac:InvoiceDocumentReference/cbc:DocumentTypeCode`,
      texto('03'),
    ),
  },
  {
    nombre: 'nota sobre una boleta con IGV alterado',
    tipos: ['07', '08'],
    aplicar: (sel) => {
      sel(`${raiz}/cac:BillingReference/cac:InvoiceDocumentReference/cbc:DocumentTypeCode`).forEach(
        texto('03'),
      );
      sel(
        `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cbc:TaxAmount`,
      ).forEach((e) => (e.textContent = (Number(e.textContent) + 7).toFixed(2)));
    },
  },
  {
    nombre: 'número de línea 000',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cbc:ID`, texto('000')),
  },
  {
    nombre: 'número de línea de 4 dígitos',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cbc:ID`, texto('1000')),
  },
  {
    nombre: 'número de línea 01',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cbc:ID`, texto('01')),
  },
  {
    nombre: 'cantidad con 10 decimales',
    tipos: ['01', '03'],
    aplicar: cada(
      `${linea1}/cbc:InvoicedQuantity`,
      (e) => (e.textContent = `${Number(e.textContent).toFixed(0)}.0000000001`),
    ),
  },
  {
    nombre: 'cantidad con 11 decimales',
    tipos: ['01', '03'],
    aplicar: cada(
      `${linea1}/cbc:InvoicedQuantity`,
      (e) => (e.textContent = `${Number(e.textContent).toFixed(0)}.00000000001`),
    ),
  },
  {
    nombre: 'cantidad con 13 enteros',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cbc:InvoicedQuantity`, texto('1234567890123')),
  },
  {
    nombre: 'descripción de 501 caracteres',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cac:Item/cbc:Description`, texto('D'.repeat(501))),
  },
  {
    nombre: 'descripción vacía',
    tipos: ['01', '03'],
    aplicar: cada(`${linea1}/cac:Item/cbc:Description`, texto('')),
  },
  {
    nombre: 'valor unitario con 10 decimales',
    aplicar: cada(
      `${linea1}/cac:Price/cbc:PriceAmount`,
      (e) => (e.textContent = `${Number(e.textContent).toFixed(0)}.0000000001`),
    ),
  },
  { nombre: 'valor unitario 0', aplicar: cada(`${linea1}/cac:Price/cbc:PriceAmount`, texto('0')) },
  {
    nombre: 'precio de referencia +0.9',
    tipos: ['01', '03', '08'],
    aplicar: cada(
      `${linea1}/cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount`,
      (e) => (e.textContent = (Number(e.textContent) + 0.9).toFixed(4)),
    ),
  },
  {
    nombre: 'precio de referencia +1.5',
    tipos: ['01', '03', '08'],
    aplicar: cada(
      `${linea1}/cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount`,
      (e) => (e.textContent = (Number(e.textContent) + 1.5).toFixed(4)),
    ),
  },
  {
    nombre: 'precio de referencia -1.5',
    tipos: ['01', '03', '08'],
    aplicar: cada(
      `${linea1}/cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount`,
      (e) => (e.textContent = (Number(e.textContent) - 1.5).toFixed(4)),
    ),
  },
  { nombre: 'IGV de línea +0.9 (tolerancia)', aplicar: montos(`${subLinea1}/cbc:TaxAmount`, 0.9) },
  { nombre: 'IGV de línea -1.1', aplicar: montos(`${subLinea1}/cbc:TaxAmount`, -1.1) },
  {
    nombre: 'IGV de línea 0 con base gravada',
    aplicar: cada(`${igvLineas}/cbc:TaxAmount`, texto('0.00')),
  },
  { nombre: 'TaxTotal de línea +2', aplicar: montos(`${linea1}/cac:TaxTotal/cbc:TaxAmount`, 2) },
  { nombre: 'TaxTotal de línea -2', aplicar: montos(`${linea1}/cac:TaxTotal/cbc:TaxAmount`, -2) },
  {
    nombre: 'TaxTotal de línea +0.5',
    aplicar: montos(`${linea1}/cac:TaxTotal/cbc:TaxAmount`, 0.5),
  },
  { nombre: 'base IGV de línea +0.01', aplicar: montos(`${igvLineas}/cbc:TaxableAmount`, 0.01) },
  { nombre: 'base IGV de línea -2', aplicar: montos(`${igvLineas}/cbc:TaxableAmount`, -2) },
  {
    nombre: 'base IGV de cabecera +2',
    aplicar: montos(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cbc:TaxableAmount`,
      2,
    ),
  },
  {
    nombre: 'base IGV de cabecera -2',
    aplicar: montos(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cbc:TaxableAmount`,
      -2,
    ),
  },
  {
    nombre: 'base exonerada de cabecera +2',
    aplicar: montos(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='9997']/cbc:TaxableAmount`,
      2,
    ),
  },
  {
    nombre: 'base exonerada de cabecera -2',
    aplicar: montos(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='9997']/cbc:TaxableAmount`,
      -2,
    ),
  },
  {
    nombre: 'base exonerada de cabecera +0.5',
    aplicar: montos(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='9997']/cbc:TaxableAmount`,
      0.5,
    ),
  },
  {
    nombre: 'línea exonerada pasa a inafecta',
    aplicar: (sel) => {
      sel(
        `${raiz}/*/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory[cac:TaxScheme/cbc:ID='9997']`,
      ).forEach((c) => {
        for (const n of Array.from(c.getElementsByTagNameNS(NS.cbc, '*'))) {
          if (n.localName === 'TaxExemptionReasonCode') n.textContent = '30';
          if (n.localName === 'ID') n.textContent = '9998';
          if (n.localName === 'Name') n.textContent = 'INA';
          if (n.localName === 'TaxTypeCode') n.textContent = 'FRE';
        }
      });
    },
  },
  { nombre: 'TaxTotal de cabecera +2', aplicar: montos(`${raiz}/cac:TaxTotal/cbc:TaxAmount`, 2) },
  { nombre: 'TaxTotal de cabecera -2', aplicar: montos(`${raiz}/cac:TaxTotal/cbc:TaxAmount`, -2) },
  {
    nombre: 'TaxTotal de cabecera +0.5',
    aplicar: montos(`${raiz}/cac:TaxTotal/cbc:TaxAmount`, 0.5),
  },
  {
    nombre: 'IGV de cabecera -7',
    aplicar: montos(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cbc:TaxAmount`,
      -7,
    ),
  },
  {
    nombre: 'IGV de cabecera +0.9',
    aplicar: montos(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='1000']/cbc:TaxAmount`,
      0.9,
    ),
  },
  { nombre: 'TaxInclusiveAmount -9', aplicar: montos(`${total}/cbc:TaxInclusiveAmount`, -9) },
  { nombre: 'TaxInclusiveAmount +0.9', aplicar: montos(`${total}/cbc:TaxInclusiveAmount`, 0.9) },
  {
    nombre: 'LineExtensionAmount total -3',
    aplicar: montos(`${total}/cbc:LineExtensionAmount`, -3),
  },
  {
    nombre: 'LineExtensionAmount total +0.9',
    aplicar: montos(`${total}/cbc:LineExtensionAmount`, 0.9),
  },
  { nombre: 'PayableAmount -4', aplicar: montos(`${total}/cbc:PayableAmount`, -4) },
  { nombre: 'PayableAmount 0', aplicar: cada(`${total}/cbc:PayableAmount`, texto('0')) },
  {
    nombre: 'PayableAmount con cero inicial',
    aplicar: cada(`${total}/cbc:PayableAmount`, (e) => (e.textContent = `0${e.textContent}`)),
  },
  {
    nombre: 'PayableAmount con 13 enteros',
    aplicar: cada(`${total}/cbc:PayableAmount`, texto('1234567890123.00')),
  },
  { nombre: 'sin TaxInclusiveAmount', aplicar: cada(`${total}/cbc:TaxInclusiveAmount`, quitar) },
  {
    nombre: 'TaxInclusiveAmount inválido',
    aplicar: cada(`${total}/cbc:TaxInclusiveAmount`, texto('1.234')),
  },
  {
    nombre: 'LineExtensionAmount total inválido',
    aplicar: cada(`${total}/cbc:LineExtensionAmount`, texto('1.234')),
  },
  { nombre: 'sin PayableAmount', aplicar: cada(`${total}/cbc:PayableAmount`, quitar) },
  {
    nombre: 'sin base en subtotal de cabecera',
    aplicar: cada(`${raiz}/cac:TaxTotal/cac:TaxSubtotal[1]/cbc:TaxableAmount`, quitar),
  },
  {
    nombre: 'sin monto en subtotal de cabecera',
    aplicar: cada(`${raiz}/cac:TaxTotal/cac:TaxSubtotal[1]/cbc:TaxAmount`, quitar),
  },
  {
    nombre: 'monto inválido en subtotal de cabecera',
    aplicar: cada(`${raiz}/cac:TaxTotal/cac:TaxSubtotal[1]/cbc:TaxAmount`, texto('x')),
  },
  {
    nombre: 'sin tributo en subtotal de cabecera',
    aplicar: cada(
      `${raiz}/cac:TaxTotal/cac:TaxSubtotal[1]/cac:TaxCategory/cac:TaxScheme/cbc:ID`,
      quitar,
    ),
  },
  {
    nombre: 'sin monto en TaxTotal de cabecera',
    aplicar: cada(`${raiz}/cac:TaxTotal/cbc:TaxAmount`, quitar),
  },
  {
    nombre: 'sin monto en TaxTotal de línea',
    aplicar: cada(`${linea1}/cac:TaxTotal/cbc:TaxAmount`, quitar),
  },
  { nombre: 'sin monto en subtotal de línea', aplicar: cada(`${subLinea1}/cbc:TaxAmount`, quitar) },
  {
    nombre: 'sin base en subtotal de línea',
    aplicar: cada(`${subLinea1}/cbc:TaxableAmount`, quitar),
  },
  {
    nombre: 'sin valor de venta de línea',
    aplicar: cada(`${linea1}/cbc:LineExtensionAmount`, quitar),
  },
  {
    nombre: 'línea gravada sin tributo válido',
    tipos: ['01', '03', '07'],
    aplicar: cada(`${igvLineas}/cac:TaxCategory/cac:TaxScheme/cbc:ID`, texto('9999')),
  },
  {
    nombre: 'línea exonerada con IGV',
    aplicar: cada(
      `${raiz}/*/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID='9997']/cbc:TaxAmount`,
      texto('3.00'),
    ),
  },
  {
    nombre: 'Percent con 6 decimales',
    aplicar: cada(`${subLinea1}/cac:TaxCategory/cbc:Percent`, texto('18.000001')),
  },
  { nombre: 'IGV al 10 % coherente', aplicar: conTasa(0.1) },
  { nombre: 'tasas mezcladas 10 % y 18 %', aplicar: conTasa(0.1, true) },
  {
    nombre: 'tasa 0 en línea gravada',
    aplicar: cada(`${igvLineas}/cac:TaxCategory/cbc:Percent`, texto('0')),
  },
];
