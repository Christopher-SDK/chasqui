import { mkdirSync, writeFileSync } from 'node:fs';
import { emitir, type Factura } from '@chasqui/ubl-core';

/**
 * Pregenera facturas firmadas para k6 (firmar XML-DSig desde k6 no es práctico). Serie nueva en
 * cada corrida para no chocar con duplicados (1033) de corridas anteriores en la misma base.
 *   pnpm carga:preparar [cantidad]
 */
const cantidad = Number(process.argv[2] ?? 1200);
const serie = `F${(Date.now() % 46_656).toString(36).toUpperCase().padStart(3, '0')}`;
const hoy = new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 10);
const zips: { nombreArchivo: string; contenido: string }[] = [];
for (let n = 1; n <= cantidad; n++) {
  const f: Factura = {
    tipo: '01',
    serie,
    correlativo: n,
    fechaEmision: hoy,
    moneda: 'PEN',
    emisor: {
      ruc: '20000000001',
      razonSocial: 'CARGA DEMO S.A.C.',
      direccion: {
        ubigeo: '150101',
        departamento: 'LIMA',
        provincia: 'LIMA',
        distrito: 'LIMA',
        linea: 'AV. FICTICIA 1',
      },
    },
    cliente: {
      tipoDocumento: '6',
      numeroDocumento: '20000000001',
      nombre: 'CLIENTE DE CARGA S.A.C.',
    },
    items: [
      {
        descripcion: `Producto ${String(n)}`,
        cantidad: 1 + (n % 5),
        unidad: 'NIU',
        valorUnitario: '19.90',
        afectacion: '10',
      },
    ],
  };
  const e = emitir(f);
  zips.push({ nombreArchivo: e.nombreZip, contenido: Buffer.from(e.zip).toString('base64') });
}
mkdirSync(new URL('.datos/', import.meta.url), { recursive: true });
writeFileSync(new URL('.datos/comprobantes.json', import.meta.url), JSON.stringify(zips));
console.log(
  `${String(cantidad)} facturas firmadas (serie ${serie}) en carga/.datos/comprobantes.json`,
);
