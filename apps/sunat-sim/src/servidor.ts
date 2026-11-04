import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { FuenteCaos, registrarCaos } from '@chasqui/chaos-engine';
import { abrirDb, migrar, type Db } from './db.js';
import { Eventos } from './eventos.js';
import { CONFIG_POR_DEFECTO, type Config, type Dependencias } from './recepcion.js';
import { rutasRest } from './rest.js';
import { rutasSoap } from './soap.js';
import { rutasDemo } from './demo.js';
import { rutasGre } from './gre.js';

export const AVISO = 'Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera.';

export interface OpcionesServidor {
  db?: Db;
  ahora?: () => Date;
  config?: Partial<Config>;
  registro?: boolean;
  /** Estado del caos; por defecto, el de chaos-control (CHAOS_CONTROL_URL) o ninguno. */
  caos?: FuenteCaos;
}

export async function construirServidor(
  o: OpcionesServidor = {},
): Promise<FastifyInstance & { deps: Dependencias }> {
  const app = Fastify({
    logger: o.registro ?? process.env.NODE_ENV !== 'test',
    // Las conexiones SSE quedan abiertas: al cerrar, se cortan en lugar de esperarlas.
    forceCloseConnections: true,
  }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const db = o.db ?? abrirDb();
  await migrar(db);
  const deps: Dependencias = {
    db,
    ahora: o.ahora ?? (() => new Date()),
    eventos: new Eventos(),
    config: { ...CONFIG_POR_DEFECTO, ...o.config },
  };

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Chasqui · sunat-sim',
        version: '0.1.0',
        description: `${AVISO}\n\nRecepción de comprobantes compatible con el formato UBL 2.1 que usa SUNAT.`,
      },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  // Motor de caos antes de las rutas: las fallas inyectadas se publican en el flujo del panel.
  const caos = o.caos ?? new FuenteCaos(process.env.CHAOS_CONTROL_URL).iniciar();
  registrarCaos(app, {
    servicio: 'sunat-sim',
    estado: caos.estado,
    alInyectar: (e) => {
      deps.eventos.emitir({ tipo: 'falla', ...e });
    },
  });
  app.addHook('onClose', () => {
    caos.detener();
  });

  app.addHook('onSend', async (_req, reply) => {
    reply.header('x-chasqui-aviso', 'simulador-no-oficial');
    // Simulador local: el panel puede consumirlo desde cualquier origen.
    reply.header('access-control-allow-origin', '*');
    reply.header('access-control-allow-headers', 'content-type');
  });
  app.options('/*', { schema: { hide: true } }, (_req, reply) => reply.code(204).send());
  app.get('/salud', { schema: { hide: true } }, () => ({
    estado: 'ok',
    servicio: 'sunat-sim',
    aviso: AVISO,
  }));

  // Flujo de eventos en vivo (SSE) para el panel.
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
    for (const e of deps.eventos.ultimos()) enviar(e);
    const cancelar = deps.eventos.suscribir(enviar);
    const latido = setInterval(() => reply.raw.write(': latido\n\n'), 15_000);
    req.raw.on('close', () => {
      clearInterval(latido);
      cancelar();
    });
  });

  // Reinicio de datos para pruebas y demos.
  app.post('/_chasqui/reiniciar', { schema: { hide: true } }, async () => {
    await deps.db.deleteFrom('comprobantes').execute();
    await deps.db.deleteFrom('tickets').execute();
    await deps.db.deleteFrom('secuencias').execute();
    return { ok: true };
  });

  await app.register(rutasRest(deps));
  await app.register(rutasSoap(deps));
  await app.register(rutasDemo(deps));
  await app.register(rutasGre(deps));
  app.addHook('onClose', async () => {
    await deps.db.destroy();
  });
  return Object.assign(app, { deps });
}
