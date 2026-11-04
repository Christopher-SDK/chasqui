import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { EstadoCaos, PERFILES, Perfil, perfil, Regla, SIN_CAOS } from '@chasqui/chaos-engine';
import { EventEmitter } from 'node:events';
import Fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';

export const AVISO = 'Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera.';

/**
 * chaos-control: guarda el estado del caos y lo transmite por SSE a cada simulador
 * (GET /api/v1/caos/flujo). Se maneja por REST, desde el panel, el SDK o el servidor MCP.
 */
export async function construirServidor(o: { registro?: boolean } = {}) {
  const app = Fastify({
    logger: o.registro ?? process.env.NODE_ENV !== 'test',
    forceCloseConnections: true,
  }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Chasqui · chaos-control',
        version: '0.1.0',
        description: `${AVISO}\n\nMotor de caos: perfiles, reglas y semilla reproducible.`,
      },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  let estado: EstadoCaos = { ...SIN_CAOS, semilla: process.env.CHAOS_SEMILLA ?? SIN_CAOS.semilla };
  const cambios = new EventEmitter().setMaxListeners(0);
  const cambiar = (nuevo: EstadoCaos) => {
    estado = nuevo;
    cambios.emit('estado', estado);
    return estado;
  };

  app.addHook('onSend', async (_req, reply) => {
    reply.header('access-control-allow-origin', '*');
    reply.header('access-control-allow-headers', 'content-type');
    reply.header('access-control-allow-methods', 'GET, PUT, DELETE, OPTIONS');
  });
  app.options('/*', { schema: { hide: true } }, (_req, reply) => reply.code(204).send());
  app.get('/salud', { schema: { hide: true } }, () => ({
    estado: 'ok',
    servicio: 'chaos-control',
    aviso: AVISO,
  }));

  const r = app.withTypeProvider<ZodTypeProvider>();
  r.get(
    '/api/v1/perfiles',
    {
      schema: {
        summary: 'Perfiles predefinidos',
        tags: ['caos'],
        response: { 200: z.array(Perfil) },
      },
    },
    () => [...PERFILES],
  );

  r.get(
    '/api/v1/caos',
    {
      schema: { summary: 'Estado actual del caos', tags: ['caos'], response: { 200: EstadoCaos } },
    },
    () => estado,
  );

  r.put(
    '/api/v1/caos',
    {
      schema: {
        summary:
          'Activar un perfil o reglas propias (con semilla opcional para reproducir la secuencia)',
        tags: ['caos'],
        body: z.union([
          z.object({ perfil: z.string(), semilla: z.string().min(1).optional() }),
          z.object({ reglas: z.array(Regla).min(1), semilla: z.string().min(1).optional() }),
        ]),
        response: { 200: EstadoCaos, 404: z.object({ error: z.string() }) },
      },
    },
    async (req, reply) => {
      const semilla = req.body.semilla ?? estado.semilla;
      if ('perfil' in req.body) {
        const p = perfil(req.body.perfil);
        if (!p) return reply.code(404).send({ error: `Perfil desconocido: ${req.body.perfil}` });
        return cambiar({ perfil: p.nombre, reglas: p.reglas, semilla });
      }
      return cambiar({ perfil: null, reglas: req.body.reglas, semilla });
    },
  );

  r.delete(
    '/api/v1/caos',
    { schema: { summary: 'Desactivar el caos', tags: ['caos'], response: { 200: EstadoCaos } } },
    () => cambiar({ perfil: null, reglas: [], semilla: estado.semilla }),
  );

  // Flujo SSE: el estado actual al conectar y cada cambio después.
  app.get('/api/v1/caos/flujo', { schema: { hide: true } }, (req, reply) => {
    reply.hijack();
    reply.raw.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
    });
    const enviar = (e: EstadoCaos) => reply.raw.write(`data: ${JSON.stringify(e)}\n\n`);
    enviar(estado);
    cambios.on('estado', enviar);
    const latido = setInterval(() => reply.raw.write(': latido\n\n'), 15_000);
    req.raw.on('close', () => {
      clearInterval(latido);
      cambios.off('estado', enviar);
    });
  });

  return app;
}
