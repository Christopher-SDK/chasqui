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
import { enLima, type Dependencias } from './recepcion.js';

/**
 * Emisión de comprobantes de demostración (datos ficticios) para el panel y el guion de demo:
 * cada escenario ejercita un camino distinto de la recepción.
 */

export const ESCENARIOS = [
  'valida',
  'credito',
  'consumo',
  'observada',
  'rechazada',
  'duplicada',
  'excepcion',
] as const;

/** Operaciones especiales: cambian el comprobante, no el XML; todas pasan con código 0 (el
 * crédito, con la observación 3249 que la hoja oficial emite siempre). */
const OPERACION: Partial<Record<(typeof ESCENARIOS)[number], (c: Comprobante) => Comprobante>> = {
  // 2 000 + IGV = 2 360; detracción del 10 % (código 020) = 236; pendiente 2 124 en dos cuotas.
  credito: (c) => ({
    ...c,
    tipo: '01',
    items: [
      {
        descripcion: 'Mantenimiento de equipos',
        cantidad: 1,
        unidad: 'ZZ',
        valorUnitario: '2000.00',
        afectacion: '10',
      },
    ],
    tipoOperacion: '1001',
    detraccion: { codigoBien: '020', cuentaBancoNacion: '00-000-000001' },
    formaPago: {
      tipo: 'Credito',
      cuotas: [
        { monto: '1062.00', fechaPago: sumarDias(c.fechaEmision, 30) },
        { monto: '1062.00', fechaPago: sumarDias(c.fechaEmision, 60) },
      ],
    },
  }),
  // ISC al valor, bolsas con ICBPER, una muestra gratuita (13) y un descuento global.
  consumo: (c) => ({
    ...c,
    items: [
      {
        descripcion: 'Licor de demostración',
        cantidad: 2,
        unidad: 'NIU',
        valorUnitario: '40.00',
        afectacion: '10',
        isc: { sistema: '01', tasa: '0.25' },
      },
      {
        descripcion: 'Bolsa de plástico',
        cantidad: 2,
        unidad: 'NIU',
        valorUnitario: '0.10',
        afectacion: '10',
        icbper: {},
      },
      {
        descripcion: 'Muestra gratuita',
        cantidad: 1,
        unidad: 'NIU',
        valorUnitario: '5.00',
        afectacion: '13',
      },
    ],
    descuentoGlobal: { factor: '0.05' },
  }),
};

function sumarDias(fecha: string, dias: number): string {
  return new Date(Date.parse(fecha) + dias * 86_400_000).toISOString().slice(0, 10);
}

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
    /**
     * Se envía por el endpoint REST real (app.inject), así el motor de caos se aplica igual que a
     * cualquier cliente: con un perfil activo, «Probar» muestra su efecto en el panel.
     */
    const enviar = async (nombreZip: string, zip: Uint8Array) => {
      const r = await app.inject({
        method: 'POST',
        url: '/api/v1/comprobantes',
        payload: { nombreArchivo: nombreZip, contenido: Buffer.from(zip).toString('base64') },
      });
      const cuerpo = (r.headers['content-type'] ?? '').includes('json')
        ? r.json<{ codigo?: string; estado?: string }>()
        : {};
      const estado =
        r.statusCode === 200
          ? (cuerpo.estado ?? 'aceptado')
          : r.statusCode === 400
            ? 'excepcion'
            : 'falla';
      return { http: r.statusCode, codigo: cuerpo.codigo ?? String(r.statusCode), estado };
    };
    app
      .withTypeProvider<ZodTypeProvider>()
      .post(
        '/_chasqui/demo',
        { schema: { hide: true, body: z.object({ escenario: z.enum(ESCENARIOS) }) } },
        async (req) => {
          const { escenario } = req.body;
          if (escenario === 'duplicada' && ultimoValido) {
            return { escenario, ...(await enviar(ultimoValido.nombreZip, ultimoValido.zip)) };
          }
          const base = comprobanteDemo(
            await siguiente(deps.db, 'demo'),
            enLima(deps.ahora()).fecha,
          );
          const c = OPERACION[escenario]?.(base) ?? base;
          const nombre = nombreArchivo(c);
          const alterar = ALTERACION[escenario] ?? ((x: string) => x);
          const zip = empaquetar(nombre, firmar(alterar(generarXml(calcular(c)))));
          // Excepción: el XML dentro del ZIP no coincide con el nombre del ZIP (0161).
          const nombreZip =
            escenario === 'excepcion'
              ? nombre.replace(/-(\d+)$/, '-9$1') + '.zip'
              : `${nombre}.zip`;
          const r = await enviar(nombreZip, zip);
          if (escenario === 'valida' || escenario === 'duplicada')
            ultimoValido = { nombreZip, zip };
          return { escenario, ...r };
        },
      );
    listo();
  };
}
