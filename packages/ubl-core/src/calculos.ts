import { tributoDeAfectacion, type Tributo } from '@chasqui/catalogos';
import { Decimal } from './decimal.js';
import type { AfectacionSoportada, Comprobante, Item } from './modelo.js';

/**
 * Tasa del IGV: 16 % de IGV más 2 % de Impuesto de Promoción Municipal (TUO de la Ley del IGV,
 * art. 17, y D. Leg. 776). Fuente: docs/fuentes.md §3.
 */
export const TASA_IGV = Decimal.de('0.18');
export const PORCENTAJE_IGV = '18';

export interface LineaCalculada {
  numero: number;
  item: Item;
  cantidad: Decimal;
  valorUnitario: Decimal;
  /** Precio unitario CON impuestos (catálogo 16, tipo 01). */
  precioUnitario: Decimal;
  /** cantidad × valor unitario, a 2 decimales. Es la base imponible de la línea. */
  valorVenta: Decimal;
  igv: Decimal;
  tributo: Tributo;
}

export interface TotalPorTributo {
  tributo: Tributo;
  base: Decimal;
  monto: Decimal;
}

export interface Totales {
  /** Suma de valores de venta (sin impuestos). LegalMonetaryTotal/LineExtensionAmount. */
  valorVenta: Decimal;
  igv: Decimal;
  /** Valor de venta + impuestos. LegalMonetaryTotal/TaxInclusiveAmount. */
  precioVenta: Decimal;
  /** Importe total a pagar. LegalMonetaryTotal/PayableAmount. */
  importeTotal: Decimal;
  porTributo: TotalPorTributo[];
}

export interface ComprobanteCalculado<C extends Comprobante = Comprobante> {
  comprobante: C;
  lineas: LineaCalculada[];
  totales: Totales;
}

const ORDEN_TRIBUTOS: readonly Tributo[] = ['1000', '9997', '9998'];

export function calcularLinea(item: Item, numero: number): LineaCalculada {
  const cantidad = Decimal.de(item.cantidad);
  const valorUnitario = Decimal.de(item.valorUnitario);
  if (cantidad.comparar(0) <= 0)
    throw new RangeError(`Ítem ${String(numero)}: la cantidad debe ser mayor que 0`);
  if (valorUnitario.comparar(0) < 0)
    throw new RangeError(`Ítem ${String(numero)}: el valor unitario no puede ser negativo`);
  const gravado = esGravado(item.afectacion);
  const valorVenta = cantidad.multiplicar(valorUnitario).redondear(2);
  // Una venta onerosa con valor 0.00 es en realidad gratuita (no soportada) y la boleta la
  // rechaza con 3105 (ValidaExprRegBoleta-2.0.1.xsl L3812).
  if (valorVenta.esCero())
    throw new RangeError(`Ítem ${String(numero)}: el valor de venta redondea a 0.00`);
  const igv = gravado ? valorVenta.multiplicar(TASA_IGV).redondear(2) : Decimal.CERO;
  // Una línea gravada con IGV 0.00 se rechaza con 3111 (base > 0 e IGV = 0).
  if (gravado && igv.esCero())
    throw new RangeError(`Ítem ${String(numero)}: el IGV de una línea gravada redondea a 0.00`);
  // Precio unitario con impuestos tal como lo recalcula SUNAT en la regla 4287:
  // (valor de venta + impuestos de la línea) / cantidad.
  const precioUnitario = valorVenta.sumar(igv).dividir(cantidad);
  return {
    numero,
    item,
    cantidad,
    valorUnitario,
    precioUnitario,
    valorVenta,
    igv,
    tributo: tributoDeAfectacion(item.afectacion),
  };
}

/**
 * Calcula líneas y totales. El IGV de cabecera es la suma de los IGV de línea (no la tasa sobre la
 * suma de bases): así lo recalcula la regla 3291 del XSL oficial, con tolerancia de ±1.
 */
export function calcular<C extends Comprobante>(comprobante: C): ComprobanteCalculado<C> {
  if (comprobante.items.length === 0)
    throw new RangeError('El comprobante debe tener al menos un ítem');
  const lineas = comprobante.items.map((item, i) => calcularLinea(item, i + 1));
  const porTributo = ORDEN_TRIBUTOS.flatMap((tributo) => {
    const ls = lineas.filter((l) => l.tributo === tributo);
    if (ls.length === 0) return [];
    return [
      {
        tributo,
        base: Decimal.sumarTodos(ls.map((l) => l.valorVenta)),
        monto: Decimal.sumarTodos(ls.map((l) => l.igv)),
      },
    ];
  });
  const valorVenta = Decimal.sumarTodos(lineas.map((l) => l.valorVenta));
  const igv = Decimal.sumarTodos(lineas.map((l) => l.igv));
  const precioVenta = valorVenta.sumar(igv);
  return {
    comprobante,
    lineas,
    totales: { valorVenta, igv, precioVenta, importeTotal: precioVenta, porTributo },
  };
}

function esGravado(a: AfectacionSoportada): boolean {
  return a === '10';
}
