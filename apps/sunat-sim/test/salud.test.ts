import { afterAll, expect, test } from 'vitest';
import { construirServidor } from '../src/servidor.js';

const app = construirServidor();
afterAll(() => app.close());

test('GET /salud responde ok', async () => {
  const res = await app.inject('/salud');
  expect(res.statusCode).toBe(200);
  expect(res.json()).toEqual({ estado: 'ok', servicio: 'sunat-sim' });
});
