import fc from 'fast-check';
import { Decimal } from '../src/decimal.js';
import type { AfectacionSoportada, Cliente, Comprobante, Item } from '../src/modelo.js';
import { emisor } from './fixtures.js';

/** Semilla fija: los casos aleatorios son los mismos en cada corrida (cero flakiness). */
export const SEMILLA = 20261103;

const decimalTexto = (maxEntero: number, decimales: number, min = 0) =>
  fc
    .integer({ min: Math.max(min, 0), max: maxEntero * 10 ** decimales })
    .filter((n) => n >= min)
    .map((n) => (n / 10 ** decimales).toFixed(decimales));

export const arbItem: fc.Arbitrary<Item> = fc
  .record({
    descripcion: fc.constantFrom(
      'Producto de prueba',
      'Servicio ficticio',
      'Artículo demo',
      'Insumo & accesorio <x>',
    ),
    cantidad: decimalTexto(500, 3, 1),
    unidad: fc.constantFrom('NIU', 'ZZ', 'KGM', 'LTR'),
    valorUnitario: decimalTexto(5000, 4),
    afectacion: fc.constantFrom<AfectacionSoportada>('10', '20', '30'),
  })
  .filter((i) => {
    // Fuera de dominio (el generador las rechaza): valor de venta 0.00 o IGV gravado 0.00.
    const vv = Decimal.de(i.cantidad).multiplicar(i.valorUnitario).redondear(2);
    return !vv.esCero() && (i.afectacion !== '10' || !vv.multiplicar('0.18').redondear(2).esCero());
  });

const arbItems = fc.array(arbItem, { minLength: 1, maxLength: 6 });
const arbMoneda = fc.constantFrom('PEN' as const, 'USD' as const);
const arbCorrelativo = fc.integer({ min: 1, max: 99_999_999 });

const clienteRuc: Cliente = {
  tipoDocumento: '6',
  numeroDocumento: '20000000002',
  nombre: 'CLIENTE DEMO S.A.',
};
const arbClienteBoleta = fc.constantFrom<Cliente>(
  { tipoDocumento: '1', numeroDocumento: '00000001', nombre: 'CLIENTE FICTICIO' },
  { tipoDocumento: '6', numeroDocumento: '20000000002', nombre: 'CLIENTE DEMO S.A.' },
  { tipoDocumento: '0', numeroDocumento: '-', nombre: 'CLIENTES VARIOS' },
);

const base = { fechaEmision: '2026-11-03', horaEmision: '10:00:00', emisor };

export const arbComprobante: fc.Arbitrary<Comprobante> = fc.oneof(
  fc
    .record({
      tipo: fc.constant('01' as const),
      serie: fc.constantFrom('F001', 'F002', 'FA01'),
      correlativo: arbCorrelativo,
      moneda: arbMoneda,
      items: arbItems,
    })
    .map((r) => ({ ...base, ...r, cliente: clienteRuc })),
  fc
    .record({
      tipo: fc.constant('03' as const),
      serie: fc.constantFrom('B001', 'B002'),
      correlativo: arbCorrelativo,
      moneda: arbMoneda,
      items: arbItems,
      cliente: arbClienteBoleta,
    })
    .map((r) => ({ ...base, ...r })),
  fc
    .record({
      tipo: fc.constant('07' as const),
      correlativo: arbCorrelativo,
      moneda: arbMoneda,
      items: arbItems,
      motivo: fc.constantFrom('01' as const, '06' as const, '07' as const),
    })
    .map((r) => ({
      ...base,
      ...r,
      serie: 'F001',
      cliente: clienteRuc,
      sustento: 'Devolución de mercadería',
      referencia: { tipo: '01' as const, serieNumero: 'F001-1' },
    })),
  fc
    .record({
      tipo: fc.constant('08' as const),
      correlativo: arbCorrelativo,
      moneda: arbMoneda,
      items: arbItems,
      motivo: fc.constantFrom('01' as const, '02' as const),
    })
    .map((r) => ({
      ...base,
      ...r,
      serie: 'F001',
      cliente: clienteRuc,
      sustento: 'Intereses por mora',
      referencia: { tipo: '01' as const, serieNumero: 'F001-1' },
    })),
);
