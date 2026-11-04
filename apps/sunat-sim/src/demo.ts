import {
  calcular,
  empaquetar,
  firmar,
  generarXml,
  nombreArchivo,
  type Comprobante,
} from '@chasqui/ubl-core';
import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { siguiente } from './db.js';
import { enLima, recibir, type Dependencias } from './recepcion.js';

/**
 * Emisión de comprobantes de demostración (datos ficticios) para el panel y el guion de demo:
 * cada escenario ejercita un camino distinto de la recepción.
 */

export const ESCENARIOS = ['valida', 'observada', 'rechazada', 'duplicada', 'excepcion'] as const;

const ALTERACION: Partial<Record<(typeof ESCENARIOS)[number], (xml: string) => string>> = {
  // PayableAmount desfasado en 3: observación 4312, el comprobante igual se acepta.
  observada: (x) =>
    x.replace(
      /(<cbc:PayableAmount currencyID="PEN">)([\d.]+)/,
      (_, a: string, v: string) => `${a}${(Number(v) + 3).toFixed(2)}`,
    ),
  // UBL 2.0: la regla 2074 rechaza con CDR.
  rechazada: (x) => x.replace('<cbc:UBLVersionID>2.1', '<cbc:UBLVersionID>2.0'),
};

function comprobanteDemo(correlativo: number, fecha: string): Comprobante {
  return {
    tipo: '01',
    serie: 'F999',
    correlativo,
    fechaEmision: fecha,
    moneda: 'PEN',
    emisor: {
      ruc: '20000000001',
      razonSocial: 'COMERCIAL CHASQUI DEMO S.A.C.',
      direccion: {
        ubigeo: '150101',
        departamento: 'LIMA',
        provincia: 'LIMA',
        distrito: 'LIMA',
        linea: 'AV. FICTICIA 123',
      },
    },
    cliente: { tipoDocumento: '6', numeroDocumento: '20000000002', nombre: 'CLIENTE DEMO S.A.' },
    items: [
      {
        descripcion: 'Producto de demostración',
        cantidad: 2,
        unidad: 'NIU',
        valorUnitario: '42.50',
        afectacion: '10',
      },
      {
        descripcion: 'Servicio exonerado',
        cantidad: 1,
        unidad: 'ZZ',
        valorUnitario: '15.00',
        afectacion: '20',
      },
    ],
  };
}

export function rutasDemo(deps: Dependencias): FastifyPluginCallback {
  let ultimoValido: { nombreZip: string; zip: Uint8Array } | null = null;
  return (app, _o, listo) => {
    app
      .withTypeProvider<ZodTypeProvider>()
      .post(
        '/_chasqui/demo',
        { schema: { hide: true, body: z.object({ escenario: z.enum(ESCENARIOS) }) } },
        async (req) => {
          const { escenario } = req.body;
          if (escenario === 'duplicada' && ultimoValido) {
            const r = await recibir(deps, ultimoValido.nombreZip, ultimoValido.zip, 'rest');
            return {
              escenario,
              codigo: r.codigo,
              estado: r.tipo === 'cdr' ? r.estado : 'excepcion',
            };
          }
          const c = comprobanteDemo(await siguiente(deps.db, 'demo'), enLima(deps.ahora()).fecha);
          const nombre = nombreArchivo(c);
          const alterar = ALTERACION[escenario] ?? ((x: string) => x);
          const zip = empaquetar(nombre, firmar(alterar(generarXml(calcular(c)))));
          // Excepción: el XML dentro del ZIP no coincide con el nombre del ZIP (0161).
          const nombreZip =
            escenario === 'excepcion'
              ? nombre.replace(/-(\d+)$/, '-9$1') + '.zip'
              : `${nombre}.zip`;
          const r = await recibir(deps, nombreZip, zip, 'rest');
          if (escenario === 'valida' || escenario === 'duplicada')
            ultimoValido = { nombreZip, zip };
          return { escenario, codigo: r.codigo, estado: r.tipo === 'cdr' ? r.estado : 'excepcion' };
        },
      );
    listo();
  };
}
