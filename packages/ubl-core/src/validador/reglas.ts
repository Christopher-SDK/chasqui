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
  exoneradas: number;
  inafectas: number;
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
      const total = t.numeroDe('cbc:TaxAmount');
      const suma = redondear2(t.numero(`sum(${TRIBUTOS_IMPUESTO}/cbc:TaxAmount)`));
      t.falla('4301', redondear2(total + 1) < suma || redondear2(total - 1) > suma, {
        l: l.impuestos,
        esError: false,
      });
    };
    const baseDeLineas = (id: string) =>
      t.numero(
        `sum($root/${linea}/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '${id}']]/cbc:TaxableAmount)`,
      );
    // $totalBaseExoneradas/$totalBaseInafectas son conjuntos de nodos: si faltan, number() = NaN
    // y toda comparación es falsa, como en XPath.
    const baseCabecera = (id: string) =>
      t.numeroDe(
        `cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '${id}']]/cbc:TaxableAmount`,
      );
    const o4297 = () => {
      const exo = baseCabecera('9997');
      const calc = baseDeLineas('9997');
      t.falla('4297', redondear2(exo + 1) < calc || redondear2(exo - 1) > calc, {
        l: l.exoneradas,
        esError: false,
      });
    };
    const o4296 = () => {
      const ina = baseCabecera('9998');
      const calc = baseDeLineas('9998');
      t.falla('4296', ina + 1 < calc || ina - 1 > calc, { l: l.inafectas, esError: false });
    };
    if (esNota) {
      o4301();
      o4297();
      o4296();
      o4299();
    } else {
      o4297();
      o4296();
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
  /** 2027: descripción de más de 500 caracteres (boleta: también vacía) o en blanco. */
  descripcionFormato?: { l: number; lRegex: number; vacia?: boolean };
  /** 4288: valor de venta de la línea vs. valor unitario × cantidad. */
  valorVentaCalculado?: { l: number; antesDeValorVenta?: boolean };
  precio: number;
  precioRef?: number;
  sinTaxTotal: number;
  taxTotal: number;
  /** El monto del TaxTotal de línea se valida en la plantilla de línea (notas) o en la de TaxTotal. */
  taxTotalEnLinea?: boolean;
  valorVenta: number;
  /** Pasos del subtotal de línea en el orden del XSL de cada tipo: [paso, línea]. */
  subtotal: [PasoSubtotal, number][];
  /** Observaciones del TaxTotal de línea: 4293 (suma de tributos) y 4294 (base del IGV). */
  obs: {
    impuestos: number;
    base: number;
    impuestosAntesDeSubtotales?: boolean;
    baseConTolerancia?: boolean;
  };
  /** 3105: el TaxTotal de línea debe tener un tributo IGV/IVAP/exonerado/inafecto/… */
  tributoObligatorio: { l: number; conBase?: boolean };
  /** 4287: precio unitario de referencia vs. (valor de venta + impuestos) / cantidad. */
  precioUnitario?: { l: number; antesDeValorVenta?: boolean };
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
      const propio = ln.numeroDe('cbc:ID');
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
      if (l.descripcionFormato) {
        const largo = ln.numero('string-length(cac:Item/cbc:Description)');
        if (largo > 500 || (l.descripcionFormato.vacia === true && largo < 1))
          ln.falla('2027', true, { l: l.descripcionFormato.l });
        else
          ln.cumpleSiExiste('2027', 'cac:Item/cbc:Description', /^(?!\s*$)[\s\S].{0,}/, {
            l: l.descripcionFormato.lRegex,
          });
      }
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
      const valorVenta = ln.numeroDe('cbc:LineExtensionAmount');
      ln.cada('cac:TaxTotal', (t) => {
        if (!l.taxTotalEnLinea)
          t.existeDecimal('3021', '3021', 'cbc:TaxAmount', 2, { l: l.taxTotal, mayorCero: false });
        if (l.obs.impuestosAntesDeSubtotales) obsImpuestosLinea(t, l);
        t.cada(
          'cac:TaxSubtotal',
          (s) => {
            subtotalLinea(s, l.subtotal);
          },
          (s) => ({
            codigoTributo: s.texto('cac:TaxCategory/cac:TaxScheme/cbc:ID'),
          }),
        );
        if (!l.obs.impuestosAntesDeSubtotales) obsImpuestosLinea(t, l);
        obsBaseLinea(t, l, valorVenta);
        tributoObligatorio(t, l);
      });
      if (l.precioUnitario?.antesDeValorVenta) obsPrecioUnitario(ln, cantidad, l.precioUnitario.l);
      if (l.valorVentaCalculado?.antesDeValorVenta)
        obsValorVenta(ln, cantidad, l.valorVentaCalculado.l);
      ln.existeDecimal('2370', '2370', 'cbc:LineExtensionAmount', 2, {
        l: l.valorVenta,
        mayorCero: false,
      });
      if (l.precioUnitario && !l.precioUnitario.antesDeValorVenta)
        obsPrecioUnitario(ln, cantidad, l.precioUnitario.l);
      if (l.valorVentaCalculado && !l.valorVentaCalculado.antesDeValorVenta)
        obsValorVenta(ln, cantidad, l.valorVentaCalculado.l);
    },
    (ln) => ({ nroLinea: ln.texto('cbc:ID') }),
  );
}

/** 3105 (factura L3236; boleta L3812 exige además base > 0). */
function tributoObligatorio(t: ContextoNodo, l: LineasL) {
  const ids =
    "text() = '1000' or text() = '1016' or text() = '9995' or text() = '9996' or text() = '9997' or text() = '9998'";
  if (l.tributoObligatorio.conBase) {
    if (
      t.verdad(
        "$tipoOperacion != '2100' and $tipoOperacion != '2101' and $tipoOperacion != '2102' and $tipoOperacion != '2103' and $tipoOperacion != '2104'",
      )
    )
      t.falla(
        '3105',
        `count(cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[${ids}] and cbc:TaxableAmount > 0]) < 1`,
        { l: l.tributoObligatorio.l },
      );
    return;
  }
  // La factura incluye además 7152 (ICBPER) en la lista; Chasqui no genera ICBPER.
  t.falla('3105', `count(cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID[${ids}]) < 1`, {
    l: l.tributoObligatorio.l,
  });
}

/** 4287 (factura L1996-L2016): precio unitario de referencia (tipo 01) vs. el calculado. */
function obsPrecioUnitario(ln: ContextoNodo, cantidad: string, l: number) {
  const precio = ln.numero(
    "sum(cac:PricingReference/cac:AlternativeConditionPrice[cbc:PriceTypeCode = '01']/cbc:PriceAmount)",
  );
  const valorVenta = ln.numeroDe('cbc:LineExtensionAmount');
  const impuestos = ln.numeroDe('cac:TaxTotal/cbc:TaxAmount');
  const descuentos = ln.numero(
    "sum(cac:AllowanceCharge[cbc:AllowanceChargeReasonCode = '01']/cbc:Amount)",
  );
  const cargos = ln.numero(
    "sum(cac:AllowanceCharge[cbc:AllowanceChargeReasonCode = '48']/cbc:Amount)",
  );
  const calculado = (valorVenta + impuestos - descuentos + cargos) / ln.numeroDe(`cbc:${cantidad}`);
  const gratuita = ln.verdad(
    "cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '9996']]/cbc:TaxableAmount > 0",
  );
  // Precedencia literal del XSL: (not(gratuita) and A) or B.
  ln.falla('4287', (!gratuita && precio + 1 < calculado) || precio - 1 > calculado, {
    l,
    esError: false,
  });
}

/** 4288 (factura L2026, rama no gratuita): valor de venta vs. valor unitario × cantidad. */
function obsValorVenta(ln: ContextoNodo, cantidad: string, l: number) {
  if (
    ln.verdad(
      "cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '9996']]/cbc:TaxableAmount > 0",
    )
  )
    return;
  const valorVenta = ln.numeroDe('cbc:LineExtensionAmount');
  const descuentos = ln.numero(
    "sum(cac:AllowanceCharge[cbc:AllowanceChargeReasonCode = '00']/cbc:Amount)",
  );
  const cargos = ln.numero(
    "sum(cac:AllowanceCharge[cbc:AllowanceChargeReasonCode = '47']/cbc:Amount)",
  );
  const calculado =
    ln.numeroDe('cac:Price/cbc:PriceAmount') * ln.numeroDe(`cbc:${cantidad}`) - descuentos + cargos;
  ln.falla('4288', valorVenta + 1 < calculado || valorVenta - 1 > calculado, { l, esError: false });
}

/** 4293: TaxAmount del TaxTotal de línea vs. suma de sus tributos (factura L3194-L3201). */
function obsImpuestosLinea(t: ContextoNodo, l: LineasL) {
  if (
    !t.verdad(
      "cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '1000' or text() = '7152' or text() = '1016' or text() = '2000' or text() = '9999']",
    )
  )
    return;
  const total = t.numeroDe('cbc:TaxAmount');
  const suma = t.numero(
    "sum(cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '1000' or text() = '7152' or text() = '1016' or text() = '2000' or text() = '9999']]/cbc:TaxAmount)",
  );
  t.falla('4293', redondear2(total + 1) < suma || redondear2(total - 1) > suma, {
    l: l.obs.impuestos,
    esError: false,
  });
}

/**
 * 4294: base del IGV de la línea vs. su valor de venta (factura L3227; notas L3509-L3517).
 * El XSL suma el ISC al valor de venta y, si hay ISC, compara con ±1 (factura L3218). El ISC está
 * fuera del subconjunto, así que aquí vale 0 (ver docs/fuentes.md §6).
 */
function obsBaseLinea(t: ContextoNodo, l: LineasL, valorVenta: number) {
  const base =
    "cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:ID[text() = '1000' or text() = '1016']]/cbc:TaxableAmount";
  if (l.obs.baseConTolerancia) {
    // Notas: $BaseIGVIVAPxLinea es el conjunto de nodos; se compara su primer valor con ±1.
    if (!t.verdad(base)) return;
    const b = t.numeroDe(base);
    t.falla('4294', b + 1 < valorVenta || b - 1 > valorVenta, { l: l.obs.base, esError: false });
    return;
  }
  // Factura y boleta: $BaseIGVIVAPxLinea = sum(...); el xsl:if exige que no sea 0 ni NaN.
  const b = t.numero(`sum(${base})`);
  if (b) t.falla('4294', b !== valorVenta, { l: l.obs.base, esError: false });
}

type PasoSubtotal =
  | 'id'
  | 'catalogo'
  | 'calculo'
  | 'monto'
  | 'montoCeroExoInaExp'
  | 'montoRetiro'
  | 'montoGratuito'
  | 'montoGravado'
  | 'montoGravadoBoleta'
  | 'afectacion'
  | 'afectacionConBase'
  | 'percentFormato'
  | 'tasaCeroRetiro'
  | 'tasaCero'
  | 'tasaCeroBoleta'
  | 'afectacionEnOtros'
  | 'percent';

const RETIRO_GRAVADO =
  "cac:TaxCategory/cbc:TaxExemptionReasonCode[text() = '11' or text() = '12' or text() = '13' or text() = '14' or text() = '15' or text() = '16' or text() = '17']";
const RETIRO_NO_GRAVADO =
  "cac:TaxCategory/cbc:TaxExemptionReasonCode[text() = '21' or text() = '31' or text() = '32' or text() = '33' or text() = '34' or text() = '35' or text() = '36' or text() = '37' or text() = '40']";

function subtotalLinea(s: ContextoNodo, pasos: [PasoSubtotal, number][]) {
  for (const [paso, l] of pasos) {
    switch (paso) {
      case 'id':
        s.existe('2037', 'cac:TaxCategory/cac:TaxScheme/cbc:ID', { l });
        break;
      case 'catalogo':
        s.enCatalogo('2036', 'cac:TaxCategory/cac:TaxScheme/cbc:ID', '05', { l });
        break;
      case 'calculo': {
        // MontoTributo, BaseImponible y Tasa (factura L2763-L2792): xsl:choose sobre el nodo.
        if (
          !s.verdad(
            "cac:TaxCategory/cbc:TaxExemptionReasonCode[text() = '10' or text() = '11' or text() = '12' or text() = '13' or text() = '14' or text = '15' or text() = '16' or text() = '17']",
          )
        )
          break;
        const monto = s.verdad('cbc:TaxAmount') ? s.numeroDe('cbc:TaxAmount') : 0;
        const base = s.verdad('cbc:TaxableAmount') ? s.numeroDe('cbc:TaxableAmount') : monto;
        const tasa = s.verdad('cac:TaxCategory/cbc:Percent')
          ? s.numeroDe('cac:TaxCategory/cbc:Percent')
          : 0;
        const calculado = base * tasa * 0.01;
        s.falla('3103', monto + 1 < calculado || monto - 1 > calculado, { l });
        break;
      }
      case 'monto':
        s.existeDecimal('2033', '2033', 'cbc:TaxAmount', 2, { l, mayorCero: false });
        break;
      case 'montoCeroExoInaExp':
        if (
          s.verdad("$codigoTributo = '9995' or $codigoTributo = '9997' or $codigoTributo = '9998'")
        )
          s.falla('3110', 'cbc:TaxAmount != 0', { l });
        break;
      case 'montoRetiro':
        if (s.verdad("$codigoTributo = '9996'"))
          s.falla('3111', `cbc:TaxableAmount > 0 and ${RETIRO_GRAVADO} and cbc:TaxAmount = 0`, {
            l,
          });
        break;
      case 'montoGratuito':
        if (s.verdad("$codigoTributo = '9996'"))
          s.falla('3110', `cbc:TaxableAmount > 0 and ${RETIRO_NO_GRAVADO} and cbc:TaxAmount != 0`, {
            l,
          });
        break;
      case 'montoGravado':
        if (s.verdad("$codigoTributo = '1000' or $codigoTributo = '1016'"))
          s.falla('3111', 'cbc:TaxableAmount > 0 and cbc:TaxAmount = 0', { l });
        break;
      case 'montoGravadoBoleta':
        if (s.verdad("$codigoTributo = '1000' or $codigoTributo = '1016'"))
          s.falla(
            '3111',
            "cbc:TaxableAmount > 0 and $tipoOperacion != '0113' and cbc:TaxAmount = 0",
            { l },
          );
        break;
      case 'afectacion':
      case 'afectacionConBase': {
        if (!s.verdad("$codigoTributo != '7152'")) break;
        const aplica =
          paso === 'afectacionConBase'
            ? s.verdad(
                "$codigoTributo != '2000' and $codigoTributo != '9999' and cbc:TaxableAmount > 0",
              )
            : s.verdad(
                "$codigoTributo != '2000' and $codigoTributo != '9999' and $codigoTributo != ''",
              );
        if (aplica) s.existe('2371', 'cac:TaxCategory/cbc:TaxExemptionReasonCode', { l });
        break;
      }
      case 'percentFormato':
        s.cumpleSiExiste(
          '3102',
          'cac:TaxCategory/cbc:Percent',
          /^(?!(0)[0-9]+$)[0-9]{1,3}(\.[0-9]{1,5})?$/,
          { l },
        );
        break;
      case 'tasaCeroRetiro':
        if (s.verdad("$codigoTributo = '9996'"))
          // Copia literal: el XSL oficial escribe `text = '15'` (un hijo «text», no text()).
          s.falla(
            '2993',
            "cbc:TaxableAmount > 0 and cac:TaxCategory/cbc:TaxExemptionReasonCode[text() = '11' or text() = '12' or text() = '13' or text() = '14' or text = '15' or text() = '16' or text() = '17'] and cac:TaxCategory/cbc:Percent = 0",
            { l },
          );
        break;
      case 'tasaCero':
        if (s.verdad("$codigoTributo = '1000' or $codigoTributo = '1016'"))
          s.falla('2993', 'cbc:TaxableAmount > 0 and cac:TaxCategory/cbc:Percent = 0', { l });
        break;
      case 'tasaCeroBoleta':
        if (s.verdad("$codigoTributo = '1000' or $codigoTributo = '1016'"))
          s.falla(
            '2993',
            "cbc:TaxableAmount > 0 and $tipoOperacion != '0113' and cac:TaxCategory/cbc:Percent = 0",
            { l },
          );
        break;
      case 'afectacionEnOtros':
        if (s.verdad("$codigoTributo = '2000' or $codigoTributo = '9999'"))
          s.falla('3050', 'cac:TaxCategory/cbc:TaxExemptionReasonCode', { l });
        break;
      case 'percent':
        if (s.verdad("$codigoTributo != '7152'"))
          s.existe('2992', 'cac:TaxCategory/cbc:Percent', { l });
        break;
    }
  }
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
    descripcionFormato: { l: 1850, lRegex: 1858 },
    valorVentaCalculado: { l: 2026 },
    precio: 1870,
    precioRef: 1885,
    sinTaxTotal: 1961,
    taxTotal: 3173,
    valorVenta: 1983,
    subtotal: [
      ['id', 2925],
      ['catalogo', 2930],
      ['calculo', 2937],
      ['monto', 2946],
      ['montoCeroExoInaExp', 2954],
      ['montoRetiro', 2962],
      ['montoGratuito', 2968],
      ['montoGravado', 2976],
      ['percentFormato', 2983],
      ['tasaCeroRetiro', 2990],
      ['tasaCero', 3006],
      ['afectacion', 3031],
      ['afectacionEnOtros', 3040],
      ['percent', 3101],
    ],
    obs: { impuestos: 3197, base: 3227 },
    tributoObligatorio: { l: 3236 },
    precioUnitario: { l: 2010 },
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
    {
      total: 4645,
      base: 4559,
      monto: 4568,
      id: 4583,
      cat: 4587,
      exoneradas: 4727,
      inafectas: 4737,
      baseIgv: 4776,
      impuestos: 4802,
    },
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
    // xsl:choose de L1516-L1545: RUC (error), DNI y otros documentos (observaciones).
    if (p.verdad(`${ID_CLIENTE} != '-'`)) {
      if (p.verdad(`${ID_CLIENTE}/@schemeID ='6'`))
        p.cumpleSiExiste('2017', ID_CLIENTE, /^[\d]{11}$/, { l: 1519 });
      else if (p.verdad(`${ID_CLIENTE}/@schemeID ='1'`))
        p.cumpleSiExiste('4207', ID_CLIENTE, /^[\d]{8}$/, { l: 1528, esError: false });
      else if (
        p.verdad(
          ['4', '7', '0', 'A', 'B', 'C', 'D', 'E']
            .map((t) => `${ID_CLIENTE}/@schemeID ='${t}'`)
            .join(' or '),
        )
      )
        p.cumpleSiExiste('4208', ID_CLIENTE, /^(?!\s*$)[^\s]{1,15}$/, { l: 1539, esError: false });
    }
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
    descripcionFormato: { l: 2117, lRegex: 2125, vacia: true },
    valorVentaCalculado: { l: 2353 },
    precio: 2146,
    precioRef: 2164,
    sinTaxTotal: 2267,
    taxTotal: 3722,
    valorVenta: 2292,
    subtotal: [
      ['id', 3356],
      ['catalogo', 3363],
      ['monto', 3372],
      ['montoCeroExoInaExp', 3382],
      ['montoRetiro', 3391],
      ['montoGratuito', 3398],
      ['montoGravadoBoleta', 3407],
      ['percentFormato', 3415],
      ['tasaCeroRetiro', 3423],
      ['tasaCeroBoleta', 3441],
      ['calculo', 3468],
      ['afectacion', 3478],
      ['afectacionEnOtros', 3499],
      ['percent', 3572],
    ],
    obs: { impuestos: 3764, base: 3799 },
    tributoObligatorio: { l: 3812, conBase: true },
    precioUnitario: { l: 2335 },
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
    {
      total: 5195,
      base: 5044,
      monto: 5055,
      id: 5084,
      cat: 5089,
      exoneradas: 5295,
      inafectas: 5307,
      baseIgv: 5354,
      impuestos: 5385,
    },
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
    p.existe('2679', ID_CLIENTE, { l: nc ? 985 : 664 });
    if (p.verdad(`${ID_CLIENTE}/@schemeID = '6'`))
      p.cumpleSiExiste('2017', ID_CLIENTE, /^[\d]{11}$/, { l: nc ? 993 : 670 });
    p.existe('2679', `${ID_CLIENTE}/@schemeID`, { l: nc ? 1004 : 678 });
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
    // Formato del documento modificado según su tipo (NC L1149/L1163; ND L768/L777).
    const codigo = nc ? '2117' : '2205';
    const id = 'cac:InvoiceDocumentReference/cbc:ID';
    if (b.verdad("cac:InvoiceDocumentReference/cbc:DocumentTypeCode = '01'"))
      b.existeYCumple(
        codigo,
        codigo,
        id,
        /^(([F][A-Z0-9]{3}-[0-9]{1,8})|((E001)-[0-9]{1,8})|([0-9]{1,4}-[0-9]{1,8}))$/,
        { l: nc ? 1149 : 768 },
      );
    if (b.verdad("cac:InvoiceDocumentReference/cbc:DocumentTypeCode = '03'"))
      b.existeYCumple(
        codigo,
        codigo,
        id,
        /^(([B][A-Z0-9]{3}-[0-9]{1,8})|((EB01)-[0-9]{1,8})|([0-9]{1,4}-[0-9]{1,8}))$/,
        { l: nc ? 1163 : 777 },
      );
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
          exoneradas: 1772,
          inafectas: 1783,
          baseIgv: 1829,
          impuestos: 1699,
        }
      : {
          total: 1055,
          base: 1327,
          monto: 1359,
          id: 1372,
          cat: 1377,
          exoneradas: 1117,
          inafectas: 1125,
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
    obs: nc
      ? { impuestos: 3481, base: 3513, impuestosAntesDeSubtotales: true, baseConTolerancia: true }
      : { impuestos: 2373, base: 2394, baseConTolerancia: true },
    tributoObligatorio: { l: nc ? 3524 : 2403 },
    // La NC no tiene la observación 4287; en la ND va antes de 2370.
    ...(nc
      ? { valorVentaCalculado: { l: 2958 } }
      : {
          precioUnitario: { l: 1809, antesDeValorVenta: true },
          valorVentaCalculado: { l: 1825, antesDeValorVenta: true },
        }),
    subtotal: nc
      ? [
          ['id', 3757],
          ['catalogo', 3763],
          ['monto', 3783],
          ['afectacion', 3794],
          ['montoRetiro', 3804],
          ['montoGratuito', 3811],
          ['tasaCeroRetiro', 3818],
          ['percentFormato', 3829],
          ['montoGravado', 3849],
          ['tasaCero', 3889],
          ['afectacionEnOtros', 3940],
          ['montoCeroExoInaExp', 4051],
          ['calculo', 4122],
          ['percent', 4201],
        ]
      : [
          ['id', 2084],
          ['catalogo', 2089],
          ['monto', 2106],
          ['montoCeroExoInaExp', 2114],
          ['montoRetiro', 2122],
          ['montoGratuito', 2128],
          ['montoGravado', 2136],
          ['percentFormato', 2143],
          ['tasaCeroRetiro', 2158],
          ['tasaCero', 2174],
          ['calculo', 2198],
          ['afectacionConBase', 2207],
          ['afectacionEnOtros', 2218],
          ['percent', 2295],
        ],
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
