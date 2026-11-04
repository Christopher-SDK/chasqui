import { FuenteCaos } from '@chasqui/chaos-engine';
import { rucEmpresa, rucPersona } from '@chasqui/test-kit';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { construirServidor } from '../src/servidor.js';

let app: Awaited<ReturnType<typeof construirServidor>>;
const caos = new FuenteCaos();
beforeAll(async () => {
  app = await construirServidor({ registro: false, caos });
});
afterAll(() => app.close());

const get = (url: string, headers: Record<string, string> = {}) =>
  app.inject({ method: 'GET', url, headers });

describe('identidad-sim', () => {
  test('RUC de empresa: datos ficticios y deterministas', async () => {
    const ruc = rucEmpresa(10);
    const a = await get(`/api/v1/ruc/${ruc}`);
    expect(a.statusCode).toBe(200);
    expect(a.json()).toMatchObject({
      ruc,
      estado: expect.any(String) as string,
      condicion: expect.any(String) as string,
    });
    expect((await get(`/api/v1/ruc/${ruc}`)).json()).toEqual(a.json());
    expect(a.headers['x-chasqui-aviso']).toBe('simulador-no-oficial');
  });

  test('RUC con dígito verificador incorrecto → 400', async () => {
    const r = await get('/api/v1/ruc/20000000002');
    expect(r.statusCode).toBe(400);
    expect(r.json()).toMatchObject({ codigo: 'RUC_INVALIDO' });
  });

  test('DNI válido, inválido y de persona natural con RUC', async () => {
    expect((await get('/api/v1/dni/12345678')).json()).toHaveProperty('nombres');
    expect((await get('/api/v1/dni/1234')).statusCode).toBe(400);
    expect((await get(`/api/v1/ruc/${rucPersona('12345678')}`)).statusCode).toBe(200);
  });

  test('una fracción determinista de documentos «no existe» (404)', async () => {
    const estados = await Promise.all(
      Array.from({ length: 200 }, (_, i) =>
        get(`/api/v1/ruc/${rucEmpresa(i)}`).then((r) => r.statusCode),
      ),
    );
    const noExisten = estados.filter((s) => s === 404).length;
    expect(noExisten).toBeGreaterThan(0);
    expect(noExisten).toBeLessThan(20);
    expect(estados.every((s) => s === 200 || s === 404)).toBe(true);
  });

  test('aparecen contribuyentes con baja o no habidos', async () => {
    const cuerpos = await Promise.all(
      Array.from({ length: 200 }, (_, i) =>
        get(`/api/v1/ruc/${rucEmpresa(i)}`).then((r) =>
          r.json<{ estado?: string; condicion?: string }>(),
        ),
      ),
    );
    expect(cuerpos.some((c) => c.condicion === 'NO HABIDO')).toBe(true);
    expect(cuerpos.some((c) => c.estado?.startsWith('BAJA'))).toBe(true);
  });

  test('responde al caos y expone OpenAPI', async () => {
    expect(
      (await get(`/api/v1/ruc/${rucEmpresa(10)}`, { 'x-chasqui-chaos': 'falla:error5xx' }))
        .statusCode,
    ).toBe(503);
    expect((await get('/docs/json')).json()).toMatchObject({ openapi: '3.1.0' });
    expect((await get('/salud')).statusCode).toBe(200);
  });
});
