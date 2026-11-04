import { describe, expect, test } from 'vitest';
import { calcular } from '../src/calculos.js';
import type { Comprobante } from '../src/modelo.js';
import { validarXml, type Veredicto } from '../src/validador/index.js';
import { generarXml, nombreArchivo } from '../src/xml.js';
import { boleta, factura, notaCredito, notaDebito } from './fixtures.js';
import { MUTACIONES, mutar } from './mutaciones.js';
import { consultarOraculo, oraculoDisponible, type VeredictoOficial } from './oraculo.js';

const BASE: Record<string, () => Comprobante> = {
  factura,
  boleta,
  'nota de crédito': notaCredito,
  'nota de débito': notaDebito,
};

/** Veredicto de Chasqui en el formato del oráculo. */
export function comoOficial(v: Veredicto): VeredictoOficial {
  return {
    estado: v.estado === 'rechazado' ? 'rechazo' : 'ok',
    codigo: v.error?.codigo ?? null,
    observaciones: v.observaciones.map((o) => o.codigo),
  };
}

describe.runIf(oraculoDisponible)('conformidad con las reglas XSL oficiales de SUNAT', () => {
  test.each(Object.entries(BASE))('%s generada pasa sin errores ni observaciones', (_, crear) => {
    const c = crear();
    const xml = generarXml(calcular(c));
    const nombre = `${nombreArchivo(c)}.xml`;
    const [oficial] = consultarOraculo([{ tipo: c.tipo, nombre, xml }]);
    expect(oficial).toEqual({ estado: 'ok', codigo: null, observaciones: [] });
    expect(comoOficial(validarXml(xml, nombre))).toEqual(oficial);
  });

  // Prueba diferencial: cada mutación sobre cada tipo da el MISMO veredicto que la regla oficial.
  const casos = Object.entries(BASE).flatMap(([tipoNombre, crear]) => {
    const c = crear();
    return MUTACIONES.filter((m) => !m.tipos || m.tipos.includes(c.tipo)).map((m) => {
      const base = generarXml(calcular(c));
      const nombre = `${m.nombreArchivo ? m.nombreArchivo(nombreArchivo(c)) : nombreArchivo(c)}.xml`;
      const xml = m.aplicar ? mutar(base, m.aplicar) : base;
      return { titulo: `${tipoNombre}: ${m.nombre}`, tipo: c.tipo, nombre, xml };
    });
  });

  test('cada mutación dirigida da el mismo veredicto que el XSL oficial', () => {
    const oficiales = consultarOraculo(
      casos.map(({ tipo, nombre, xml }) => ({ tipo, nombre, xml })),
    );
    const diferencias = casos
      .map((c, i) => ({
        caso: c.titulo,
        oficial: oficiales[i],
        chasqui: comoOficial(validarXml(c.xml, c.nombre)),
      }))
      .filter((d) => JSON.stringify(d.oficial) !== JSON.stringify(d.chasqui));
    expect(diferencias).toEqual([]);
    // Las mutaciones tienen que ejercitar de verdad las reglas: casi todas deben rechazar.
    expect(oficiales.filter((o) => o.estado === 'rechazo').length).toBeGreaterThan(
      casos.length * 0.8,
    );
  });
});
