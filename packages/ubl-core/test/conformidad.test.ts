import { describe, expect, test } from 'vitest';
import { calcular } from '../src/calculos.js';
import type { Comprobante } from '../src/modelo.js';
import { validarComoOraculo as validarXml } from './oraculo.js';
import { generarXml, nombreArchivo } from '../src/xml.js';
import { boleta, factura, notaCredito, notaDebito } from './fixtures.js';
import { MUTACIONES, MUTACIONES_BORDE, MUTACIONES_ESPECIALES, mutar } from './mutaciones.js';
import { OPERACIONES } from './operaciones.js';
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

  // Operaciones especiales (Fase 10). Una sola excepción, que viene de la regla oficial: al crédito,
  // la 3249 se emite siempre, porque dentro de la plantilla de cac:PaymentTerms busca otro
  // cac:PaymentTerms como hijo (ValidaExprRegFactura-2.0.1.xsl, plantilla de L5542).
  test.each(OPERACIONES.map((o) => [o.titulo, o.comprobante] as const))(
    '%s: pasa las reglas oficiales',
    (titulo, c) => {
      const xml = generarXml(calcular(c));
      const nombre = `${nombreArchivo(c)}.xml`;
      const [oficial] = consultarOraculo([{ tipo: c.tipo, nombre, xml }]);
      const esperadas = titulo.includes('crédito en') ? ['3249'] : [];
      expect(oficial).toEqual({ estado: 'ok', codigo: null, observaciones: esperadas });
      expect(comoOficial(validarXml(xml, nombre))).toEqual(oficial);
    },
  );

  // Prueba diferencial: cada mutación sobre cada tipo da el MISMO veredicto que la regla oficial.
  // Las operaciones especiales reciben sus mutaciones y las generales.
  const especiales = OPERACIONES.flatMap(({ titulo, comprobante: c }) => {
    const base = generarXml(calcular(c));
    // Serializado sin cambios, para saber si una mutación tocó algo.
    const intacto = mutar(base, () => undefined);
    return [...MUTACIONES_ESPECIALES, ...MUTACIONES]
      .filter((m) => !m.tipos || m.tipos.includes(c.tipo))
      .map((m) => ({
        titulo: `${titulo}: ${m.nombre}`,
        mutacion: m.nombre,
        tipo: c.tipo,
        nombre: `${m.nombreArchivo ? m.nombreArchivo(nombreArchivo(c)) : nombreArchivo(c)}.xml`,
        intacto,
        xml: m.aplicar ? mutar(base, m.aplicar) : base,
      }));
  });
  const casos = Object.entries(BASE)
    .flatMap(([tipoNombre, crear]) => {
      const c = crear();
      return [...MUTACIONES, ...MUTACIONES_BORDE]
        .filter((m) => !m.tipos || m.tipos.includes(c.tipo))
        .map((m) => {
          const base = generarXml(calcular(c));
          const nombre = `${m.nombreArchivo ? m.nombreArchivo(nombreArchivo(c)) : nombreArchivo(c)}.xml`;
          const xml = m.aplicar ? mutar(base, m.aplicar) : base;
          return { titulo: `${tipoNombre}: ${m.nombre}`, tipo: c.tipo, nombre, xml };
        });
    })
    .concat(especiales);

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
    // Las mutaciones tienen que ejercitar de verdad las reglas: la mayoría de las generales debe
    // rechazar, y ninguna mutación especial puede quedar sin efecto en todas las operaciones.
    const generales = oficiales.slice(0, casos.length - especiales.length);
    expect(generales.filter((o) => o.estado === 'rechazo').length).toBeGreaterThan(
      generales.length * 0.6,
    );
    const sinEfecto = MUTACIONES_ESPECIALES.filter(
      (m) => !especiales.some((c) => c.mutacion === m.nombre && c.xml !== c.intacto),
    ).map((m) => m.nombre);
    expect(sinEfecto).toEqual([]);
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
