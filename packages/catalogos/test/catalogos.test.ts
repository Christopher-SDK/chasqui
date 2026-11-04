import { describe, expect, test } from 'vitest';
import {
  catalogo02,
  catalogo05,
  catalogo07,
  enCatalogo,
  mensajeError,
  tributoDeAfectacion,
  tributosDeAfectacion,
  type AfectacionIgv,
} from '../src/index.js';

describe('catálogos oficiales', () => {
  test('contienen códigos conocidos del Anexo 8', () => {
    expect(enCatalogo('01', '01')).toBe(true);
    expect(enCatalogo('02', 'PEN')).toBe(true);
    expect(enCatalogo('03', 'NIU')).toBe(true);
    expect(enCatalogo('06', '6')).toBe(true);
    expect(enCatalogo('07', '10')).toBe(true);
    expect(enCatalogo('51', '0101')).toBe(true);
  });

  test('rechazan códigos inexistentes y claves heredadas del prototipo', () => {
    expect(enCatalogo('02', 'ZZZ')).toBe(false);
    // XXX sí existe: es el código ISO 4217 «sin moneda» y está en el catálogo oficial.
    expect(enCatalogo('02', 'XXX')).toBe(true);
    expect(enCatalogo('07', '99')).toBe(false);
    expect(enCatalogo('01', 'toString')).toBe(false);
  });

  test('conservan atributos del XML oficial', () => {
    expect(catalogo05['1000']).toMatchObject({ name: 'IGV', UN_ECE_5153: 'VAT' });
    expect(catalogo07['10']).toMatchObject({ igv: '1' });
    expect(catalogo02.PEN.nombre).toMatch(/Sol/i);
  });
});

describe('mensajeError', () => {
  test('devuelve el mensaje oficial', () => {
    expect(mensajeError('2074')).toMatch(/UBLVersionID/);
  });
  test('avisa cuando el código no existe', () => {
    expect(mensajeError('0000')).toMatch(/no registrado/);
  });
});

describe('tributoDeAfectacion', () => {
  const casos: [AfectacionIgv, string][] = [
    ['10', '1000'],
    ['11', '9996'],
    ['17', '1016'],
    ['20', '9997'],
    ['21', '9996'],
    ['30', '9998'],
    ['31', '9996'],
    ['40', '9995'],
  ];
  test.each(casos)('afectación %s → tributo %s', (afectacion, tributo) => {
    expect(tributoDeAfectacion(afectacion)).toBe(tributo);
  });
  test('17 y 40 admiten también el tributo de gratuitas', () => {
    expect(tributosDeAfectacion('17')).toEqual(['1016', '9996']);
    expect(tributosDeAfectacion('40')).toEqual(['9995', '9996']);
  });
  test('todas las afectaciones del catálogo 07 mapean a un tributo del catálogo 05', () => {
    for (const a of Object.keys(catalogo07) as AfectacionIgv[]) {
      expect(enCatalogo('05', tributoDeAfectacion(a))).toBe(true);
    }
  });
});
