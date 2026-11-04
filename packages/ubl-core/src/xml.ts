import { catalogo05 } from '@chasqui/catalogos';
import { PORCENTAJE_IGV, type ComprobanteCalculado, type LineaCalculada } from './calculos.js';
import type { Decimal } from './decimal.js';
import type { Comprobante } from './modelo.js';

/**
 * Generación de XML UBL 2.1 en la estructura que exigen las guías de elaboración de SUNAT.
 * Estructura contrastada con las plantillas de Greenter (invoice2.1, notacr2.1, notadb2.1) y
 * validada contra las reglas XSL oficiales en test/conformidad.test.ts.
 */

export const NS = {
  cac: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
  cbc: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
  ext: 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
  ds: 'http://www.w3.org/2000/09/xmldsig#',
} as const;

const RAIZ = {
  '01': {
    raiz: 'Invoice',
    linea: 'InvoiceLine',
    cantidad: 'InvoicedQuantity',
    total: 'LegalMonetaryTotal',
  },
  '03': {
    raiz: 'Invoice',
    linea: 'InvoiceLine',
    cantidad: 'InvoicedQuantity',
    total: 'LegalMonetaryTotal',
  },
  '07': {
    raiz: 'CreditNote',
    linea: 'CreditNoteLine',
    cantidad: 'CreditedQuantity',
    total: 'LegalMonetaryTotal',
  },
  '08': {
    raiz: 'DebitNote',
    linea: 'DebitNoteLine',
    cantidad: 'DebitedQuantity',
    total: 'RequestedMonetaryTotal',
  },
} as const;

export const ID_FIRMA = 'SignatureSP';

type Hijo = string | false | undefined;

function escapar(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function el(nombre: string, attrs: Record<string, string> | null, ...hijos: Hijo[]): string {
  const a = attrs
    ? Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${escapar(v)}"`)
        .join('')
    : '';
  const contenido = hijos.filter((h): h is string => typeof h === 'string').join('');
  return contenido ? `<${nombre}${a}>${contenido}</${nombre}>` : `<${nombre}${a}/>`;
}

/** Elemento con texto escapado. */
function t(nombre: string, texto: string, attrs: Record<string, string> | null = null): string {
  return el(nombre, attrs, escapar(texto));
}

/** Nombre de archivo SUNAT: RUC-TIPO-SERIE-NUMERO (sin extensión). */
export function nombreArchivo(c: Comprobante): string {
  return `${c.emisor.ruc}-${c.tipo}-${c.serie}-${String(c.correlativo)}`;
}

export function serieNumero(c: Comprobante): string {
  return `${c.serie}-${String(c.correlativo)}`;
}

export function generarXml(calculado: ComprobanteCalculado): string {
  const { comprobante: c, lineas, totales } = calculado;
  const r = RAIZ[c.tipo];
  const monto = (nombre: string, d: Decimal) => t(nombre, d.aTexto(2), { currencyID: c.moneda });

  const cabecera = [
    el('ext:UBLExtensions', null, el('ext:UBLExtension', null, el('ext:ExtensionContent', null))),
    t('cbc:UBLVersionID', '2.1'),
    t('cbc:CustomizationID', '2.0'),
    t('cbc:ID', serieNumero(c)),
    t('cbc:IssueDate', c.fechaEmision),
    t('cbc:IssueTime', c.horaEmision ?? '00:00:00'),
    (c.tipo === '01' || c.tipo === '03') &&
      t('cbc:InvoiceTypeCode', c.tipo, { listID: c.tipoOperacion ?? '0101' }),
    t('cbc:DocumentCurrencyCode', c.moneda),
    (c.tipo === '07' || c.tipo === '08') &&
      el(
        'cac:DiscrepancyResponse',
        null,
        t('cbc:ReferenceID', c.referencia.serieNumero),
        t('cbc:ResponseCode', c.motivo),
        t('cbc:Description', c.sustento),
      ) +
        el(
          'cac:BillingReference',
          null,
          el(
            'cac:InvoiceDocumentReference',
            null,
            t('cbc:ID', c.referencia.serieNumero),
            t('cbc:DocumentTypeCode', c.referencia.tipo),
          ),
        ),
    el(
      'cac:Signature',
      null,
      t('cbc:ID', c.emisor.ruc),
      el(
        'cac:SignatoryParty',
        null,
        el('cac:PartyIdentification', null, t('cbc:ID', c.emisor.ruc)),
        el('cac:PartyName', null, t('cbc:Name', c.emisor.razonSocial)),
      ),
      el(
        'cac:DigitalSignatureAttachment',
        null,
        el('cac:ExternalReference', null, t('cbc:URI', `#${ID_FIRMA}`)),
      ),
    ),
    emisor(c),
    el(
      'cac:AccountingCustomerParty',
      null,
      el(
        'cac:Party',
        null,
        el(
          'cac:PartyIdentification',
          null,
          t('cbc:ID', c.cliente.numeroDocumento, { schemeID: c.cliente.tipoDocumento }),
        ),
        el('cac:PartyLegalEntity', null, t('cbc:RegistrationName', c.cliente.nombre)),
      ),
    ),
    c.tipo === '01' &&
      el('cac:PaymentTerms', null, t('cbc:ID', 'FormaPago'), t('cbc:PaymentMeansID', 'Contado')),
    el(
      'cac:TaxTotal',
      null,
      monto('cbc:TaxAmount', totales.igv),
      ...totales.porTributo.map((s) =>
        el(
          'cac:TaxSubtotal',
          null,
          monto('cbc:TaxableAmount', s.base),
          monto('cbc:TaxAmount', s.monto),
          el('cac:TaxCategory', null, esquemaTributo(s.tributo)),
        ),
      ),
    ),
    el(
      `cac:${r.total}`,
      null,
      monto('cbc:LineExtensionAmount', totales.valorVenta),
      monto('cbc:TaxInclusiveAmount', totales.precioVenta),
      monto('cbc:PayableAmount', totales.importeTotal),
    ),
  ];

  const detalle = lineas.map((l) => linea(l, r.linea, r.cantidad, c.moneda));

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    el(
      r.raiz,
      {
        xmlns: `urn:oasis:names:specification:ubl:schema:xsd:${r.raiz}-2`,
        'xmlns:cac': NS.cac,
        'xmlns:cbc': NS.cbc,
        'xmlns:ds': NS.ds,
        'xmlns:ext': NS.ext,
      },
      ...cabecera,
      ...detalle,
    )
  );
}

function emisor(c: Comprobante): string {
  const e = c.emisor;
  const d = e.direccion;
  return el(
    'cac:AccountingSupplierParty',
    null,
    el(
      'cac:Party',
      null,
      el('cac:PartyIdentification', null, t('cbc:ID', e.ruc, { schemeID: '6' })),
      e.nombreComercial !== undefined &&
        el('cac:PartyName', null, t('cbc:Name', e.nombreComercial)),
      el(
        'cac:PartyLegalEntity',
        null,
        t('cbc:RegistrationName', e.razonSocial),
        el(
          'cac:RegistrationAddress',
          null,
          t('cbc:ID', d.ubigeo),
          t('cbc:AddressTypeCode', d.codigoLocal ?? '0000'),
          t('cbc:CityName', d.provincia),
          t('cbc:CountrySubentity', d.departamento),
          t('cbc:District', d.distrito),
          el('cac:AddressLine', null, t('cbc:Line', d.linea)),
          el('cac:Country', null, t('cbc:IdentificationCode', 'PE')),
        ),
      ),
    ),
  );
}

function esquemaTributo(tributo: keyof typeof catalogo05): string {
  const def = catalogo05[tributo];
  return el(
    'cac:TaxScheme',
    null,
    t('cbc:ID', tributo),
    t('cbc:Name', def.name),
    t('cbc:TaxTypeCode', def.UN_ECE_5153),
  );
}

function linea(
  l: LineaCalculada,
  etiqueta: string,
  etiquetaCantidad: string,
  moneda: string,
): string {
  const monto = (nombre: string, d: Decimal) => t(nombre, d.aTexto(2), { currencyID: moneda });
  // Precios unitarios: hasta 10 decimales (reglas 2369 y 2367 del XSL oficial).
  const precio = (nombre: string, d: Decimal) =>
    t(nombre, d.aTextoCompacto(), { currencyID: moneda });
  return el(
    `cac:${etiqueta}`,
    null,
    t('cbc:ID', String(l.numero)),
    t(`cbc:${etiquetaCantidad}`, l.cantidad.aTextoCompacto(), { unitCode: l.item.unidad }),
    monto('cbc:LineExtensionAmount', l.valorVenta),
    el(
      'cac:PricingReference',
      null,
      el(
        'cac:AlternativeConditionPrice',
        null,
        precio('cbc:PriceAmount', l.precioUnitario),
        t('cbc:PriceTypeCode', '01'),
      ),
    ),
    el(
      'cac:TaxTotal',
      null,
      monto('cbc:TaxAmount', l.igv),
      el(
        'cac:TaxSubtotal',
        null,
        monto('cbc:TaxableAmount', l.valorVenta),
        monto('cbc:TaxAmount', l.igv),
        el(
          'cac:TaxCategory',
          null,
          t('cbc:Percent', l.tributo === '1000' ? PORCENTAJE_IGV : '0'),
          t('cbc:TaxExemptionReasonCode', l.item.afectacion),
          esquemaTributo(l.tributo),
        ),
      ),
    ),
    el(
      'cac:Item',
      null,
      t('cbc:Description', l.item.descripcion),
      l.item.codigo !== undefined &&
        el('cac:SellersItemIdentification', null, t('cbc:ID', l.item.codigo)),
    ),
    el('cac:Price', null, precio('cbc:PriceAmount', l.valorUnitario)),
  );
}
