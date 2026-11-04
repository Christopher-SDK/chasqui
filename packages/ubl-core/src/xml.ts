import { catalogo05 } from '@chasqui/catalogos';
import type { ComprobanteCalculado, LineaCalculada } from './calculos.js';
import { Decimal } from './decimal.js';
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

type Hijo = string | false | null | undefined;

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

/** Tipo de operación (catálogo 51) que corresponde al comprobante si no se indica uno. */
export function tipoOperacion(c: Comprobante): string {
  if (c.tipo !== '01' && c.tipo !== '03') return '0101';
  if (c.tipoOperacion) return c.tipoOperacion;
  if (c.tipo === '01' && c.detraccion) return '1001';
  if (c.tipo === '01' && c.percepcion) return '2001';
  if (c.items.every((i) => i.afectacion === '40')) return '0200';
  return '0101';
}

export function generarXml(calculado: ComprobanteCalculado): string {
  const { comprobante: c, lineas, totales } = calculado;
  const r = RAIZ[c.tipo];
  const monto = (nombre: string, d: Decimal, moneda: string = c.moneda) =>
    t(nombre, d.aTexto(2), { currencyID: moneda });
  const factura = c.tipo === '01' ? c : null;
  const operacion = tipoOperacion(c);

  // Leyendas (catálogo 52, textos oficiales) que piden las reglas para operaciones especiales.
  const leyendas: [string, string][] = [];
  if (lineas.some((l) => l.gratuita))
    leyendas.push([
      '1002',
      'TRANSFERENCIA GRATUITA DE UN BIEN Y/O SERVICIO PRESTADO GRATUITAMENTE',
    ]);
  if (factura?.detraccion) leyendas.push(['2006', 'Operación sujeta a detracción']);
  if (factura?.percepcion) leyendas.push(['2000', 'COMPROBANTE DE PERCEPCIÓN']);
  if (lineas.some((l) => l.item.afectacion === '17'))
    leyendas.push(['2007', 'Operación sujeta al IVAP']);

  const ajusteGlobal = (
    indicador: boolean,
    codigo: string,
    m: Decimal,
    base?: Decimal,
    factor?: Decimal,
    moneda?: string,
  ) =>
    el(
      'cac:AllowanceCharge',
      null,
      t('cbc:ChargeIndicator', String(indicador)),
      t('cbc:AllowanceChargeReasonCode', codigo),
      factor !== undefined && t('cbc:MultiplierFactorNumeric', factor.aTextoCompacto()),
      monto('cbc:Amount', m, moneda),
      base !== undefined && monto('cbc:BaseAmount', base, moneda),
    );

  const pago: string[] = [];
  if (factura?.detraccion && totales.detraccion) {
    const d = factura.detraccion;
    pago.push(
      el(
        'cac:PaymentMeans',
        null,
        t('cbc:ID', 'Detraccion'),
        t('cbc:PaymentMeansCode', d.medioPago ?? '001'),
        el('cac:PayeeFinancialAccount', null, t('cbc:ID', d.cuentaBancoNacion)),
      ),
      el(
        'cac:PaymentTerms',
        null,
        t('cbc:ID', 'Detraccion'),
        t('cbc:PaymentMeansID', d.codigoBien),
        t('cbc:PaymentPercent', totales.detraccion.porcentaje.aTextoCompacto()),
        monto('cbc:Amount', totales.detraccion.monto, 'PEN'),
      ),
    );
  }
  if (totales.percepcion)
    pago.push(
      el(
        'cac:PaymentTerms',
        null,
        t('cbc:ID', 'Percepcion'),
        monto('cbc:Amount', totales.percepcion.total, 'PEN'),
      ),
    );
  if (factura) {
    const fp = factura.formaPago ?? { tipo: 'Contado' as const };
    if (fp.tipo === 'Contado')
      pago.push(
        el('cac:PaymentTerms', null, t('cbc:ID', 'FormaPago'), t('cbc:PaymentMeansID', 'Contado')),
      );
    else {
      // Monto neto pendiente de pago: el importe total menos la detracción.
      const pendiente = totales.importeTotal.restar(totales.detraccion?.monto ?? 0);
      pago.push(
        el(
          'cac:PaymentTerms',
          null,
          t('cbc:ID', 'FormaPago'),
          t('cbc:PaymentMeansID', 'Credito'),
          monto('cbc:Amount', pendiente),
        ),
        ...fp.cuotas.map((q, i) =>
          el(
            'cac:PaymentTerms',
            null,
            t('cbc:ID', 'FormaPago'),
            t('cbc:PaymentMeansID', `Cuota${String(i + 1).padStart(3, '0')}`),
            monto('cbc:Amount', Decimal.de(q.monto)),
            t('cbc:PaymentDueDate', q.fechaPago),
          ),
        ),
      );
    }
  }

  const anticipos = factura?.anticipos ?? [];
  const cabecera = [
    el('ext:UBLExtensions', null, el('ext:UBLExtension', null, el('ext:ExtensionContent', null))),
    t('cbc:UBLVersionID', '2.1'),
    t('cbc:CustomizationID', '2.0'),
    t('cbc:ID', serieNumero(c)),
    t('cbc:IssueDate', c.fechaEmision),
    t('cbc:IssueTime', c.horaEmision ?? '00:00:00'),
    (c.tipo === '01' || c.tipo === '03') && t('cbc:InvoiceTypeCode', c.tipo, { listID: operacion }),
    ...leyendas.map(([codigo, texto]) => t('cbc:Note', texto, { languageLocaleID: codigo })),
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
    ...anticipos.map((a, i) =>
      el(
        'cac:AdditionalDocumentReference',
        null,
        t('cbc:ID', a.serieNumero),
        t('cbc:DocumentTypeCode', a.tipoDocumento),
        t('cbc:DocumentStatusCode', String(i + 1)),
        el(
          'cac:IssuerParty',
          null,
          el('cac:PartyIdentification', null, t('cbc:ID', c.emisor.ruc, { schemeID: '6' })),
        ),
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
    ...pago,
    ...anticipos.map((a, i) =>
      el(
        'cac:PrepaidPayment',
        null,
        t('cbc:ID', String(i + 1)),
        monto('cbc:PaidAmount', Decimal.de(a.monto)),
      ),
    ),
    totales.descuentoGlobal &&
      ajusteGlobal(
        false,
        '02',
        totales.descuentoGlobal.monto,
        totales.descuentoGlobal.base,
        totales.descuentoGlobal.factor,
      ),
    totales.anticipo &&
      ajusteGlobal(
        false,
        '04',
        totales.anticipo.base,
        totales.valorVenta,
        totales.anticipo.base.dividir(totales.valorVenta).redondear(5),
      ),
    !totales.descuentos.esCero() &&
      ajusteGlobal(
        false,
        '03',
        totales.descuentos,
        totales.precioVenta,
        totales.descuentos.dividir(totales.precioVenta).redondear(5),
      ),
    !totales.cargos.esCero() &&
      ajusteGlobal(
        true,
        '50',
        totales.cargos,
        totales.precioVenta,
        totales.cargos.dividir(totales.precioVenta).redondear(5),
      ),
    totales.percepcion &&
      factura?.percepcion &&
      ajusteGlobal(
        true,
        factura.percepcion.regimen,
        totales.percepcion.monto,
        totales.percepcion.base,
        totales.percepcion.tasa,
        'PEN',
      ),
    el(
      'cac:TaxTotal',
      null,
      monto('cbc:TaxAmount', totales.impuestos),
      ...totales.porTributo.map((s) =>
        el(
          'cac:TaxSubtotal',
          null,
          s.tributo !== '7152' && monto('cbc:TaxableAmount', s.base),
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
      !totales.descuentos.esCero() && monto('cbc:AllowanceTotalAmount', totales.descuentos),
      !totales.cargos.esCero() && monto('cbc:ChargeTotalAmount', totales.cargos),
      !totales.anticipos.esCero() && monto('cbc:PrepaidAmount', totales.anticipos),
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
  const categoria = (...hijos: (string | false)[]) => el('cac:TaxCategory', null, ...hijos);
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
        t('cbc:PriceTypeCode', l.tipoPrecio),
      ),
    ),
    l.descuento &&
      el(
        'cac:AllowanceCharge',
        null,
        t('cbc:ChargeIndicator', 'false'),
        t('cbc:AllowanceChargeReasonCode', '00'),
        t('cbc:MultiplierFactorNumeric', l.descuento.factor.aTextoCompacto()),
        monto('cbc:Amount', l.descuento.monto),
        monto('cbc:BaseAmount', l.descuento.base),
      ),
    el(
      'cac:TaxTotal',
      null,
      monto('cbc:TaxAmount', l.impuestos),
      l.isc &&
        el(
          'cac:TaxSubtotal',
          null,
          monto('cbc:TaxableAmount', l.isc.base),
          monto('cbc:TaxAmount', l.isc.monto),
          categoria(
            t('cbc:Percent', l.isc.porcentaje.aTextoCompacto()),
            t('cbc:TierRange', l.isc.sistema),
            esquemaTributo('2000'),
          ),
        ),
      el(
        'cac:TaxSubtotal',
        null,
        monto('cbc:TaxableAmount', l.baseIgv),
        monto('cbc:TaxAmount', l.igv),
        categoria(
          t('cbc:Percent', l.porcentajeIgv),
          t('cbc:TaxExemptionReasonCode', l.item.afectacion),
          esquemaTributo(l.tributo),
        ),
      ),
      l.icbper &&
        el(
          'cac:TaxSubtotal',
          null,
          monto('cbc:TaxAmount', l.icbper.monto),
          t('cbc:BaseUnitMeasure', l.icbper.bolsas.aTextoCompacto(), { unitCode: 'NIU' }),
          categoria(precio('cbc:PerUnitAmount', l.icbper.tarifa), esquemaTributo('7152')),
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
