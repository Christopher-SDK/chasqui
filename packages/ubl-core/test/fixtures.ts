import type { Boleta, Emisor, Factura, NotaCredito, NotaDebito } from '../src/modelo.js';

// Datos ficticios. El RUC 20000000001 no corresponde a ningún contribuyente real.
export const emisor: Emisor = {
  ruc: '20000000001',
  razonSocial: 'COMERCIAL CHASQUI DEMO S.A.C.',
  nombreComercial: 'Chasqui Demo',
  direccion: {
    ubigeo: '150101',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LIMA',
    linea: 'AV. FICTICIA 123',
  },
};

export const factura = (): Factura => ({
  tipo: '01',
  serie: 'F001',
  correlativo: 1,
  fechaEmision: '2026-11-03',
  horaEmision: '10:00:00',
  moneda: 'PEN',
  emisor,
  cliente: { tipoDocumento: '6', numeroDocumento: '20000000002', nombre: 'CLIENTE DEMO S.A.' },
  items: [
    {
      descripcion: 'Producto gravado',
      cantidad: 2,
      unidad: 'NIU',
      valorUnitario: '50.00',
      afectacion: '10',
      codigo: 'P001',
    },
    {
      descripcion: 'Servicio exonerado',
      cantidad: 1,
      unidad: 'ZZ',
      valorUnitario: '30.00',
      afectacion: '20',
    },
  ],
});

export const boleta = (): Boleta => ({
  ...factura(),
  tipo: '03',
  serie: 'B001',
  cliente: { tipoDocumento: '1', numeroDocumento: '00000001', nombre: 'CLIENTE FICTICIO' },
});

export const notaCredito = (): NotaCredito => ({
  ...factura(),
  tipo: '07',
  serie: 'F001',
  correlativo: 2,
  motivo: '01',
  sustento: 'Anulación de la operación',
  referencia: { tipo: '01', serieNumero: 'F001-1' },
});

export const notaDebito = (): NotaDebito => ({
  ...factura(),
  tipo: '08',
  serie: 'F001',
  correlativo: 3,
  motivo: '01',
  sustento: 'Intereses por mora',
  referencia: { tipo: '01', serieNumero: 'F001-1' },
});
