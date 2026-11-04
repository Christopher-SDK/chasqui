import { contador, instrumentar, trazaActual } from '@chasqui/telemetria';
import { randomBytes } from 'node:crypto';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { FuenteCaos, registrarCaos } from '@chasqui/chaos-engine';
import { EventEmitter } from 'node:events';
import Fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import QRCode from 'qrcode';
import { z } from 'zod';
import {
  completarPendientes,
  encolar,
  enmascarar,
  entregarWebhooks,
  publica,
  revertir,
  sembrar,
  transferir,
  type Contexto,
} from './billetera.js';
import { abrirDb, migrar, type Db } from './db.js';
import { payloadQr } from './qr.js';

export const AVISO =
  'Simulador para pruebas. No afiliado a ninguna billetera ni entidad financiera. Dinero ficticio.';

const Celular = z.string().regex(/^9\d{8}$/, 'Celular peruano de 9 dígitos que empieza con 9');
/** Soles con hasta dos decimales, como texto ("12.50") o número. */
const Monto = z
  .union([z.string(), z.number()])
  .transform((v) => String(v))
  .refine(
    (v) => /^\d{1,7}(\.\d{1,2})?$/.test(v) && Number(v) > 0,
    'Monto positivo con hasta 2 decimales',
  )
  .transform((v) => Math.round(Number(v) * 100));
const Error = z.object({ codigo: z.string(), mensaje: z.string() });
const TransferenciaPublica = z.object({
  id: z.string(),
  origen: z.string(),
  destino: z.string(),
  monto: z.string(),
  moneda: z.literal('PEN'),
  descripcion: z.string(),
  estado: z.enum(['pendiente', 'completada', 'rechazada', 'revertida']),
  motivo: z.string().nullable(),
  cobroId: z.string().nullable(),
  creadoEn: z.string(),
  actualizadoEn: z.string(),
});

export interface OpcionesPagos {
  db?: Db;
  ahora?: () => Date;
  registro?: boolean;
  caos?: FuenteCaos;
  /** Trabajador en segundo plano (completa pendientes y entrega webhooks). En pruebas: false. */
  trabajador?: boolean;
  demoraInterbilletera?: number;
  enviar?: typeof fetch;
}

export async function construirServidor(o: OpcionesPagos = {}) {
  const app = Fastify({
    logger: o.registro ?? process.env.NODE_ENV !== 'test',
    forceCloseConnections: true,
  }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await instrumentar(app, 'pagos-sim');

  const db = o.db ?? abrirDb();
  await migrar(db);
  await sembrar(db);
  const bus = new EventEmitter().setMaxListeners(0);
  const recientes: unknown[] = [];
  const emitirEvento = (e: Record<string, unknown>) => {
    recientes.push(e);
    if (recientes.length > 200) recientes.shift();
    bus.emit('evento', e);
  };
  const contarEvento = contador(
    'chasqui_pagos_eventos',
    'Eventos de pagos (completadas, rechazadas, revertidas, cobros)',
  );
  const ctx: Contexto = {
    db,
    ahora: o.ahora ?? (() => new Date()),
    demoraInterbilletera:
      o.demoraInterbilletera ?? Number(process.env.DEMORA_INTERBILLETERA_MS ?? 1500),
    publicar: async (evento, datos) => {
      contarEvento({ evento });
      await encolar(ctx, evento, datos);
      emitirEvento({
        tipo: 'pago',
        servicio: 'pagos-sim',
        evento,
        traza: trazaActual(),
        ...datos,
        en: ctx.ahora().toISOString(),
      });
    },
  };
  /** Un paso del trabajador: completar pendientes y entregar webhooks vencidos. */
  const tick = async () => {
    await completarPendientes(ctx);
    await entregarWebhooks(ctx, o.enviar);
  };

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Chasqui · pagos-sim',
        version: '0.1.0',
        description: `${AVISO}\n\nBilletera interoperable simulada.`,
      },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });
  const caos = o.caos ?? new FuenteCaos(process.env.CHAOS_CONTROL_URL).iniciar();
  registrarCaos(app, {
    servicio: 'pagos-sim',
    estado: caos.estado,
    ahora: () => ctx.ahora().getTime(),
    alInyectar: (e) => {
      emitirEvento({ tipo: 'falla', ...e });
    },
  });
  let intervalo: NodeJS.Timeout | undefined;
  if (o.trabajador ?? true)
    intervalo = setInterval(() => {
      tick().catch((e: unknown) => {
        app.log.error(e);
      });
    }, 250);
  app.addHook('onClose', async () => {
    clearInterval(intervalo);
    caos.detener();
    await db.destroy();
  });
  app.addHook('onSend', async (_req, reply) => {
    reply.header('x-chasqui-aviso', 'simulador-no-oficial');
    reply.header('access-control-allow-origin', '*');
    reply.header('access-control-allow-headers', 'content-type, idempotency-key, x-chasqui-chaos');
  });
  app.options('/*', { schema: { hide: true } }, (_req, reply) => reply.code(204).send());
  app.get('/salud', { schema: { hide: true } }, () => ({
    estado: 'ok',
    servicio: 'pagos-sim',
    aviso: AVISO,
  }));
  app.get('/_chasqui/eventos', { schema: { hide: true } }, (req, reply) => {
    reply.hijack();
    reply.raw.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
    });
    reply.raw.write(': conectado\n\n');
    const enviar = (e: unknown) => reply.raw.write(`data: ${JSON.stringify(e)}\n\n`);
    for (const e of recientes) enviar(e);
    bus.on('evento', enviar);
    req.raw.on('close', () => {
      bus.off('evento', enviar);
    });
  });

  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/api/v1/cuentas',
    {
      schema: {
        summary: 'Cuentas de prueba con su saldo (para paneles y pruebas)',
        tags: ['cuentas'],
        response: {
          200: z.array(
            z.object({
              celular: z.string(),
              titular: z.string(),
              billetera: z.string(),
              saldo: z.string(),
            }),
          ),
        },
      },
    },
    async () =>
      (await db.selectFrom('cuentas').selectAll().orderBy('celular').execute()).map((c) => ({
        celular: c.celular,
        titular: c.titular,
        billetera: c.billetera,
        saldo: (c.saldo / 100).toFixed(2),
      })),
  );

  r.get(
    '/api/v1/cuentas/:celular',
    {
      schema: {
        summary: 'Consultar el titular de un celular antes de transferir (nombre enmascarado)',
        tags: ['cuentas'],
        params: z.object({ celular: Celular }),
        response: {
          200: z.object({ celular: z.string(), titular: z.string(), billetera: z.string() }),
          404: Error,
        },
      },
    },
    async (req, reply) => {
      const c = await db
        .selectFrom('cuentas')
        .selectAll()
        .where('celular', '=', req.params.celular)
        .executeTakeFirst();
      if (!c)
        return reply
          .code(404)
          .send({ codigo: 'CUENTA_NO_EXISTE', mensaje: 'El celular no tiene billetera' });
      return { celular: c.celular, titular: enmascarar(c.titular), billetera: c.billetera };
    },
  );

  r.get(
    '/api/v1/cuentas/:celular/saldo',
    {
      schema: {
        summary: 'Saldo de una cuenta de prueba',
        tags: ['cuentas'],
        params: z.object({ celular: Celular }),
        response: {
          200: z.object({ celular: z.string(), saldo: z.string(), moneda: z.literal('PEN') }),
          404: Error,
        },
      },
    },
    async (req, reply) => {
      const c = await db
        .selectFrom('cuentas')
        .select(['celular', 'saldo'])
        .where('celular', '=', req.params.celular)
        .executeTakeFirst();
      if (!c)
        return reply
          .code(404)
          .send({ codigo: 'CUENTA_NO_EXISTE', mensaje: 'El celular no tiene billetera' });
      return { celular: c.celular, saldo: (c.saldo / 100).toFixed(2), moneda: 'PEN' as const };
    },
  );

  r.post(
    '/api/v1/cuentas',
    {
      schema: {
        summary: 'Crear una cuenta de prueba',
        tags: ['cuentas'],
        body: z.object({
          celular: Celular,
          titular: z.string().min(3).max(120),
          billetera: z.enum(['Billetera A', 'Billetera B', 'Billetera C']),
          saldo: Monto.optional(),
        }),
        response: { 201: z.object({ celular: z.string() }), 409: Error },
      },
    },
    async (req, reply) => {
      const existe = await db
        .selectFrom('cuentas')
        .select('celular')
        .where('celular', '=', req.body.celular)
        .executeTakeFirst();
      if (existe)
        return reply
          .code(409)
          .send({ codigo: 'CUENTA_EXISTE', mensaje: 'Ese celular ya tiene billetera' });
      await db
        .insertInto('cuentas')
        .values({
          celular: req.body.celular,
          titular: req.body.titular.toUpperCase(),
          billetera: req.body.billetera,
          saldo: req.body.saldo ?? 0,
          limite_operacion: 50_000,
          limite_diario: 200_000,
        })
        .execute();
      return reply.code(201).send({ celular: req.body.celular });
    },
  );

  r.post(
    '/api/v1/transferencias',
    {
      schema: {
        summary: 'Transferir por número de celular (requiere Idempotency-Key)',
        tags: ['transferencias'],
        headers: z.object({ 'idempotency-key': z.string().min(8).max(120) }),
        body: z.object({
          origen: Celular,
          destino: Celular,
          monto: Monto,
          descripcion: z.string().max(140).default(''),
        }),
        response: { 201: TransferenciaPublica, 200: TransferenciaPublica, 422: Error },
      },
    },
    async (req, reply) => {
      const res = await transferir(ctx, req.headers['idempotency-key'], req.body, req.caos);
      if (res.tipo === 'conflicto')
        return reply.code(422).send({
          codigo: 'IDEMPOTENCIA_CONFLICTO',
          mensaje: 'La Idempotency-Key ya se usó con otro cuerpo',
        });
      if (res.tipo === 'repetida')
        return reply
          .code(200)
          .header('idempotent-replayed', 'true')
          .send(publica(res.transferencia));
      return reply.code(201).send(publica(res.transferencia));
    },
  );

  r.get(
    '/api/v1/transferencias/:id',
    {
      schema: {
        summary: 'Consultar una transferencia',
        tags: ['transferencias'],
        params: z.object({ id: z.string() }),
        response: { 200: TransferenciaPublica, 404: Error },
      },
    },
    async (req, reply) => {
      const t = await db
        .selectFrom('transferencias')
        .selectAll()
        .where('id', '=', req.params.id)
        .executeTakeFirst();
      return t
        ? publica(t)
        : reply.code(404).send({ codigo: 'NO_ENCONTRADA', mensaje: 'Transferencia inexistente' });
    },
  );

  r.get(
    '/api/v1/transferencias',
    {
      schema: {
        summary: 'Historial de transferencias',
        tags: ['transferencias'],
        querystring: z.object({
          celular: Celular.optional(),
          limite: z.coerce.number().int().min(1).max(500).default(50),
        }),
        response: { 200: z.array(TransferenciaPublica) },
      },
    },
    async (req) => {
      let q = db
        .selectFrom('transferencias')
        .selectAll()
        .orderBy('creado_en', 'desc')
        .limit(req.query.limite);
      const cel = req.query.celular;
      if (cel) q = q.where((eb) => eb.or([eb('origen', '=', cel), eb('destino', '=', cel)]));
      return (await q.execute()).map(publica);
    },
  );

  r.post(
    '/api/v1/transferencias/:id/reversion',
    {
      schema: {
        summary: 'Revertir una transferencia completada',
        tags: ['transferencias'],
        params: z.object({ id: z.string() }),
        response: { 200: TransferenciaPublica, 404: Error, 422: Error },
      },
    },
    async (req, reply) => {
      const res = await revertir(ctx, req.params.id);
      if (res.ok) return publica(res.transferencia);
      return reply
        .code(res.codigo === 'NO_ENCONTRADA' ? 404 : 422)
        .send({ codigo: res.codigo, mensaje: 'No se puede revertir' });
    },
  );

  r.post(
    '/api/v1/cobros',
    {
      schema: {
        summary: 'Generar un cobro por QR (payload tipo EMVCo e imagen PNG en base64)',
        tags: ['cobros'],
        body: z.object({
          destino: Celular,
          monto: Monto.optional(),
          descripcion: z.string().max(140).default(''),
        }),
        response: {
          201: z.object({
            id: z.string(),
            payload: z.string(),
            qrPng: z.string(),
            estado: z.string(),
          }),
          404: Error,
        },
      },
    },
    async (req, reply) => {
      const c = await db
        .selectFrom('cuentas')
        .selectAll()
        .where('celular', '=', req.body.destino)
        .executeTakeFirst();
      if (!c)
        return reply
          .code(404)
          .send({ codigo: 'CUENTA_NO_EXISTE', mensaje: 'El celular no tiene billetera' });
      const id = `cob_${randomBytes(9).toString('base64url')}`;
      const payload = payloadQr({
        celular: c.celular,
        titular: c.titular,
        monto: req.body.monto ?? null,
        referencia: id,
      });
      await db
        .insertInto('cobros')
        .values({
          id,
          destino: c.celular,
          monto: req.body.monto ?? null,
          descripcion: req.body.descripcion,
          payload,
          estado: 'pendiente',
          transferencia_id: null,
          creado_en: ctx.ahora().toISOString(),
        })
        .execute();
      const qrPng = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
      });
      return reply.code(201).send({ id, payload, qrPng, estado: 'pendiente' });
    },
  );

  r.post(
    '/api/v1/cobros/:id/pago',
    {
      schema: {
        summary: 'Pagar un cobro QR desde una cuenta (requiere Idempotency-Key)',
        tags: ['cobros'],
        params: z.object({ id: z.string() }),
        headers: z.object({ 'idempotency-key': z.string().min(8).max(120) }),
        body: z.object({ origen: Celular, monto: Monto.optional() }),
        response: { 201: TransferenciaPublica, 200: TransferenciaPublica, 404: Error, 422: Error },
      },
    },
    async (req, reply) => {
      const cobro = await db
        .selectFrom('cobros')
        .selectAll()
        .where('id', '=', req.params.id)
        .executeTakeFirst();
      if (!cobro)
        return reply.code(404).send({ codigo: 'NO_ENCONTRADO', mensaje: 'Cobro inexistente' });
      if (cobro.estado === 'pagado')
        return reply.code(422).send({ codigo: 'COBRO_PAGADO', mensaje: 'El cobro ya fue pagado' });
      const monto = cobro.monto ?? req.body.monto;
      if (!monto)
        return reply
          .code(422)
          .send({ codigo: 'MONTO_REQUERIDO', mensaje: 'El QR es estático: indique el monto' });
      const res = await transferir(
        ctx,
        req.headers['idempotency-key'],
        {
          origen: req.body.origen,
          destino: cobro.destino,
          monto,
          descripcion: cobro.descripcion,
          cobroId: cobro.id,
        },
        req.caos,
      );
      if (res.tipo === 'conflicto')
        return reply.code(422).send({
          codigo: 'IDEMPOTENCIA_CONFLICTO',
          mensaje: 'La Idempotency-Key ya se usó con otro cuerpo',
        });
      return reply.code(res.tipo === 'repetida' ? 200 : 201).send(publica(res.transferencia));
    },
  );

  r.post(
    '/api/v1/webhooks',
    {
      schema: {
        summary: 'Suscribir una URL a los eventos (firmados con HMAC-SHA256)',
        tags: ['webhooks'],
        body: z.object({ url: z.url() }),
        response: { 201: z.object({ id: z.string(), url: z.string(), secreto: z.string() }) },
      },
    },
    async (req, reply) => {
      const s = {
        id: `whk_${randomBytes(9).toString('base64url')}`,
        url: req.body.url,
        secreto: `whsec_${randomBytes(24).toString('hex')}`,
        creado_en: ctx.ahora().toISOString(),
      };
      await db.insertInto('suscripciones').values(s).execute();
      return reply.code(201).send({ id: s.id, url: s.url, secreto: s.secreto });
    },
  );

  r.get(
    '/api/v1/webhooks/entregas',
    {
      schema: {
        summary: 'Estado de las entregas de webhooks (intentos y último error)',
        tags: ['webhooks'],
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              evento: z.string(),
              estado: z.string(),
              intentos: z.number(),
              ultimoError: z.string().nullable(),
            }),
          ),
        },
      },
    },
    async () =>
      (
        await db
          .selectFrom('entregas')
          .selectAll()
          .orderBy('creado_en', 'desc')
          .limit(200)
          .execute()
      ).map((e) => ({
        id: e.id,
        evento: e.evento,
        estado: e.estado,
        intentos: e.intentos,
        ultimoError: e.ultimo_error,
      })),
  );

  app.post('/_chasqui/reiniciar', { schema: { hide: true } }, async () => {
    for (const t of ['entregas', 'suscripciones', 'cobros', 'transferencias', 'cuentas'] as const)
      await db.deleteFrom(t).execute();
    await sembrar(db);
    return { ok: true };
  });

  return Object.assign(app, { pagos: { tick, ctx } });
}
