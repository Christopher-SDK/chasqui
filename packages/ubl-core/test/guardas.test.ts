import { describe, expect, test } from 'vitest';
import { calcular } from '../src/calculos.js';
import type { Comprobante, Factura, Item } from '../src/modelo.js';
import { factura } from './fixtures.js';

// Entradas inválidas de las operaciones especiales: calcular() debe fallar con un mensaje claro
// antes de generar un XML que SUNAT rechazaría. Datos ficticios.

const item = (extra: Partial<Item> = {}): Item => ({
  descripcion: 'Producto',
  cantidad: 2,
  unidad: 'NIU',
  valorUnitario: '50.00',
  afectacion: '10',
  ...extra,
});
const con = (items: Item[], extra: Partial<Factura> = {}): Comprobante => ({
  ...factura(),
  items,
  ...extra,
});

describe('calcular rechaza operaciones especiales mal armadas', () => {
  test.each<[string, Comprobante, RegExp]>([
    [
      'ISC en un ítem exonerado',
      con([item({ afectacion: '20', isc: { sistema: '01', tasa: '0.1' } })]),
      /solo aplica a ítems gravados/,
    ],
    ['ISC específico sin monto fijo', con([item({ isc: { sistema: '02' } })]), /exige montoFijo/],
    ['ISC al valor sin tasa', con([item({ isc: { sistema: '01' } })]), /exige tasa/],
    [
      'ISC 03 sin precio sugerido',
      con([item({ isc: { sistema: '03', tasa: '0.3' } })]),
      /exige precioSugerido/,
    ],
    [
      'ISC que redondea a 0',
      con([item({ isc: { sistema: '01', tasa: '0.00001' } })]),
      /el ISC debe ser mayor que 0/,
    ],
    [
      'descuento en una gratuita',
      con([item({ afectacion: '13', descuento: { monto: '1' } })]),
      /gratuita no lleva descuento/,
    ],
    ['descuento sin monto ni factor', con([item({ descuento: {} })]), /exige monto o factor/],
    [
      'descuento igual a la base',
      con([item({ descuento: { monto: '100' } })]),
      /menor que su base/,
    ],
    [
      'descuento global con un ítem exonerado',
      con([item(), item({ afectacion: '20' })], { descuentoGlobal: { monto: '1' } }),
      /todos los ítems onerosos son gravados/,
    ],
    [
      'anticipo con un ítem exonerado',
      con([item(), item({ afectacion: '20' })], {
        anticipos: [{ tipoDocumento: '02', serieNumero: 'F001-1', monto: '10' }],
      }),
      /anticipos solo se admite/,
    ],
    [
      'anticipo mayor que la venta',
      con([item()], { anticipos: [{ tipoDocumento: '02', serieNumero: 'F001-1', monto: '500' }] }),
      /superan el valor de venta|no puede ser negativo/,
    ],
    [
      'descuento no afecto mayor que el total',
      con([item()], { descuentoNoAfecto: '1000' }),
      /no puede ser negativo/,
    ],
    [
      'detracción en dólares',
      con([item()], {
        moneda: 'USD',
        detraccion: { codigoBien: '020', cuentaBancoNacion: '00-1' },
      }),
      /detracción se calcula en soles/,
    ],
    [
      'detracción con código inexistente',
      con([item()], { detraccion: { codigoBien: '999', cuentaBancoNacion: '00-1' } }),
      /desconocido: 999/,
    ],
    [
      'percepción en dólares',
      con([item()], { moneda: 'USD', percepcion: { regimen: '51' } }),
      /percepción se calcula en soles/,
    ],
  ])('%s', (_, c, error) => {
    expect(() => calcular(c)).toThrow(error);
  });

  test('la detracción con porcentaje explícito no usa la tasa del catálogo', () => {
    const r = calcular(
      con([item()], {
        detraccion: { codigoBien: '020', porcentaje: '4', cuentaBancoNacion: '00-1' },
      }),
    );
    expect(r.totales.detraccion?.monto.toString()).toBe('4.72');
  });
});
