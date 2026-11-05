/**
 * Datos del sitio generados con el código real de Chasqui (no a mano):
 *  - datos/quipu.json: la factura del héroe, calculada por ubl-core.
 *  - public/ejemplos/*.xml + datos/ejemplos.json: los XML de /probar y su veredicto oficial.
 *  - datos/caos.json: los perfiles reales del motor de caos.
 * Uso: tsx --conditions=source scripts/datos.ts (lo llama scripts/generar.mjs).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { boleta, factura } from '@chasqui/sdk';
import { PERFILES } from '@chasqui/chaos-engine';
import { calcular, firmar, generarXml, nombreArchivo, validarXml } from '@chasqui/ubl-core';
import type { Comprobante } from '@chasqui/ubl-core';

const RAIZ = resolve(import.meta.dirname, '..');
mkdirSync(`${RAIZ}/datos`, { recursive: true });
mkdirSync(`${RAIZ}/public/ejemplos`, { recursive: true });

// Fecha fija: los ejemplos deben dar el mismo veredicto en cualquier día (la regla de plazo 2108
// la aplica el servidor, no la hoja XSL).
const FECHA = '2026-11-03';
const emisor = {
  ruc: '20000000001',
  razonSocial: 'COMERCIAL CHASQUI DEMO S.A.C.',
  direccion: {
    ubigeo: '150101',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LIMA',
    linea: 'AV. FICTICIA 123',
  },
};
const CLIENTE = ['20000000002', 'CLIENTE DEMO S.A.'] as const;
const base = (n: number) =>
  factura()
    .serie('F001', n)
    .fecha(FECHA, '10:00:00')
    .emisor(emisor)
    .cliente(...CLIENTE);

// ── El quipu del héroe: la compra de la tienda demo ──────────────────────────────────────────
const compra = base(1)
  .item('Café de altura 250 g', 2, '21.10')
  .item('Quinua orgánica 1 kg', 1, '12.71')
  .item('Chocolate 70 % cacao', 3, '7.63')
  .item('Libro: Historias del Ande', 1, '35.00', { afectacion: '20' })
  .construir();
const calc = calcular(compra);
const centimos = (d: { aTexto: (n: number) => string }) => Math.round(Number(d.aTexto(2)) * 100);
writeFileSync(
  `${RAIZ}/datos/quipu.json`,
  JSON.stringify(
    {
      nombre: `${nombreArchivo(compra)}.xml`,
      lineas: calc.lineas.map((l) => ({
        descripcion: l.item.descripcion,
        cantidad: Number(l.item.cantidad),
        afectacion: l.item.afectacion,
        // Importe de la línea con impuestos, en céntimos (se anuda en el sistema decimal de Locke).
        centimos: centimos(l.valorVenta.sumar(l.igv)),
      })),
      total: centimos(calc.totales.importeTotal),
      igv: centimos(calc.totales.igv),
      veredicto: validarXml(generarXml(calc), `${nombreArchivo(compra)}.xml`, { hoy: FECHA })
        .estado,
    },
    null,
    2,
  ),
);

// ── Ejemplos de /probar ───────────────────────────────────────────────────────────────────────
const UBL20 = (x: string) => x.replace('<cbc:UBLVersionID>2.1', '<cbc:UBLVersionID>2.0');
const DESFASE = (x: string) =>
  x.replace(
    /(<cbc:PayableAmount currencyID="PEN">)([\d.]+)/,
    (_, a: string, v: string) => `${a}${(Number(v) + 3).toFixed(2)}`,
  );
const ejemplos: { id: string; titulo: string; c: Comprobante; alterar?: (x: string) => string }[] =
  [
    { id: 'valida', titulo: 'Factura válida', c: compra },
    {
      id: 'rechazada',
      titulo: 'UBL 2.0 en vez de 2.1',
      c: base(2).item('Café', 1, '21.10').construir(),
      alterar: UBL20,
    },
    {
      id: 'observada',
      titulo: 'Total desfasado en S/ 3',
      c: base(3).item('Café', 2, '21.10').construir(),
      alterar: DESFASE,
    },
    {
      id: 'credito',
      titulo: 'Crédito con detracción',
      c: base(4)
        .item('Mantenimiento de equipos', 1, '2000')
        .detraccion({ codigoBien: '020', cuentaBancoNacion: '00-000-000001' })
        .formaPago(
          { monto: '1062', fechaPago: '2026-12-15' },
          { monto: '1062', fechaPago: '2027-01-15' },
        )
        .construir(),
    },
    {
      id: 'consumo',
      titulo: 'ISC, bolsas y una muestra gratuita',
      c: base(5)
        .item('Licor de demostración', 2, '40', { isc: { sistema: '01', tasa: '0.25' } })
        .item('Muestra', 1, '5', { afectacion: '13' })
        .bolsas(2, '0.10')
        .descuento({ factor: '0.05' })
        .construir(),
    },
    {
      id: 'boleta',
      titulo: 'Boleta con IGV del 10 % (Ley 31556)',
      c: boleta()
        .serie('B001', 1)
        .fecha(FECHA, '10:00:00')
        .emisor(emisor)
        .cliente('12345678', 'ANA PEREZ')
        .item('Almuerzo', 2, '20.00')
        .tasaIgv('10')
        .construir(),
    },
  ];

const indice = ejemplos.map(({ id, titulo, c, alterar = (x) => x }) => {
  const nombre = `${nombreArchivo(c)}.xml`;
  const xml = alterar(firmar(generarXml(calcular(c))));
  writeFileSync(`${RAIZ}/public/ejemplos/${nombre}`, xml);
  const v = validarXml(xml, nombre, { hoy: FECHA });
  return {
    id,
    titulo,
    archivo: nombre,
    estado: v.estado,
    codigo: v.error?.codigo ?? '0',
    observaciones: v.observaciones.map((o) => o.codigo),
  };
});
writeFileSync(`${RAIZ}/datos/ejemplos.json`, JSON.stringify(indice, null, 2));

// ── Caos: los perfiles reales ─────────────────────────────────────────────────────────────────
writeFileSync(`${RAIZ}/datos/caos.json`, JSON.stringify(PERFILES, null, 2));

console.log(
  `datos: quipu ${String(calc.lineas.length)} líneas · total ${calc.totales.importeTotal.aTexto(2)} · ejemplos ${indice
    .map(
      (e) =>
        `${e.id}=${e.estado}/${e.codigo}${e.observaciones.length ? `+${e.observaciones.join(',')}` : ''}`,
    )
    .join(' ')}`,
);
