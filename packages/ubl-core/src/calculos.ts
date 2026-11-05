import { catalogo54, tributoDeAfectacion, type Tributo } from '@chasqui/catalogos';
import { Decimal } from './decimal.js';
import type { AfectacionSoportada, Comprobante, Item, SistemaIsc } from './modelo.js';

/**
 * Tasa del IGV: 16 % de IGV más 2 % de Impuesto de Promoción Municipal (TUO de la Ley del IGV,
 * art. 17, y D. Leg. 776). Fuente: docs/fuentes.md §3.
 */
export const TASA_IGV = Decimal.de('0.18');
export const PORCENTAJE_IGV = '18';
/** Régimen especial de la Ley 31556 (MYPE de restaurantes y hoteles): 8 % + 2 % IPM. */
const TASAS_IGV = { '18': TASA_IGV, '10': Decimal.de('0.10') } as const;
/** IVAP: 4 % sobre la venta de arroz pilado (Ley 28211, art. 4). Fuente: docs/fuentes.md §15. */
export const TASA_IVAP = Decimal.de('0.04');
/** ICBPER por bolsa desde 2023: S/ 0.50 (Ley 30884, art. 12). Fuente: docs/fuentes.md §15. */
export const TARIFA_ICBPER = Decimal.de('0.50');
/** Percepción por régimen (Ley 29173, arts. 17 y 18). Fuente: docs/fuentes.md §15. */
export const TASAS_PERCEPCION = {
  '51': Decimal.de('0.02'),
  '52': Decimal.de('0.01'),
  '53': Decimal.de('0.005'),
} as const;

const GRATUITAS = new Set([
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '21',
  '22',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
]);
const GRAVADAS_GRATUITAS = new Set(['11', '12', '13', '14', '15', '16']);

export const esGratuita = (a: AfectacionSoportada) => GRATUITAS.has(a);

export interface IscCalculado {
  sistema: SistemaIsc;
  base: Decimal;
  monto: Decimal;
  /** Tasa en porcentaje (para cbc:Percent); en el sistema específico, la tasa efectiva. */
  porcentaje: Decimal;
}

export interface LineaCalculada {
  numero: number;
  item: Item;
  cantidad: Decimal;
  /** Valor unitario SIN impuestos que va en cac:Price (0 en las gratuitas). */
  valorUnitario: Decimal;
  /** Precio unitario CON impuestos (catálogo 16, tipo 01) o valor referencial (tipo 02). */
  precioUnitario: Decimal;
  tipoPrecio: '01' | '02';
  /** Descuento del ítem que reduce la base imponible (código 00), con su base. */
  descuento: { monto: Decimal; factor: Decimal; base: Decimal } | null;
  /**
   * cantidad × valor unitario − descuento, a 2 decimales (LineExtensionAmount). En las gratuitas,
   * el valor referencial.
   */
  valorVenta: Decimal;
  isc: IscCalculado | null;
  /** Base del IGV o IVAP: valor de venta + ISC. */
  baseIgv: Decimal;
  /** IGV (o IVAP en la afectación 17). En los retiros gravados, el IGV que no se cobra. */
  igv: Decimal;
  /** Tasa del IGV/IVAP de la línea en porcentaje (0 si no está gravada). */
  porcentajeIgv: string;
  icbper: { bolsas: Decimal; tarifa: Decimal; monto: Decimal } | null;
  tributo: Tributo;
  gratuita: boolean;
  /** Impuestos de la línea (TaxTotal/TaxAmount). */
  impuestos: Decimal;
}

export interface TotalPorTributo {
  tributo: Tributo;
  base: Decimal;
  monto: Decimal;
}

export interface Totales {
  /** Valor de venta de las operaciones onerosas, menos descuentos globales que afectan la base. */
  valorVenta: Decimal;
  /** IGV cobrado (sin el de los retiros gratuitos). */
  igv: Decimal;
  ivap: Decimal;
  isc: Decimal;
  icbper: Decimal;
  /** Impuestos de cabecera: TaxTotal/TaxAmount. */
  impuestos: Decimal;
  /** Valor de venta + impuestos. LegalMonetaryTotal/TaxInclusiveAmount. */
  precioVenta: Decimal;
  descuentoGlobal: { monto: Decimal; factor: Decimal; base: Decimal } | null;
  /** Descuentos que no afectan la base (AllowanceTotalAmount). */
  descuentos: Decimal;
  /** Cargos que no afectan la base (ChargeTotalAmount). */
  cargos: Decimal;
  /** Anticipos deducidos (PrepaidAmount): importe pagado con IGV. */
  anticipos: Decimal;
  /** Valor de venta e IGV de los anticipos deducidos (descuento global 04). */
  anticipo: { base: Decimal; igv: Decimal } | null;
  /** Importe total a pagar. LegalMonetaryTotal/PayableAmount. */
  importeTotal: Decimal;
  porTributo: TotalPorTributo[];
  detraccion: { monto: Decimal; porcentaje: Decimal } | null;
  percepcion: { base: Decimal; tasa: Decimal; monto: Decimal; total: Decimal } | null;
}

export interface ComprobanteCalculado<C extends Comprobante = Comprobante> {
  comprobante: C;
  lineas: LineaCalculada[];
  totales: Totales;
}

const ORDEN_TRIBUTOS: readonly Tributo[] = [
  '2000',
  '1000',
  '1016',
  '9995',
  '9997',
  '9998',
  '9996',
  '7152',
];

function positivo(d: Decimal, que: string): Decimal {
  if (d.comparar(0) <= 0) throw new RangeError(`${que} debe ser mayor que 0`);
  return d;
}

function calcularIsc(
  item: Item,
  cantidad: Decimal,
  valorVenta: Decimal,
  n: string,
): IscCalculado | null {
  const isc = item.isc;
  if (!isc) return null;
  if (item.afectacion !== '10' && item.afectacion !== '17')
    throw new RangeError(`Ítem ${n}: el ISC solo aplica a ítems gravados (10) o IVAP (17)`);
  if (isc.sistema === '02') {
    if (isc.montoFijo === undefined)
      throw new RangeError(`Ítem ${n}: el ISC específico (02) exige montoFijo`);
    const monto = positivo(cantidad.multiplicar(isc.montoFijo).redondear(2), `Ítem ${n}: el ISC`);
    // La regla 3104 rechaza una base > 0 con tasa 0: en el sistema específico la tasa es la
    // efectiva (monto / base), con los 5 decimales que admite cbc:Percent.
    return {
      sistema: '02',
      base: valorVenta,
      monto,
      porcentaje: monto.dividir(valorVenta).multiplicar(100).redondear(5),
    };
  }
  if (isc.tasa === undefined) throw new RangeError(`Ítem ${n}: el ISC ${isc.sistema} exige tasa`);
  const tasa = Decimal.de(isc.tasa);
  let base = valorVenta;
  if (isc.sistema === '03') {
    if (isc.precioSugerido === undefined)
      throw new RangeError(
        `Ítem ${n}: el ISC por precio de venta al público (03) exige precioSugerido`,
      );
    base = cantidad.multiplicar(isc.precioSugerido).redondear(2);
  }
  const monto = positivo(base.multiplicar(tasa).redondear(2), `Ítem ${n}: el ISC`);
  return { sistema: isc.sistema, base, monto, porcentaje: tasa.multiplicar(100) };
}

export function calcularLinea(
  item: Item,
  numero: number,
  tasaIgv: Decimal = TASA_IGV,
): LineaCalculada {
  const n = String(numero);
  const cantidad = Decimal.de(item.cantidad);
  const valorUnitario = Decimal.de(item.valorUnitario);
  if (cantidad.comparar(0) <= 0)
    throw new RangeError(`Ítem ${n}: la cantidad debe ser mayor que 0`);
  if (valorUnitario.comparar(0) < 0)
    throw new RangeError(`Ítem ${n}: el valor unitario no puede ser negativo`);
  const gratuita = esGratuita(item.afectacion);
  const valorBruto = cantidad.multiplicar(valorUnitario).redondear(2);
  // Una venta con valor 0.00 se rechaza con 3105 (ValidaExprRegBoleta-2.0.1.xsl L3812); en las
  // gratuitas, el valor referencial tampoco puede ser 0.
  if (valorBruto.esCero()) throw new RangeError(`Ítem ${n}: el valor de venta redondea a 0.00`);

  let descuento: LineaCalculada['descuento'] = null;
  if (item.descuento) {
    if (gratuita) throw new RangeError(`Ítem ${n}: una transferencia gratuita no lleva descuento`);
    descuento = ajuste(item.descuento, valorBruto, `Ítem ${n}: el descuento`);
  }
  const valorVenta = descuento ? valorBruto.restar(descuento.monto) : valorBruto;
  const isc = calcularIsc(item, cantidad, valorVenta, n);
  const baseIgv = isc ? valorVenta.sumar(isc.monto) : valorVenta;

  const tasa =
    item.afectacion === '17'
      ? TASA_IVAP
      : item.afectacion === '10' || GRAVADAS_GRATUITAS.has(item.afectacion)
        ? tasaIgv
        : null;
  const igv = tasa ? baseIgv.multiplicar(tasa).redondear(2) : Decimal.CERO;
  // Una línea gravada con IGV 0.00 se rechaza con 3111 (base > 0 e IGV = 0).
  if (tasa && igv.esCero())
    throw new RangeError(`Ítem ${n}: el IGV de una línea gravada redondea a 0.00`);

  let icbper: LineaCalculada['icbper'] = null;
  if (item.icbper) {
    const tarifa = Decimal.de(item.icbper.tarifa ?? TARIFA_ICBPER);
    icbper = { bolsas: cantidad, tarifa, monto: cantidad.multiplicar(tarifa).redondear(2) };
  }

  const impuestos = igv.sumar(isc?.monto ?? 0).sumar(icbper?.monto ?? 0);
  // Precio unitario con impuestos tal como lo recalcula SUNAT en la regla 4287:
  // (valor de venta + impuestos de la línea) / cantidad. En las gratuitas, el valor referencial.
  const precioUnitario = gratuita ? valorUnitario : valorVenta.sumar(impuestos).dividir(cantidad);
  return {
    numero,
    item,
    cantidad,
    valorUnitario: gratuita ? Decimal.CERO : valorUnitario,
    precioUnitario,
    tipoPrecio: gratuita ? '02' : '01',
    descuento,
    valorVenta,
    isc,
    baseIgv,
    igv,
    porcentajeIgv: tasa ? tasa.multiplicar(100).aTextoCompacto() : '0',
    icbper,
    tributo: gratuita ? '9996' : tributoDeAfectacion(item.afectacion),
    gratuita,
    impuestos,
  };
}

function ajuste(a: { monto?: unknown; factor?: unknown }, base: Decimal, que: string) {
  let monto: Decimal;
  let factor: Decimal;
  if (a.monto !== undefined) {
    monto = Decimal.de(a.monto as string);
    factor = monto.dividir(base).redondear(5);
  } else if (a.factor !== undefined) {
    factor = Decimal.de(a.factor as string);
    monto = base.multiplicar(factor).redondear(2);
  } else throw new RangeError(`${que} exige monto o factor`);
  positivo(monto, que);
  if (monto.comparar(base) >= 0) throw new RangeError(`${que} debe ser menor que su base`);
  return { monto, factor, base };
}

/**
 * Calcula líneas y totales. El IGV de cabecera es la suma de los IGV de línea (no la tasa sobre la
 * suma de bases): así lo recalcula la regla 3291 del XSL oficial, con tolerancia de ±1.
 */
export function calcular<C extends Comprobante>(comprobante: C): ComprobanteCalculado<C> {
  if (comprobante.items.length === 0)
    throw new RangeError('El comprobante debe tener al menos un ítem');
  const tasaIgv = TASAS_IGV[comprobante.tasaIgv ?? '18'];
  const lineas = comprobante.items.map((item, i) => calcularLinea(item, i + 1, tasaIgv));
  const onerosas = lineas.filter((l) => !l.gratuita);
  const suma = (ls: LineaCalculada[], f: (l: LineaCalculada) => Decimal | undefined) =>
    Decimal.sumarTodos(ls.map((l) => f(l) ?? Decimal.CERO));

  // Descuento global que afecta la base (02): solo con ítems onerosos gravados, para que su efecto
  // sobre el IGV no dependa de cómo se reparte entre afectaciones.
  let descuentoGlobal: Totales['descuentoGlobal'] = null;
  const gravadas = onerosas.filter((l) => l.tributo === '1000');
  if (comprobante.descuentoGlobal) {
    if (gravadas.length === 0 || gravadas.length !== onerosas.length)
      throw new RangeError(
        'El descuento global (02) solo se admite cuando todos los ítems onerosos son gravados',
      );
    descuentoGlobal = ajuste(
      comprobante.descuentoGlobal,
      suma(gravadas, (l) => l.baseIgv),
      'El descuento global',
    );
  }

  // Anticipos (factura): el descuento global 04 reduce la base del IGV de cabecera (regla 3291),
  // pero el precio de venta se calcula sin esa deducción (regla 3279) y el importe a pagar resta lo
  // ya pagado (PrepaidAmount, regla 4312).
  // Se estrecha sobre la unión (no sobre el genérico C) para que TypeScript vea los campos de Factura.
  const doc: Comprobante = comprobante;
  const factura = doc.tipo === '01' ? doc : null;
  const anticipos = Decimal.sumarTodos((factura?.anticipos ?? []).map((a) => Decimal.de(a.monto)));
  let anticipo: Totales['anticipo'] = null;
  if (!anticipos.esCero()) {
    if (gravadas.length === 0 || gravadas.length !== onerosas.length)
      throw new RangeError(
        'La deducción de anticipos solo se admite cuando todos los ítems onerosos son gravados',
      );
    const base = anticipos.dividir(Decimal.de(1).sumar(tasaIgv)).redondear(2);
    anticipo = { base, igv: anticipos.restar(base) };
  }

  const porTributo: TotalPorTributo[] = [];
  for (const tributo of ORDEN_TRIBUTOS) {
    const ls = lineas.filter((l) =>
      tributo === '2000' ? l.isc : tributo === '7152' ? l.icbper : l.tributo === tributo,
    );
    if (ls.length === 0) continue;
    let base: Decimal;
    let monto: Decimal;
    if (tributo === '2000') {
      base = suma(ls, (l) => l.isc?.base);
      monto = suma(ls, (l) => l.isc?.monto);
    } else if (tributo === '7152') {
      base = Decimal.CERO;
      monto = suma(ls, (l) => l.icbper?.monto);
    } else {
      // La base de cabecera es la suma de valores de venta, sin el ISC (regla 4299), aunque la
      // base de cada línea sí lo incluya (regla 3291 sobre las bases de línea).
      base = suma(ls, (l) => (tributo === '9996' ? l.baseIgv : l.valorVenta));
      monto = suma(ls, (l) => l.igv);
      if (tributo === '1000') {
        for (const d of [descuentoGlobal?.monto, anticipo?.base]) {
          if (!d) continue;
          base = base.restar(d);
          monto = monto.restar(d.multiplicar(tasaIgv).redondear(2));
        }
        if (base.comparar(0) < 0) throw new RangeError('Los anticipos superan el valor de venta');
      }
    }
    porTributo.push({ tributo, base, monto });
  }
  const monto = (t: Tributo) => porTributo.find((p) => p.tributo === t)?.monto ?? Decimal.CERO;

  const valorVenta = suma(onerosas, (l) => l.valorVenta).restar(descuentoGlobal?.monto ?? 0);
  const igv = monto('1000');
  const ivap = monto('1016');
  const isc = monto('2000');
  const icbper = monto('7152');
  const impuestos = igv.sumar(ivap).sumar(isc).sumar(icbper);
  // El precio de venta no descuenta el anticipo: se suma de vuelta el IGV deducido.
  const precioVenta = valorVenta
    .sumar(impuestos)
    .sumar(anticipo ? anticipo.base.multiplicar(tasaIgv).redondear(2) : 0);
  const descuentos = Decimal.de(comprobante.descuentoNoAfecto ?? 0);
  const cargos = Decimal.de(comprobante.cargo ?? 0);
  const importeTotal = precioVenta.restar(descuentos).sumar(cargos).restar(anticipos);
  if (importeTotal.comparar(0) < 0) throw new RangeError('El importe total no puede ser negativo');

  let detraccion: Totales['detraccion'] = null;
  if (factura?.detraccion) {
    if (comprobante.moneda !== 'PEN')
      throw new RangeError('La detracción se calcula en soles: emita la factura en PEN');
    const fila = (catalogo54 as Record<string, { tasa?: string }>)[factura.detraccion.codigoBien];
    if (!fila)
      throw new RangeError(
        `Código de bien o servicio sujeto a detracción desconocido: ${factura.detraccion.codigoBien}`,
      );
    const porcentaje = Decimal.de(factura.detraccion.porcentaje ?? fila.tasa ?? 0);
    detraccion = {
      porcentaje,
      monto: importeTotal.multiplicar(porcentaje).dividir(100).redondear(2),
    };
  }

  let percepcion: Totales['percepcion'] = null;
  if (factura?.percepcion) {
    if (comprobante.moneda !== 'PEN')
      throw new RangeError('La percepción se calcula en soles: emita la factura en PEN');
    const tasa = TASAS_PERCEPCION[factura.percepcion.regimen];
    const m = importeTotal.multiplicar(tasa).redondear(2);
    percepcion = { base: importeTotal, tasa, monto: m, total: importeTotal.sumar(m) };
  }

  return {
    comprobante,
    lineas,
    totales: {
      valorVenta,
      igv,
      ivap,
      isc,
      icbper,
      impuestos,
      precioVenta,
      descuentoGlobal,
      descuentos,
      cargos,
      anticipos,
      anticipo,
      importeTotal,
      porTributo,
      detraccion,
      percepcion,
    },
  };
}
