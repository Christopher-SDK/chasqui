import { describe, expect, test } from 'vitest';
import { calcular } from '../src/calculos.js';
import type { Comprobante } from '../src/modelo.js';
import { validarXml } from '../src/validador/index.js';
import { generarXml, nombreArchivo } from '../src/xml.js';
import { boleta, factura, notaCredito, notaDebito } from './fixtures.js';
import { MUTACIONES, MUTACIONES_BORDE, mutar } from './mutaciones.js';
import { comoOficial, consultarOraculo, oraculoDisponible } from './oraculo.js';

const BASE: Record<string, () => Comprobante> = {
  factura,
  boleta,
  'nota de crédito': notaCredito,
  'nota de débito': notaDebito,
};

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
    return [...MUTACIONES, ...MUTACIONES_BORDE]
      .filter((m) => !m.tipos || m.tipos.includes(c.tipo))
      .map((m) => {
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
    // Las mutaciones tienen que ejercitar de verdad las reglas: la mayoría debe rechazar.
    expect(oficiales.filter((o) => o.estado === 'rechazo').length).toBeGreaterThan(
      casos.length * 0.6,
    );
  });

  // Contrato del validador: cada hallazgo cita la regla oficial (archivo y línea) de donde sale.
  // Las líneas se verificaron contra el XSL al portarlas; la instantánea impide que se pierdan.
  test('cada hallazgo cita su regla de origen en el XSL oficial', async () => {
    const citas = Object.fromEntries(
      casos.map((c) => {
        const v = validarXml(c.xml, c.nombre);
        const fmt = (h: { codigo: string; fuente: string }) => `${h.codigo} @ ${h.fuente}`;
        return [c.titulo, [...v.observaciones.map(fmt), ...(v.error ? [fmt(v.error)] : [])]];
      }),
    );
    await expect(JSON.stringify(citas, null, 2)).toMatchFileSnapshot('__snapshots__/citas.json');
  });
});
