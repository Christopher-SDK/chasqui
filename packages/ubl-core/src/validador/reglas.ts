import type { TipoComprobante } from '../modelo.js';
import type { Contexto, ContextoNodo } from './motor.js';

/**
 * Subconjunto de las reglas oficiales de SUNAT, en el MISMO ORDEN de ejecución que el XSL del
 * paquete SFS/OSE (plantilla principal + xsl:apply-templates). Cada llamada cita su línea
 * (`l`) en el XSL del tipo de comprobante. Las expresiones XPath se copiaron sin cambios.
 *
 * Fuera del subconjunto (no se validan): anticipos, descuentos y cargos, ISC, IVAP, ICBPER,
 * detracción, percepción, exportación, gratuitas, guías relacionadas y direcciones de entrega.
 * La lista completa está en docs/fuentes.md §6.
 */

export const ARCHIVO_XSL: Record<TipoComprobante, string> = {
  '01': 'ValidaExprRegFactura-2.0.1.xsl',
  '03': 'ValidaExprRegBoleta-2.0.1.xsl',
  '07': 'ValidaExprRegNC-2.0.1.xsl',
  '08': 'ValidaExprRegND-2.0.1.xsl',
};

const RUC_PROVEEDOR = 'cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID';
const ID_CLIENTE = 'cac:Party/cac:PartyIdentification/cbc:ID';
const NOMBRE = /^(?!\s*$)[^\s].{2,1499}$/;
const NOMBRE_NOTA = /^(?!\s*$)[^\s].{2,999}$/;
const IGV_PERCENT = "cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '1000']";

// ── Cabecera ─────────────────────────────────────────────────────────────────────────────────

function nombreArchivoVsContenido(
  c: ContextoNodo,
  l: [number, number, number] | [null, number, number],
) {
  if (l[0] !== null) c.falla('1034', `$numeroRuc != ${RUC_PROVEEDOR}`, { l: l[0] });
  c.falla('1035', '$numeroSerie != substring(cbc:ID, 1, 4)', { l: l[1] });
  c.falla('1036', '$numeroComprobante != substring(cbc:ID, 6)', { l: l[2] });
}

function versiones(c: ContextoNodo, lUbl: number | null, lCustom: number) {
  if (lUbl !== null) c.existeYCumple('2075', '2074', 'cbc:UBLVersionID', /^(2.1)$/, { l: lUbl });
  c.existeYCumple('2073', '2072', 'cbc:CustomizationID', /^(2.0)$/, { l: lCustom });
}

function moneda(c: ContextoNodo, l: [number, number, number]) {
  c.existe('2070', 'cbc:DocumentCurrencyCode', { l: l[0] });
  c.enCatalogo('3088', 'cbc:DocumentCurrencyCode', '02', { l: l[1] });
  // Subconjunto de la expresión oficial: los nodos excluidos (descuentos 51-53, PaymentTerms,
  // DeliveryTerms, DeclaredForCarriageValueAmount) no los genera Chasqui.
  c.falla('2071', 'descendant::*[@currencyID != $monedaComprobante]', { l: l[2] });
}

function motivoNota(c: ContextoNodo, catalogo: '09' | '10', l: [number, number, number]) {
  c.existeYCumple(
    '2128',
    '2128',
    'cac:DiscrepancyResponse/cbc:ResponseCode',
    /^((?!\s*$)[^\s].*)$/,
    { l: l[0] },
  );
  c.enCatalogo('2172', 'cac:DiscrepancyResponse/cbc:ResponseCode', catalogo, { l: l[1] });
  c.existeYCumple(
    '2136',
    '2135',
    'cac:DiscrepancyResponse/cbc:Description',
    /^(?!\s*$)[^\s].{1,499}$/,
    { l: l[2] },
  );
}

// ── Totales de cabecera ──────────────────────────────────────────────────────────────────────

const TRIBUTOS_IMPUESTO =
  "cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '1000' or text() = '1016' or text() = '7152' or text() = '9999' or text() = '2000']]";

/** XPath round(): floor(x + 0.5). */
const redondear2 = (x: number) => Math.floor(x * 100 + 0.5) / 100;

interface TaxTotalCabL {
  total: number;
  base: number;
  monto: number;
  id: number;
  cat: number;
  baseIgv: number;
  impuestos: number;
}

/**
 * TaxTotal de cabecera. Factura y boleta validan los subtotales dentro de la plantilla del
 * TaxTotal; las notas los validan en otra plantilla (apply-templates cac:TaxTotal/cac:TaxSubtotal)
 * después de 4301 y 4299.
 */
function taxTotalCabecera(c: ContextoNodo, linea: string, l: TaxTotalCabL, esNota: boolean) {
  c.cada('cac:TaxTotal', (t) => {
    if (esNota) t.decimalSiExiste('3020', 'cbc:TaxAmount', { l: l.total, mayorCero: false });
    else t.existeDecimal('3020', '3020', 'cbc:TaxAmount', 2, { l: l.total, mayorCero: false });
    if (!esNota) subtotalesCabecera(t, l, false);
    const o4299 = () => {
      if (!t.verdad(`cac:TaxSubtotal[${IGV_PERCENT}]/cbc:TaxableAmount > 0`)) return;
      const base = t.numero(`sum(cac:TaxSubtotal[${IGV_PERCENT}]/cbc:TaxableAmount)`);
      const calculado = t.numero(
        `sum($root/${linea}[cac:TaxTotal/cac:TaxSubtotal[${IGV_PERCENT}]/cbc:TaxableAmount > 0]/cbc:LineExtensionAmount)`,
      );
      t.falla('4299', base + 1 < calculado || base - 1 > calculado, {
        l: l.baseIgv,
        esError: false,
      });
    };
    const o4301 = () => {
      const total = t.numero('number(cbc:TaxAmount)');
      const suma = redondear2(t.numero(`sum(${TRIBUTOS_IMPUESTO}/cbc:TaxAmount)`));
      t.falla('4301', redondear2(total + 1) < suma || redondear2(total - 1) > suma, {
        l: l.impuestos,
        esError: false,
      });
    };
    if (esNota) {
      o4301();
      o4299();
    } else {
      o4299();
      o4301();
    }
  });
  if (esNota)
    c.cada('cac:TaxTotal', (t) => {
      subtotalesCabecera(t, l, true);
    });
}

function subtotalesCabecera(t: ContextoNodo, l: TaxTotalCabL, montoSiExiste: boolean) {
  t.cada(
    'cac:TaxSubtotal',
    (s) => {
      if (s.verdad("$codigoTributo != '7152'"))
        s.existeDecimal('3003', '2999', 'cbc:TaxableAmount', 2, { l: l.base, mayorCero: false });
      if (montoSiExiste)
        s.decimalSiExiste('2048', 'cbc:TaxAmount', { l: l.monto, mayorCero: false });
      else s.existeDecimal('2048', '2048', 'cbc:TaxAmount', 2, { l: l.monto, mayorCero: false });
      s.existe('3059', 'cac:TaxCategory/cac:TaxScheme/cbc:ID', { l: l.id });
      s.enCatalogo('3007', 'cac:TaxCategory/cac:TaxScheme/cbc:ID', '05', { l: l.cat });
    },
    (s) => ({ codigoTributo: s.texto('cac:TaxCategory/cac:TaxScheme/cbc:ID') }),
  );
}

/**
 * Reglas 3462 y 3291 (tasas del IGV y suma del IGV). Variables portadas de
 * ValidaExprRegFactura-2.0.1.xsl L297-L470; descuentos, cargos y anticipos valen 0 en el
 * subconjunto, así que los términos que dependen de ellos se omiten.
 */
const RETIROS =
  "cac:TaxCategory/cbc:TaxExemptionReasonCode[text() = '11' or text() = '12' or text() = '13' or text() = '14' or text() = '15' or text() = '16']";

interface IgvCabL {
  mezcla: number;
  /** 3291: la suma del IGV no calza con ninguna tasa (error). */
  indicadores?: number;
  suma?: number;
  /** 4290: misma condición que 3291 pero como observación (boleta y notas sobre boletas). */
  observacion?: number;
}

function igvCabecera(c: ContextoNodo, linea: string, l: IgvCabL) {
  const lineas = `${linea}/cac:TaxTotal/cac:TaxSubtotal`;
  const conTasa = (cond: string) =>
    c.numero(
      `count(${lineas}[${cond} and ((${IGV_PERCENT} and cbc:TaxableAmount > 0) or (cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '9996'] and cbc:TaxableAmount > 0 and ${RETIROS}))])`,
    );
  const igv10 = conTasa('cac:TaxCategory/cbc:Percent = 10.0');
  const igv18 = conTasa('cac:TaxCategory/cbc:Percent = 18.0');
  const igvX = conTasa(
    'cac:TaxCategory/cbc:Percent != 18.0 and cac:TaxCategory/cbc:Percent != 10.0',
  );
  const indicador1 = c.numero(`sum(${lineas}[${IGV_PERCENT}]/cbc:TaxableAmount)`);
  const indicador2 = c.numero(
    `sum(${lineas}[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '9996'] and ${RETIROS}]/cbc:TaxableAmount)`,
  );
  if (indicador1 > 0 || indicador2 > 0) {
    c.falla('3462', (igv10 > 0 && igv18 > 0) || (igv10 === 0 && igv18 === 0) || igvX > 0, {
      l: l.mezcla,
    });
  }
  if (!c.verdad(`cac:TaxTotal/cac:TaxSubtotal[${IGV_PERCENT}]`)) return;
  const sumaIgv = c.numero(`sum(cac:TaxTotal/cac:TaxSubtotal[${IGV_PERCENT}]/cbc:TaxAmount)`);
  const baseLineas = c.numero(`sum(${lineas}[${IGV_PERCENT}]/cbc:TaxableAmount)`);
  const calculado18 = baseLineas * 0.18;
  const calculado10 = baseLineas * 0.1;
  const fuera = (esperado: number) => sumaIgv + 1 < esperado || sumaIgv - 1 > esperado;
  const ambasFuera = fuera(calculado18) && fuera(calculado10);
  if (l.observacion !== undefined)
    c.falla('4290', ambasFuera, { l: l.observacion, esError: false });
  if (l.indicadores === undefined || l.suma === undefined) return;
  const tasa = tasaPrimeraLinea(c, linea);
  c.falla('3291', ambasFuera, { l: l.indicadores });
  c.falla('3291', fuera(tasa === 0.18 ? calculado18 : calculado10), { l: l.suma });
}

/** TasaPercent: Percent del primer ítem con tributo 1000 / 100, si su base es > 0. */
function tasaPrimeraLinea(c: ContextoNodo, linea: string): number {
  const percent = `${linea}/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory[cac:TaxScheme/cbc:ID[text() = '1000']]/cbc:Percent`;
  const conBase = `${linea}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID = '1000']/cbc:TaxableAmount > 0`;
  return c.verdad(`${percent} and ${conBase}`) ? c.numero(`${percent} div 100`) : 0;
}

const sumaSubtotales = (c: ContextoNodo, campo: string, ids: string[]) =>
  c.numero(
    `sum(cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[${ids.map((i) => `text() = '${i}'`).join(' or ')}]]/cbc:${campo})`,
  );

/** Observaciones 4312, 4309 y 4310 y error 3279 (factura L343-L556; boleta L553-L804). */
function totalesMonetarios(
  c: ContextoNodo,
  total: string,
  linea: string,
  l: { importe?: number; valorVenta?: number; precioVenta?: number; precioVentaObs?: number },
) {
  const n = (x: string) => c.numero(`sum(cac:${total}/cbc:${x})`);
  const totalPrecioVenta = n('TaxInclusiveAmount');
  const totalImporte = n('PayableAmount');
  const totalValorVenta = n('LineExtensionAmount');
  const fuera = (a: number, b: number) => a + 1 < b || a - 1 > b;
  const esNota = linea !== 'cac:InvoiceLine';
  if (l.importe !== undefined) {
    const calculado = esNota
      ? // NC L458/L540, ND L258/L346: bases de los subtotales + tributos + cargos + redondeo.
        sumaSubtotales(c, 'TaxableAmount', ['1000', '1016', '9995', '9997', '9998']) +
        sumaSubtotales(c, 'TaxAmount', ['1000', '7152', '2000', '1016', '9999']) +
        n('ChargeTotalAmount') +
        n('PayableRoundingAmount')
      : totalPrecioVenta +
        n('ChargeTotalAmount') -
        n('AllowanceTotalAmount') -
        n('PrepaidAmount') +
        n('PayableRoundingAmount');
    const condicion = esNota || c.verdad(`cac:${total}/cbc:TaxInclusiveAmount`);
    c.falla('4312', condicion && fuera(totalImporte, calculado), { l: l.importe, esError: false });
  }
  if (l.valorVenta !== undefined) {
    const porLinea = c.numero(
      `sum(${linea}[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID [text() = '1000' or text() = '1016' or text() = '9995' or text() = '9997' or text() = '9998']]//cbc:LineExtensionAmount)`,
    );
    c.falla('4309', fuera(totalValorVenta, porLinea), { l: l.valorVenta, esError: false });
  }
  const baseIgv = c.numero(
    `sum(${linea}/cac:TaxTotal/cac:TaxSubtotal[${IGV_PERCENT}]/cbc:TaxableAmount)`,
  );
  if (l.precioVenta !== undefined && c.verdad(`cac:${total}/cbc:TaxInclusiveAmount`)) {
    const esperado = totalValorVenta + baseIgv * tasaPrimeraLinea(c, linea);
    c.falla('3279', fuera(totalPrecioVenta, esperado), { l: l.precioVenta });
  }
  // Boleta L804 (rama sin IVAP): observa si el precio de venta no calza ni al 18 % ni al 10 %.
  if (
    l.precioVentaObs !== undefined &&
    c.verdad("$tipoOperacion != '0113'") &&
    c.verdad(`cac:${total}/cbc:TaxInclusiveAmount`)
  ) {
    const ambas =
      fuera(totalPrecioVenta, totalValorVenta + baseIgv * 0.18) &&
      fuera(totalPrecioVenta, totalValorVenta + baseIgv * 0.1);
    c.falla('4310', ambas, { l: l.precioVentaObs, esError: false });
  }
}

// ── Emisor y cliente ─────────────────────────────────────────────────────────────────────────

function emisor(c: ContextoNodo, l: { schemeID?: number; nombre: number }) {
  c.cada('cac:AccountingSupplierParty', (p) => {
    if (l.schemeID !== undefined)
      p.existeYCumple(
        '1008',
        '1007',
        'cac:Party/cac:PartyIdentification/cbc:ID/@schemeID',
        /^(6)$/,
        { l: l.schemeID },
      );
    p.existe('1037', 'cac:Party/cac:PartyLegalEntity/cbc:RegistrationName', { l: l.nombre });
  });
}

// ── Líneas ───────────────────────────────────────────────────────────────────────────────────

interface LineasL {
  id?: number;
  duplicada: number;
  unidad?: number;
  cantidad?: [number, number];
  descripcion?: number;
  precio: number;
  precioRef?: number;
  sinTaxTotal: number;
  taxTotal: number;
  /** El monto del TaxTotal de línea se valida en la plantilla de línea (notas) o en la de TaxTotal. */
  taxTotalEnLinea?: boolean;
  valorVenta: number;
  sub: {
    id: number;
    cat: number;
    calculo: number;
    monto: number;
    afectacion: number;
    percent: number;
  };
  /** Observaciones del TaxTotal de línea: 4293 (suma de tributos) y 4294 (base del IGV). */
  obs: {
    impuestos: number;
    base: number;
    impuestosAntesDeSubtotales?: boolean;
    baseConTolerancia?: boolean;
  };
  /** Dónde evalúa cada XSL la regla 3103 dentro del subtotal de línea. */
  ordenCalculo: 'antesDeMonto' | 'despuesDeMonto' | 'despuesDeAfectacion';
  afectacionSoloConBase?: boolean;
  precioAntesDeTaxTotal?: boolean;
}

function lineas(c: ContextoNodo, etiqueta: string, cantidad: string, l: LineasL) {
  const ids = c.nodos(`cac:${etiqueta}/cbc:ID`).map((n) => Number(n.textContent?.trim()));
  c.cada(
    `cac:${etiqueta}`,
    (ln) => {
      if (l.id !== undefined)
        ln.existeYCumple('2023', '2023', 'cbc:ID', /^(?!0*$)\d{1,3}$/, { l: l.id });
      // key('by-…Line-id', number(cbc:ID)): conteo de líneas con el mismo número.
      const propio = ln.numero('number(cbc:ID)');
      ln.falla('2752', ids.filter((x) => x === propio).length > 1, { l: l.duplicada });
      if (l.unidad !== undefined && ln.verdad(`cbc:${cantidad}`))
        ln.existe('2883', `cbc:${cantidad}/@unitCode`, { l: l.unidad });
      if (l.cantidad) {
        ln.existeDecimal('2024', '2025', `cbc:${cantidad}`, 10, {
          l: l.cantidad[0],
          mayorCero: false,
        });
        ln.falla('2024', `cbc:${cantidad} = 0`, { l: l.cantidad[1] });
      }
      if (l.descripcion !== undefined)
        ln.existe('2026', 'cac:Item/cbc:Description', { l: l.descripcion });
      const precio = () => {
        ln.existeDecimal(
          l.precioRef === undefined ? '2369' : '2068',
          '2369',
          'cac:Price/cbc:PriceAmount',
          10,
          { l: l.precio, mayorCero: false },
        );
      };
      if (!l.precioAntesDeTaxTotal) {
        precio();
        if (l.precioRef !== undefined)
          ln.existe('2028', 'cac:PricingReference/cac:AlternativeConditionPrice/cbc:PriceAmount', {
            l: l.precioRef,
          });
      }
      ln.falla('3195', 'not(cac:TaxTotal)', { l: l.sinTaxTotal });
      if (l.precioAntesDeTaxTotal) precio();
      if (l.taxTotalEnLinea)
        ln.existeDecimal('3021', '3021', 'cac:TaxTotal/cbc:TaxAmount', 2, {
          l: l.taxTotal,
          mayorCero: false,
        });
      const valorVenta = ln.numero('number(cbc:LineExtensionAmount)');
      ln.cada('cac:TaxTotal', (t) => {
        if (!l.taxTotalEnLinea)
          t.existeDecimal('3021', '3021', 'cbc:TaxAmount', 2, { l: l.taxTotal, mayorCero: false });
        if (l.obs.impuestosAntesDeSubtotales) obsImpuestosLinea(t, l);
        t.cada(
          'cac:TaxSubtotal',
          (s) => {
            subtotalLinea(s, l);
          },
          (s) => ({
            codigoTributo: s.texto('cac:TaxCategory/cac:TaxScheme/cbc:ID'),
          }),
        );
        if (!l.obs.impuestosAntesDeSubtotales) obsImpuestosLinea(t, l);
        obsBaseLinea(t, l, valorVenta);
      });
      ln.existeDecimal('2370', '2370', 'cbc:LineExtensionAmount', 2, {
        l: l.valorVenta,
        mayorCero: false,
      });
    },
    (ln) => ({ nroLinea: ln.texto('cbc:ID') }),
  );
}

/** 4293: TaxAmount del TaxTotal de línea vs. suma de sus tributos (factura L3194-L3201). */
function obsImpuestosLinea(t: ContextoNodo, l: LineasL) {
  if (
    !t.verdad(
      "cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '1000' or text() = '7152' or text() = '1016' or text() = '2000' or text() = '9999']",
    )
  )
    return;
  const total = t.numero('number(cbc:TaxAmount)');
  const suma = t.numero(
    "sum(cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '1000' or text() = '7152' or text() = '1016' or text() = '2000' or text() = '9999']]/cbc:TaxAmount)",
  );
  t.falla('4293', redondear2(total + 1) < suma || redondear2(total - 1) > suma, {
    l: l.obs.impuestos,
    esError: false,
  });
}

/** 4294: base del IGV de la línea vs. valor de venta + ISC (factura L3205-L3233; notas L3497-L3517). */
function obsBaseLinea(t: ContextoNodo, l: LineasL, valorVenta: number) {
  const isc = t.verdad(
    "cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID = '2000']/cbc:TaxAmount",
  )
    ? t.numero(
        "number(cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID = '2000']/cbc:TaxAmount)",
      )
    : 0;
  const calculado = valorVenta + isc;
  const base =
    "cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '1000' or text() = '1016']]/cbc:TaxableAmount";
  if (l.obs.baseConTolerancia) {
    // Notas: $BaseIGVIVAPxLinea es el conjunto de nodos; se compara su primer valor con ±1.
    if (!t.verdad(base)) return;
    const b = t.numero(`number(${base})`);
    t.falla('4294', b + 1 < calculado || b - 1 > calculado, { l: l.obs.base, esError: false });
    return;
  }
  // Factura y boleta: $BaseIGVIVAPxLinea = sum(...); el xsl:if exige que no sea 0 ni NaN.
  const b = t.numero(`sum(${base})`);
  if (!b) return;
  if (isc > 0)
    t.falla('4294', b + 1 < calculado || b - 1 > calculado, { l: l.obs.base - 9, esError: false });
  else t.falla('4294', b !== calculado, { l: l.obs.base, esError: false });
}

function subtotalLinea(s: ContextoNodo, l: LineasL) {
  const L = l.sub;
  s.existe('2037', 'cac:TaxCategory/cac:TaxScheme/cbc:ID', { l: L.id });
  s.enCatalogo('2036', 'cac:TaxCategory/cac:TaxScheme/cbc:ID', '05', { l: L.cat });
  const calculo = () => {
    // MontoTributo, BaseImponible y Tasa (L2763-L2792 de factura): xsl:choose sobre el nodo.
    if (
      !s.verdad(
        "cac:TaxCategory/cbc:TaxExemptionReasonCode[text() = '10' or text() = '11' or text() = '12' or text() = '13' or text() = '14' or text = '15' or text() = '16' or text() = '17']",
      )
    )
      return;
    const monto = s.verdad('cbc:TaxAmount') ? s.numero('number(cbc:TaxAmount)') : 0;
    const base = s.verdad('cbc:TaxableAmount') ? s.numero('number(cbc:TaxableAmount)') : monto;
    const tasa = s.verdad('cac:TaxCategory/cbc:Percent')
      ? s.numero('number(cac:TaxCategory/cbc:Percent)')
      : 0;
    const calculado = base * tasa * 0.01;
    s.falla('3103', monto + 1 < calculado || monto - 1 > calculado, { l: L.calculo });
  };
  if (l.ordenCalculo === 'antesDeMonto') calculo();
  s.existeDecimal('2033', '2033', 'cbc:TaxAmount', 2, { l: L.monto, mayorCero: false });
  if (l.ordenCalculo === 'despuesDeMonto') calculo();
  if (s.verdad("$codigoTributo != '7152'")) {
    const aplica = l.afectacionSoloConBase
      ? s.verdad("$codigoTributo != '2000' and $codigoTributo != '9999' and cbc:TaxableAmount > 0")
      : s.verdad("$codigoTributo != '2000' and $codigoTributo != '9999' and $codigoTributo != ''");
    if (aplica) s.existe('2371', 'cac:TaxCategory/cbc:TaxExemptionReasonCode', { l: L.afectacion });
  }
  if (l.ordenCalculo === 'despuesDeAfectacion') calculo();
  if (s.verdad("$codigoTributo != '7152'"))
    s.existe('2992', 'cac:TaxCategory/cbc:Percent', { l: L.percent });
}

// ── Secuencias por tipo ──────────────────────────────────────────────────────────────────────

export function validarFactura(ctx: Contexto): void {
  const c = ctx.en(ctx.raiz);
  nombreArchivoVsContenido(c, [48, 54, 60]);
  versiones(c, 73, 82);
  c.cumpleSiExiste('1001', 'cbc:ID', /^([F][A-Z0-9]{3}|[0-9]{4})-[0-9]{1,8}?$/, { l: 95 });
  c.existeYCumple('1004', '1003', 'cbc:InvoiceTypeCode', /^01$/, { l: 109 });
  moneda(c, [135, 139, 146]);
  emisor(c, { schemeID: 746, nombre: 789 });
  c.cada('cac:AccountingCustomerParty', (p) => {
    p.existeNodo('2014', ID_CLIENTE, { l: 1202 });
    if (p.verdad(`${ID_CLIENTE} != '-'`)) {
      if (p.verdad(`${ID_CLIENTE}/@schemeID ='6'`))
        p.cumpleSiExiste('2017', ID_CLIENTE, /^[\d]{11}$/, { l: 1210 });
      else if (p.verdad(`${ID_CLIENTE}/@schemeID ='1'`))
        p.cumpleSiExiste('2801', ID_CLIENTE, /^[\d]{8}$/, { l: 1218 });
      else p.cumpleSiExiste('2802', ID_CLIENTE, /^(?!\s*$)[^\s]{1,15}$/, { l: 1226 });
    }
    p.existeNodo('2015', `${ID_CLIENTE}/@schemeID`, { l: 1235 });
    // xsl:choose sobre $tipoOperacion (L1240-L1271).
    if (
      p.verdad(
        "$tipoOperacion = '0200' or $tipoOperacion = '0201' or $tipoOperacion = '0203' or $tipoOperacion = '0204' or $tipoOperacion = '0205' or $tipoOperacion = '0206' or $tipoOperacion = '0207' or $tipoOperacion = '0208'",
      )
    )
      p.falla('2800', `${ID_CLIENTE}/@schemeID = '6'`, { l: 1244 });
    else if (p.verdad("$tipoOperacion = '0112'"))
      p.falla('2800', `${ID_CLIENTE}/@schemeID != '1' and ${ID_CLIENTE}/@schemeID != '6'`, {
        l: 1251,
      });
    else if (p.verdad("$tipoOperacion = '0202' or $tipoOperacion = '0401'")) {
      if (p.verdad(`${ID_CLIENTE}/@schemeID != '-'`))
        p.enCatalogo('2800', `${ID_CLIENTE}/@schemeID`, '06', { l: 1259 });
    } else p.falla('2800', `${ID_CLIENTE}/@schemeID != '6'`, { l: 1267 });
    p.existeYCumple('2021', '2022', 'cac:Party/cac:PartyLegalEntity/cbc:RegistrationName', NOMBRE, {
      l: 1294,
    });
  });
  lineas(c, 'InvoiceLine', 'InvoicedQuantity', {
    id: 1508,
    duplicada: 1517,
    unidad: 1526,
    cantidad: [1549, 1556],
    descripcion: 1693,
    precio: 1870,
    precioRef: 1885,
    sinTaxTotal: 1961,
    taxTotal: 3173,
    valorVenta: 1983,
    sub: { id: 2925, cat: 2930, calculo: 2937, monto: 2946, afectacion: 3031, percent: 3101 },
    ordenCalculo: 'antesDeMonto',
    obs: { impuestos: 3197, base: 3227 },
  });
  c.existeDecimal('2062', '2062', 'cac:LegalMonetaryTotal/cbc:PayableAmount', 2, {
    l: 239,
    mayorCero: false,
  });
  c.decimalSiExiste('2031', 'cac:LegalMonetaryTotal/cbc:LineExtensionAmount', {
    l: 251,
    mayorCero: false,
  });
  c.decimalSiExiste('3019', 'cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount', {
    l: 256,
    mayorCero: false,
  });
  c.existe('2956', 'cac:TaxTotal', { l: 276 });
  taxTotalCabecera(
    c,
    'cac:InvoiceLine',
    { total: 4645, base: 4559, monto: 4568, id: 4583, cat: 4587, baseIgv: 4776, impuestos: 4802 },
    false,
  );
  igvCabecera(c, 'cac:InvoiceLine', { mezcla: 328, indicadores: 462, suma: 467 });
  totalesMonetarios(c, 'LegalMonetaryTotal', 'cac:InvoiceLine', {
    importe: 494,
    valorVenta: 500,
    precioVenta: 550,
  });
}

export function validarBoleta(ctx: Contexto): void {
  const c = ctx.en(ctx.raiz);
  nombreArchivoVsContenido(c, [null, 85, 92]);
  versiones(c, null, 135);
  c.cumpleSiExiste('1001', 'cbc:ID', /^([B][A-Z0-9]{3}|[0-9]{4})-[0-9]{1,8}?$/, { l: 150 });
  c.existeYCumple('1004', '1003', 'cbc:InvoiceTypeCode', /^03$/, { l: 169 });
  moneda(c, [200, 206, 213]);
  emisor(c, { schemeID: 1102, nombre: 1148 });
  c.cada('cac:AccountingCustomerParty', (p) => {
    p.existeNodo('2014', ID_CLIENTE, { l: 1509 });
    if (p.verdad(`${ID_CLIENTE} != '-'`) && p.verdad(`${ID_CLIENTE}/@schemeID ='6'`))
      p.cumpleSiExiste('2017', ID_CLIENTE, /^[\d]{11}$/, { l: 1519 });
    p.existeNodo('2015', `${ID_CLIENTE}/@schemeID`, { l: 1552 });
    p.existeYCumple('2021', '2022', 'cac:Party/cac:PartyLegalEntity/cbc:RegistrationName', NOMBRE, {
      l: 1609,
    });
  });
  lineas(c, 'InvoiceLine', 'InvoicedQuantity', {
    id: 1906,
    duplicada: 1917,
    unidad: 1927,
    cantidad: [1952, 1960],
    descripcion: 2109,
    precio: 2146,
    precioRef: 2164,
    sinTaxTotal: 2267,
    taxTotal: 3722,
    valorVenta: 2292,
    sub: { id: 3356, cat: 3363, calculo: 3468, monto: 3372, afectacion: 3478, percent: 3572 },
    ordenCalculo: 'despuesDeMonto',
    obs: { impuestos: 3764, base: 3799 },
  });
  c.existeDecimal('2062', '2062', 'cac:LegalMonetaryTotal/cbc:PayableAmount', 2, {
    l: 417,
    mayorCero: false,
  });
  c.decimalSiExiste('2031', 'cac:LegalMonetaryTotal/cbc:LineExtensionAmount', {
    l: 431,
    mayorCero: false,
  });
  c.decimalSiExiste('3019', 'cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount', {
    l: 437,
    mayorCero: false,
  });
  c.falla('2956', 'not(cac:TaxTotal)', { l: 464 });
  taxTotalCabecera(
    c,
    'cac:InvoiceLine',
    { total: 5195, base: 5044, monto: 5055, id: 5084, cat: 5089, baseIgv: 5354, impuestos: 5385 },
    false,
  );
  // 4290 tiene una rama propia para la operación 0113 (NRUS) que Chasqui no genera.
  igvCabecera(c, 'cac:InvoiceLine', { mezcla: 523, observacion: 700 });
  totalesMonetarios(c, 'LegalMonetaryTotal', 'cac:InvoiceLine', {
    importe: 746,
    valorVenta: 753,
    precioVentaObs: 804,
  });
}

function validarNota(ctx: Contexto, tipo: '07' | '08'): void {
  const nc = tipo === '07';
  const c = ctx.en(ctx.raiz);
  nombreArchivoVsContenido(c, nc ? [149, 156, 163] : [54, 60, 66]);
  versiones(c, nc ? 174 : 73, nc ? 186 : 81);
  c.cumpleSiExiste('1001', 'cbc:ID', /^([FBS][A-Z0-9]{3}|[0-9]{4})-[0-9]{1,8}?$/, {
    l: nc ? 202 : 94,
  });
  motivoNota(c, nc ? '09' : '10', nc ? [221, 230, 271] : [103, 110, 143]);
  moneda(c, nc ? [281, 288, 296] : [151, 156, 162]);
  if (nc && c.verdad("cac:DiscrepancyResponse/cbc:ResponseCode != '10'"))
    c.existeNodo('2524', 'cac:BillingReference', { l: 306 });
  emisor(c, { nombre: nc ? 777 : 506 });
  c.cada('cac:AccountingCustomerParty', (p) => {
    if (p.verdad(`${ID_CLIENTE}/@schemeID = '6'`))
      p.cumpleSiExiste('2017', ID_CLIENTE, /^[\d]{11}$/, { l: nc ? 993 : 670 });
    p.existeYCumple(
      '2021',
      '2022',
      'cac:Party/cac:PartyLegalEntity/cbc:RegistrationName',
      NOMBRE_NOTA,
      { l: nc ? 1048 : 710 },
    );
  });
  c.cada('cac:BillingReference', (b) => {
    if (b.verdad(`$root/cac:DiscrepancyResponse/cbc:ResponseCode != '${nc ? '10' : '03'}'`))
      b.existeNodo('2524', 'cac:InvoiceDocumentReference', { l: nc ? 1086 : 733 });
  });
  if (nc) c.existe('2956', 'cac:TaxTotal', { l: 377 });
  const linea = nc ? 'cac:CreditNoteLine' : 'cac:DebitNoteLine';
  taxTotalCabecera(
    c,
    linea,
    nc
      ? {
          total: 1687,
          base: 2012,
          monto: 2242,
          id: 2259,
          cat: 2266,
          baseIgv: 1829,
          impuestos: 1699,
        }
      : {
          total: 1055,
          base: 1327,
          monto: 1359,
          id: 1372,
          cat: 1377,
          baseIgv: 1148,
          impuestos: 1065,
        },
    true,
  );
  const total = nc ? 'LegalMonetaryTotal' : 'RequestedMonetaryTotal';
  // En notas, 3462 y 3291 solo aplican si el documento modificado es una factura (01).
  if (
    c.verdad(
      "cac:BillingReference/cac:InvoiceDocumentReference[cbc:DocumentTypeCode[text() = '01']]",
    )
  ) {
    igvCabecera(
      c,
      linea,
      nc
        ? { mezcla: 441, indicadores: 558, suma: 563 }
        : { mezcla: 234, indicadores: 361, suma: 367 },
    );
  } else {
    igvCabecera(c, linea, { mezcla: nc ? 447 : 240, observacion: nc ? 571 : 376 });
  }
  totalesMonetarios(c, total, linea, { importe: nc ? 593 : 396 });
  c.existeDecimal('2062', '2062', `cac:${total}/cbc:PayableAmount`, 2, {
    l: nc ? 643 : 411,
    mayorCero: !nc,
  });
  if (!nc) c.falla('2956', 'not(cac:TaxTotal)', { l: 436 });
  lineas(c, nc ? 'CreditNoteLine' : 'DebitNoteLine', nc ? 'CreditedQuantity' : 'DebitedQuantity', {
    duplicada: nc ? 2493 : 1487,
    precio: nc ? 2742 : 1694,
    sinTaxTotal: nc ? 2852 : 1660,
    taxTotal: nc ? 2861 : 1765,
    taxTotalEnLinea: true,
    valorVenta: nc ? 2923 : 1835,
    precioAntesDeTaxTotal: !nc,
    ordenCalculo: nc ? 'despuesDeAfectacion' : 'despuesDeMonto',
    obs: nc
      ? { impuestos: 3481, base: 3513, impuestosAntesDeSubtotales: true, baseConTolerancia: true }
      : { impuestos: 2373, base: 2394, baseConTolerancia: true },
    afectacionSoloConBase: !nc,
    sub: nc
      ? { id: 3757, cat: 3763, calculo: 4122, monto: 3783, afectacion: 3794, percent: 4201 }
      : { id: 2084, cat: 2089, calculo: 2198, monto: 2106, afectacion: 2207, percent: 2295 },
  });
}

export const SECUENCIAS: Record<TipoComprobante, (ctx: Contexto) => void> = {
  '01': validarFactura,
  '03': validarBoleta,
  '07': (ctx) => {
    validarNota(ctx, '07');
  },
  '08': (ctx) => {
    validarNota(ctx, '08');
  },
};
