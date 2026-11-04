import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import Fastify from 'fastify';
import { afterAll, expect, test } from 'vitest';
import { contador, detenerTelemetria, iniciarTelemetria, instrumentar } from '../src/index.js';

/** Colector OTLP/HTTP falso: guarda lo que recibe por ruta (/v1/traces, /v1/metrics). */
const recibido: Record<string, string[]> = {};
const colector = createServer((req, res) => {
  let cuerpo = '';
  req.on('data', (c: Buffer) => (cuerpo += c.toString()));
  req.on('end', () => {
    (recibido[req.url ?? ''] ??= []).push(cuerpo);
    res.writeHead(200, { 'content-type': 'application/json' }).end('{}');
  });
});
afterAll(() => new Promise((ok) => colector.close(ok)));

test('sin OTEL_EXPORTER_OTLP_ENDPOINT no inicia nada y los servicios funcionan igual', async () => {
  delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  iniciarTelemetria('otro');
  const app = Fastify();
  await instrumentar(app, 'otro');
  app.get('/x', () => ({ ok: true }));
  const r = await app.inject({ url: '/x' });
  expect(r.statusCode).toBe(200);
  expect(r.headers['x-chasqui-traza']).toBeUndefined();
});

// Va segunda: el SDK de OTel registra instrumentación global que no se puede deshacer del todo.
test('propaga la traza W3C entrante, la devuelve en x-chasqui-traza y exporta spans y métricas', async () => {
  await new Promise<void>((ok) => colector.listen(0, '127.0.0.1', ok));
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT = `http://127.0.0.1:${String((colector.address() as AddressInfo).port)}`;
  iniciarTelemetria('prueba-sim');

  const app = Fastify();
  await instrumentar(app, 'prueba-sim');
  const contar = contador('chasqui_prueba', 'contador de prueba');
  app.get('/api/v1/eco/:x', () => {
    contar({ caso: 'eco' });
    return { ok: true };
  });
  await app.listen({ port: 0, host: '127.0.0.1' });
  const base = `http://127.0.0.1:${String((app.server.address() as AddressInfo).port)}`;

  const idTraza = '4bf92f3577b34da6a3ce929d0e0e4736';
  // Por inject: un fetch de la prueba pasaría por la instrumentación de undici, que abre su propio
  // span cliente y reemplaza el traceparent escrito a mano.
  const r = await app.inject({
    url: '/api/v1/eco/1',
    headers: { traceparent: `00-${idTraza}-00f067aa0ba902b7-01` },
  });
  expect(r.headers['x-chasqui-traza']).toBe(idTraza);
  // Sin cabecera entrante se crea una traza nueva.
  const nueva = (await fetch(`${base}/api/v1/eco/2`)).headers.get('x-chasqui-traza');
  expect(nueva).toMatch(/^[0-9a-f]{32}$/);
  expect(nueva).not.toBe(idTraza);

  await app.close();
  await detenerTelemetria();
  const trazas = (recibido['/v1/traces'] ?? []).join('');
  expect(trazas).toContain(idTraza);
  expect(trazas).toContain('prueba-sim');
  const metricas = (recibido['/v1/metrics'] ?? []).join('');
  expect(metricas).toContain('chasqui_http_duracion');
  expect(metricas).toContain('chasqui_prueba');
  expect(metricas).toContain('/api/v1/eco/:x');
});
