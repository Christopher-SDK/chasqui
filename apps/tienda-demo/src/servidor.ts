import { instrumentar } from '@chasqui/telemetria';
import { randomUUID } from 'node:crypto';
import {
  boleta,
  Chasqui,
  ErrorChasqui,
  factura,
  type OpcionesCliente,
  type ResultadoSunat,
} from '@chasqui/sdk';
import { calcular, type Emisor } from '@chasqui/ubl-core';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';
import { PAGINA } from './pagina.js';

/**
 * Tienda de ejemplo: muestra cómo integrar el SDK en un checkout real.
 *
 *   1. Factura → valida el RUC del cliente en identidad-sim (debe estar ACTIVO).
 *   2. Cobra con un QR de pagos-sim y lo paga desde el celular del cliente (Idempotency-Key = id del
 *      pedido: reintentar el checkout nunca cobra dos veces).
 *   3. Emite la boleta o factura a sunat-sim. Si SUNAT no responde, el pedido queda «pagado» con el
 *      comprobante pendiente y se puede reintentar: el dinero ya se cobró, el comprobante no se pierde.
 */

export const EMISOR: Emisor = {
  ruc: '20000000001',
  razonSocial: 'BODEGA DEMO CHASQUI S.A.C.',
  nombreComercial: 'Bodega Demo',
  direccion: {
    ubigeo: '150101',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LIMA',
    linea: 'AV. FICTICIA 123',
  },
};
/** Celular ficticio de la tienda en pagos-sim. */
export const CELULAR_TIENDA = '900000010';

/** Precios SIN IGV (valor unitario); la página muestra el precio con IGV. */
export const PRODUCTOS = [
  { id: 'cafe', descripcion: 'Café de altura 250 g', valorUnitario: '21.10' },
  { id: 'quinua', descripcion: 'Quinua orgánica 1 kg', valorUnitario: '12.71' },
  { id: 'chocolate', descripcion: 'Chocolate 70 % cacao', valorUnitario: '7.63' },
  {
    id: 'libro',
    descripcion: 'Libro: Historias del Ande (exonerado)',
    valorUnitario: '35.00',
    afectacion: '20' as const,
  },
] as const;

type Estado = 'pagado' | 'completado' | 'rechazado';
interface Pedido {
  id: string;
  estado: Estado;
  tipo: 'boleta' | 'factura';
  serie: string;
  correlativo: number;
  total: string;
  pago: { transferencia: string; estado: string } | null;
  comprobante: Pick<ResultadoSunat, 'estado' | 'codigo' | 'mensaje'> | null;
  error: string | null;
  /** Para reintentar la emisión con el mismo número. */
  datos: { documento: string; nombre: string; items: { id: string; cantidad: number }[] };
}

const Checkout = z.object({
  tipo: z.enum(['boleta', 'factura']),
  documento: z.string().regex(/^(\d{8}|\d{11})$/),
  nombre: z.string().min(3).max(100),
  celular: z.string().regex(/^9\d{8}$/),
  items: z
    .array(
      z.object({
        id: z.enum(PRODUCTOS.map((p) => p.id) as [string, ...string[]]),
        cantidad: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
});

export async function construirServidor(o: { chasqui?: OpcionesCliente; registro?: boolean } = {}) {
  const app = Fastify({
    logger: o.registro ?? process.env.NODE_ENV !== 'test',
  }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await instrumentar(app, 'tienda-demo');
  const desdeEntorno = Object.fromEntries(
    Object.entries({
      sunat: process.env.SUNAT_URL,
      pagos: process.env.PAGOS_URL,
      identidad: process.env.IDENTIDAD_URL,
      caos: process.env.CHAOS_CONTROL_URL,
    }).filter(([, v]) => v),
  );
  const chasqui = new Chasqui({ ...desdeEntorno, ...o.chasqui });
  // ponytail: pedidos y correlativos en memoria; una tienda real los guarda en su base.
  const pedidos = new Map<string, Pedido>();
  const correlativos = { B001: 0, F001: 0 };

  const construir = (p: Pedido) => {
    const b = (p.tipo === 'factura' ? factura() : boleta())
      .serie(p.serie, p.correlativo)
      .emisor(EMISOR)
      .cliente(p.datos.documento, p.datos.nombre);
    for (const it of p.datos.items) {
      const prod = PRODUCTOS.find((x) => x.id === it.id);
      if (prod)
        b.item(prod.descripcion, it.cantidad, prod.valorUnitario, {
          afectacion: 'afectacion' in prod ? prod.afectacion : '10',
          codigo: prod.id,
        });
    }
    return b.construir();
  };

  const emitir = async (p: Pedido) => {
    try {
      const r = await chasqui.sunat.enviar(construir(p));
      p.comprobante = { estado: r.estado, codigo: r.codigo, mensaje: r.mensaje };
      p.estado = r.estado === 'rechazado' ? 'rechazado' : 'completado';
      p.error = null;
    } catch (e) {
      // 1033: un intento anterior sí llegó (la respuesta se perdió): se consulta el estado.
      if (e instanceof ErrorChasqui && e.codigo === '1033') {
        const s = await chasqui.sunat.estado(
          EMISOR.ruc,
          p.tipo === 'factura' ? '01' : '03',
          p.serie,
          p.correlativo,
        );
        p.comprobante = {
          estado: s.estado as ResultadoSunat['estado'],
          codigo: s.codigo ?? '0',
          mensaje: s.mensaje ?? '',
        };
        p.estado = 'completado';
        p.error = null;
      } else p.error = `Comprobante pendiente: ${e instanceof Error ? e.message : String(e)}`;
    }
  };

  app.addHook('onSend', async (_req, reply) => {
    reply.header('x-chasqui-aviso', 'simulador-no-oficial');
  });
  app.get('/', (_req, reply) => reply.type('text/html; charset=utf-8').send(PAGINA));
  app.get('/salud', () => ({ estado: 'ok', servicio: 'tienda-demo' }));
  app.get('/api/productos', () =>
    PRODUCTOS.map((p) => {
      const c = calcular(
        boleta()
          .serie('B001', 1)
          .emisor(EMISOR)
          .cliente('00000000', 'X')
          .item(p.descripcion, 1, p.valorUnitario, {
            afectacion: 'afectacion' in p ? p.afectacion : '10',
          })
          .construir(),
      );
      return { id: p.id, descripcion: p.descripcion, precio: c.totales.importeTotal.aTexto(2) };
    }),
  );

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/api/pedidos', { schema: { body: Checkout } }, async (req, reply) => {
      const clave = String(req.headers['idempotency-key'] ?? randomUUID());
      const previo = pedidos.get(clave);
      if (previo) return reply.code(200).send(publico(previo));
      const d = req.body;

      if (d.tipo === 'factura') {
        if (d.documento.length !== 11)
          return reply
            .code(422)
            .send({ codigo: 'RUC_REQUERIDO', mensaje: 'La factura requiere RUC' });
        try {
          const c = await chasqui.identidad.ruc(d.documento);
          // Decisión de la tienda demo (no una regla de SUNAT): solo factura a contribuyentes activos.
          if (c.estado !== 'ACTIVO')
            return await reply
              .code(422)
              .send({ codigo: 'CONTRIBUYENTE_NO_ACTIVO', mensaje: `RUC en estado ${c.estado}` });
          d.nombre = c.razonSocial;
        } catch (e) {
          if (e instanceof ErrorChasqui && e.status < 500)
            return reply.code(422).send({ codigo: e.codigo, mensaje: e.message });
          throw e;
        }
      }

      const serie = d.tipo === 'factura' ? 'F001' : 'B001';
      const p: Pedido = {
        id: clave,
        estado: 'pagado',
        tipo: d.tipo,
        serie,
        correlativo: 0,
        total: '0.00',
        pago: null,
        comprobante: null,
        error: null,
        datos: { documento: d.documento, nombre: d.nombre, items: d.items },
      };
      p.total = calcular(construir({ ...p, correlativo: 1 })).totales.importeTotal.aTexto(2);

      const cobro = await chasqui.pagos.cobrar({
        destino: CELULAR_TIENDA,
        monto: p.total,
        descripcion: `Pedido ${clave.slice(0, 8)}`,
      });
      const t = await chasqui.pagos.esperar(
        (await chasqui.pagos.pagarCobro(cobro.id, d.celular, undefined, `pedido-${clave}`)).id,
      );
      p.pago = { transferencia: t.id, estado: t.estado };
      if (t.estado !== 'completada') {
        p.estado = 'rechazado';
        p.error = `Pago ${t.estado}${t.motivo ? `: ${t.motivo}` : ''}`;
        return reply.code(402).send(publico(p));
      }

      // El número se asigna solo cuando el pago está confirmado: no quedan huecos por pagos fallidos.
      p.correlativo = ++correlativos[serie];
      pedidos.set(clave, p);
      await emitir(p);
      return reply.code(201).send(publico(p));
    });

  app.get<{ Params: { id: string } }>('/api/pedidos/:id', (req, reply) => {
    const p = pedidos.get(req.params.id);
    return p ? publico(p) : reply.code(404).send({ codigo: 'NO_ENCONTRADO' });
  });

  app.post<{ Params: { id: string } }>('/api/pedidos/:id/comprobante', async (req, reply) => {
    const p = pedidos.get(req.params.id);
    if (!p) return reply.code(404).send({ codigo: 'NO_ENCONTRADO' });
    if (!p.comprobante) await emitir(p);
    return publico(p);
  });

  return app;
}

// `datos` queda fuera de la respuesta (JSON omite undefined).
const publico = (p: Pedido) => ({
  ...p,
  datos: undefined,
  numero: p.correlativo ? `${p.serie}-${String(p.correlativo)}` : null,
});
