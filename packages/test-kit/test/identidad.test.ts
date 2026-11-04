import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import {
  contribuyenteFicticio,
  digitoVerificadorRuc,
  dni,
  dniValido,
  personaFicticia,
  rucEmpresa,
  rucPersona,
  rucValido,
} from '../src/index.js';

describe('RUC', () => {
  test('dígito verificador con vectores públicos conocidos', () => {
    // RUC público de la propia SUNAT, usado solo como vector de prueba del algoritmo.
    expect(digitoVerificadorRuc('2013131295')).toBe(5);
    expect(rucValido('20131312955')).toBe(true);
    expect(rucValido('20131312954')).toBe(false);
    expect(rucValido('20000000001')).toBe(true);
    expect(rucValido('30000000001')).toBe(false);
    expect(rucValido('2000000000')).toBe(false);
    expect(() => digitoVerificadorRuc('123')).toThrow(RangeError);
  });

  test('los casos 10 → 0 y 11 → 1 del módulo 11', () => {
    const casos = Array.from({ length: 3000 }, (_, i) => `20${String(i).padStart(8, '0')}`);
    const restos = new Set(casos.map((b) => digitoVerificadorRuc(b)));
    expect(restos.has(0)).toBe(true);
    expect(restos.has(1)).toBe(true);
    for (const r of restos) expect(r).toBeLessThanOrEqual(9);
  });

  test('todo RUC generado es válido y cambiar un dígito lo invalida (property)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99_999_999 }),
        fc.integer({ min: 2, max: 9 }),
        (n, pos) => {
          const ruc = rucEmpresa(n);
          expect(rucValido(ruc)).toBe(true);
          expect(rucValido(rucPersona(dni(n)))).toBe(true);
          const d = Number(ruc[pos]);
          const alterado = `${ruc.slice(0, pos)}${String((d + 1) % 10)}${ruc.slice(pos + 1)}`;
          expect(rucValido(alterado)).toBe(false);
        },
      ),
      { seed: 20261104, numRuns: 400 },
    );
  });

  test('rucPersona rechaza DNI inválidos', () => {
    expect(() => rucPersona('123')).toThrow(RangeError);
    expect(dniValido('12345678')).toBe(true);
    expect(dniValido('1234567')).toBe(false);
  });
});

describe('identidades ficticias', () => {
  test('son deterministas', () => {
    expect(personaFicticia('00000001')).toEqual(personaFicticia('00000001'));
    expect(contribuyenteFicticio(rucEmpresa(7))).toEqual(contribuyenteFicticio(rucEmpresa(7)));
  });

  test('la razón social de una persona natural sale de su DNI', () => {
    const p = personaFicticia('12345678');
    expect(contribuyenteFicticio(rucPersona('12345678')).razonSocial).toBe(
      `${p.apellidoPaterno} ${p.apellidoMaterno} ${p.nombres}`,
    );
    expect(contribuyenteFicticio(rucEmpresa(1)).razonSocial).toMatch(
      /(S\.A\.C\.|S\.A\.|E\.I\.R\.L\.|S\.R\.L\.)$/,
    );
  });

  test('la distribución de estados se acerca a la documentada', () => {
    const muestra = Array.from({ length: 4000 }, (_, i) => contribuyenteFicticio(rucEmpresa(i)));
    const frac = (f: (c: (typeof muestra)[number]) => boolean) =>
      muestra.filter(f).length / muestra.length;
    expect(frac((c) => c.estado === 'ACTIVO' && c.condicion === 'HABIDO')).toBeCloseTo(0.8, 1);
    expect(frac((c) => c.condicion === 'NO HABIDO')).toBeCloseTo(0.08, 1);
    expect(frac((c) => c.estado !== 'ACTIVO')).toBeCloseTo(0.12, 1);
  });
});
