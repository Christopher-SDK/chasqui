import type { Comprobante, Item } from '../src/modelo.js';
import { boleta, factura, notaCredito, notaDebito } from './fixtures.js';

// Un comprobante por operación especial (Fase 10). Cada uno debe pasar las reglas oficiales sin
// errores ni observaciones: lo comprueba test/conformidad.test.ts contra el XSL de SUNAT.
// Datos ficticios.

const gravado = (descripcion: string, valorUnitario: string, extra: Partial<Item> = {}): Item => ({
  descripcion,
  cantidad: 1,
  unidad: 'NIU',
  valorUnitario,
  afectacion: '10',
  ...extra,
});

const conItems = <C extends Comprobante>(c: C, items: Item[], extra: Partial<C> = {}): C => ({
  ...c,
  items,
  ...extra,
});

export const OPERACIONES: { titulo: string; comprobante: Comprobante }[] = [
  {
    titulo: 'factura con retiro gravado gratuito (11) y una venta gravada',
    comprobante: conItems(factura(), [
      gravado('Producto vendido', '100.00'),
      gravado('Muestra de regalo', '20.00', { afectacion: '11', cantidad: 2 }),
    ]),
  },
  {
    titulo: 'boleta con transferencias gratuitas exonerada (21) e inafecta (31)',
    comprobante: conItems(boleta(), [
      gravado('Producto vendido', '50.00'),
      gravado('Libro de regalo', '30.00', { afectacion: '21' }),
      gravado('Folleto de regalo', '5.00', { afectacion: '31' }),
    ]),
  },
  {
    titulo: 'factura con ISC al valor (01)',
    comprobante: conItems(factura(), [
      gravado('Bebida alcohólica ficticia', '40.00', {
        cantidad: 3,
        isc: { sistema: '01', tasa: '0.25' },
      }),
    ]),
  },
  {
    titulo: 'factura con ISC específico (02)',
    comprobante: conItems(factura(), [
      gravado('Combustible ficticio', '12.50', {
        cantidad: 10,
        unidad: 'GLL',
        isc: { sistema: '02', montoFijo: '1.20' },
      }),
    ]),
  },
  {
    titulo: 'factura con ISC por precio de venta al público (03)',
    comprobante: conItems(factura(), [
      gravado('Cigarrillos ficticios', '8.00', {
        cantidad: 5,
        isc: { sistema: '03', tasa: '0.30', precioSugerido: '12.00' },
      }),
    ]),
  },
  {
    titulo: 'boleta con ICBPER (bolsas de plástico)',
    comprobante: conItems(boleta(), [
      gravado('Abarrotes', '25.00'),
      gravado('Bolsa de plástico', '0.10', { cantidad: 3, icbper: {} }),
    ]),
  },
  {
    titulo: 'factura de exportación (0200)',
    comprobante: conItems(
      factura(),
      [gravado('Café exportado', '1500.00', { afectacion: '40', cantidad: 2, unidad: 'KGM' })],
      {
        moneda: 'USD',
        cliente: {
          tipoDocumento: '0',
          numeroDocumento: 'EXT12345',
          nombre: 'IMPORTADORA FICTICIA LLC',
        },
      },
    ),
  },
  {
    titulo: 'factura con IVAP (17)',
    comprobante: conItems(factura(), [
      gravado('Arroz pilado', '150.00', { afectacion: '17', cantidad: 4, unidad: 'KGM' }),
    ]),
  },
  {
    titulo: 'factura con descuento por ítem (00)',
    comprobante: conItems(factura(), [
      gravado('Laptop ficticia', '2000.00', { descuento: { factor: '0.10' } }),
      gravado('Mouse ficticio', '50.00', { descuento: { monto: '5.00' } }),
    ]),
  },
  {
    titulo: 'factura con descuento global que afecta la base (02)',
    comprobante: conItems(factura(), [gravado('Servicio de consultoría', '1000.00')], {
      descuentoGlobal: { monto: '100.00' },
    }),
  },
  {
    titulo: 'boleta con descuento que no afecta la base (03) y otros cargos (50)',
    comprobante: conItems(boleta(), [gravado('Menú del día', '30.00', { cantidad: 2 })], {
      descuentoNoAfecto: '5.00',
      cargo: '3.00',
    }),
  },
  {
    titulo: 'factura con detracción (1001)',
    comprobante: conItems(factura(), [gravado('Servicio de mantenimiento', '2000.00')], {
      detraccion: { codigoBien: '020', cuentaBancoNacion: '00-000-000001' },
    }),
  },
  {
    titulo: 'factura con percepción (2001)',
    comprobante: conItems(factura(), [gravado('Mercadería sujeta a percepción', '1000.00')], {
      percepcion: { regimen: '51' },
    }),
  },
  {
    titulo: 'factura con deducción de anticipo',
    comprobante: conItems(factura(), [gravado('Saldo del proyecto', '5000.00')], {
      anticipos: [{ tipoDocumento: '02', serieNumero: 'F001-10', monto: '1180.00' }],
    }),
  },
  {
    titulo: 'factura al crédito en dos cuotas',
    comprobante: conItems(factura(), [gravado('Equipo ficticio', '1000.00')], {
      formaPago: {
        tipo: 'Credito',
        cuotas: [
          { monto: '590.00', fechaPago: '2026-12-03' },
          { monto: '590.00', fechaPago: '2027-01-03' },
        ],
      },
    }),
  },
  {
    titulo: 'boleta con IGV del 10 % (Ley 31556)',
    comprobante: conItems(boleta(), [gravado('Almuerzo', '20.00', { cantidad: 2 })], {
      tasaIgv: '10',
    }),
  },
  {
    titulo: 'nota de crédito con ISC e ICBPER',
    comprobante: conItems(notaCredito(), [
      gravado('Bebida alcohólica ficticia', '40.00', { isc: { sistema: '01', tasa: '0.25' } }),
      gravado('Bolsa de plástico', '0.10', { icbper: {} }),
    ]),
  },
  {
    titulo: 'nota de débito con descuento por ítem',
    comprobante: conItems(notaDebito(), [
      gravado('Intereses ficticios', '100.00', { descuento: { monto: '10.00' } }),
    ]),
  },
];
