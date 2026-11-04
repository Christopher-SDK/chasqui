import Fastify, { type FastifyInstance } from 'fastify';

export function construirServidor(): FastifyInstance {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });
  app.get('/salud', () => ({ estado: 'ok', servicio: 'sunat-sim' }));
  return app;
}
