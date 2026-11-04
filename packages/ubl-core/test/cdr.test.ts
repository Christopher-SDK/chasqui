import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { empaquetarCdr, generarCdr, leerCdr, RUC_SIMULADOR } from '../src/cdr.js';
import { verificarFirma } from '../src/firma.js';

const datos = {
  nombre: '20000000001-01-F001-1',
  serieNumero: 'F001-1',
  rucEmisor: '20000000001',
  receptor: '6-20000000002',
  codigo: '0',
  descripcion: 'La Factura numero F001-1, ha sido aceptada',
  observaciones: [{ codigo: '4309', mensaje: 'El importe & total <difiere>' }],
  fecha: '2026-11-03',
  hora: '10:00:05',
  id: '1',
};

describe('CDR', () => {
  test('se firma con el certificado del simulador y se puede leer', () => {
    const xml = generarCdr(datos);
    expect(verificarFirma(xml).valida).toBe(true);
    expect(xml).toContain(`<cbc:ID>${RUC_SIMULADOR}</cbc:ID>`);
    expect(xml).not.toMatch(/20131312955/); // nunca el RUC real de SUNAT
    const leido = leerCdr(empaquetarCdr(datos.nombre, xml));
    expect(leido).toMatchObject({
      codigo: '0',
      aceptado: true,
      serieNumero: 'F001-1',
      observaciones: [{ codigo: '4309', mensaje: 'El importe & total <difiere>' }],
    });
  });

  test('un rechazo lleva el código en ResponseCode', () => {
    const leido = leerCdr(
      generarCdr({ ...datos, codigo: '2074', descripcion: 'UBLVersionID', observaciones: [] }),
    );
    expect(leido).toMatchObject({ codigo: '2074', aceptado: false, observaciones: [] });
  });

  test('lee un CDR real con la misma estructura (ejemplo de Greenter)', () => {
    const real = readFileSync(
      new URL('./recursos/cdr-real-observaciones.xml', import.meta.url),
      'latin1',
    );
    expect(leerCdr(real)).toMatchObject({
      codigo: '0',
      serieNumero: 'F001-1',
      observaciones: [
        { codigo: '4031', mensaje: 'Debe indicar el nombre comercial' },
        { codigo: '4001' },
      ],
    });
  });
});
