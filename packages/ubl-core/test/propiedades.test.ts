import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { calcular } from '../src/calculos.js';
import { Decimal } from '../src/decimal.js';
import { firmar, verificarFirma } from '../src/firma.js';
import { emitir } from '../src/index.js';
import { validarXml } from '../src/validador/index.js';
import { generarXml, nombreArchivo } from '../src/xml.js';
import { desempaquetar } from '../src/zip.js';
import { SEMILLA, arbComprobante, arbItem } from './arbitrarios.js';
import { MUTACIONES, mutar } from './mutaciones.js';
import { comoOficial, consultarOraculo, oraculoDisponible } from './oraculo.js';

const opciones = { seed: SEMILLA, numRuns: 300 };

describe('invariantes de cálculo', () => {
  test('el total de valor de venta es la suma exacta de las líneas', () => {
    fc.assert(
      fc.property(arbComprobante, (c) => {
        const { lineas, totales } = calcular(c);
        expect(
          totales.valorVenta.comparar(Decimal.sumarTodos(lineas.map((l) => l.valorVenta))),
        ).toBe(0);
        expect(totales.igv.comparar(Decimal.sumarTodos(lineas.map((l) => l.igv)))).toBe(0);
        expect(totales.precioVenta.comparar(totales.valorVenta.sumar(totales.igv))).toBe(0);
        // Bases por tributo: particionan el valor de venta.
        expect(
          Decimal.sumarTodos(totales.porTributo.map((t) => t.base)).comparar(totales.valorVenta),
        ).toBe(0);
      }),
      opciones,
    );
  });

  test('el IGV de línea es el 18 % de la base, redondeado a céntimos (error ≤ 0.005)', () => {
    fc.assert(
      fc.property(arbItem, (item) => {
        const c = calcular({ ...base(), items: [item] });
        const [l] = c.lineas;
        if (!l) throw new Error('sin línea');
        const exacto = item.afectacion === '10' ? l.valorVenta.multiplicar('0.18') : Decimal.CERO;
        const error = l.igv.restar(exacto);
        expect(error.comparar('0.005')).toBeLessThanOrEqual(0);
        expect(error.comparar('-0.005')).toBeGreaterThanOrEqual(0);
        if (item.afectacion !== '10') expect(l.igv.esCero()).toBe(true);
      }),
      opciones,
    );
  });

  test('la suma de IGV de línea siempre cae dentro de la tolerancia de la regla 3291 (±1)', () => {
    fc.assert(
      fc.property(arbComprobante, (c) => {
        const { lineas, totales } = calcular(c);
        const base18 = Decimal.sumarTodos(
          lineas.filter((l) => l.tributo === '1000').map((l) => l.valorVenta),
        ).multiplicar('0.18');
        const diferencia = totales.igv.restar(base18);
        expect(diferencia.comparar(1)).toBeLessThanOrEqual(0);
        expect(diferencia.comparar(-1)).toBeGreaterThanOrEqual(0);
      }),
      opciones,
    );
  });
});

describe('roundtrip generar → firmar → empaquetar → desempaquetar → verificar → validar', () => {
  test('todo comprobante válido sobrevive el ciclo y queda aceptado', () => {
    fc.assert(
      fc.property(arbComprobante, (c) => {
        const { nombreZip, zip } = emitir(c);
        const abierto = desempaquetar(nombreZip, zip);
        if (!abierto.ok) throw new Error(abierto.detalle);
        expect(verificarFirma(abierto.xml).valida).toBe(true);
        expect(validarXml(abierto.xml, abierto.nombreXml)).toEqual({
          estado: 'aceptado',
          observaciones: [],
        });
      }),
      { ...opciones, numRuns: 100 },
    );
  });
});

describe.runIf(oraculoDisponible)('propiedades contra las reglas oficiales de SUNAT', () => {
  test('ninguna combinación válida es rechazada (ni por Chasqui ni por el XSL oficial)', () => {
    const muestras = fc.sample(arbComprobante, { seed: SEMILLA, numRuns: 200 });
    const casos = muestras.map((c) => ({
      tipo: c.tipo,
      nombre: `${nombreArchivo(c)}.xml`,
      xml: firmar(generarXml(calcular(c))),
    }));
    const oficiales = consultarOraculo(casos);
    casos.forEach((caso, i) => {
      expect(oficiales[i]).toEqual({ estado: 'ok', codigo: null, observaciones: [] });
      expect(comoOficial(validarXml(caso.xml, caso.nombre))).toEqual(oficiales[i]);
    });
  });

  test('ninguna inválida es aceptada: comprobantes y mutaciones aleatorias dan el veredicto oficial', () => {
    const arb = fc.tuple(arbComprobante, fc.constantFrom(...MUTACIONES));
    const muestras = fc
      .sample(arb, { seed: SEMILLA, numRuns: 600 })
      .filter(([c, m]) => !m.tipos || m.tipos.includes(c.tipo));
    const casos = muestras.map(([c, m]) => {
      const nombre = `${m.nombreArchivo ? m.nombreArchivo(nombreArchivo(c)) : nombreArchivo(c)}.xml`;
      const xml = generarXml(calcular(c));
      return {
        tipo: c.tipo,
        nombre,
        xml: m.aplicar ? mutar(xml, m.aplicar) : xml,
        mutacion: m.nombre,
      };
    });
    const oficiales = consultarOraculo(casos);
    const diferencias = casos
      .map((c, i) => ({
        mutacion: c.mutacion,
        nombre: c.nombre,
        oficial: oficiales[i],
        chasqui: comoOficial(validarXml(c.xml, c.nombre)),
      }))
      .filter((d) => JSON.stringify(d.oficial) !== JSON.stringify(d.chasqui));
    expect(diferencias).toEqual([]);
  });
});

function base() {
  return {
    tipo: '01' as const,
    serie: 'F001',
    correlativo: 1,
    fechaEmision: '2026-11-03',
    moneda: 'PEN' as const,
    emisor: {
      ruc: '20000000001',
      razonSocial: 'X S.A.C.',
      direccion: {
        ubigeo: '150101',
        departamento: 'LIMA',
        provincia: 'LIMA',
        distrito: 'LIMA',
        linea: 'AV 1',
      },
    },
    cliente: {
      tipoDocumento: '6' as const,
      numeroDocumento: '20000000002',
      nombre: 'CLIENTE S.A.',
    },
  };
}
