import type { AddressInfo } from 'node:net';
import { FuenteCaos } from '@chasqui/chaos-engine';
import { construirServidor as construirSunat } from '@chasqui/sunat-sim';
import { emitir, leerCdr, type Factura } from '@chasqui/ubl-core';
import { afterEach, describe, expect, test } from 'vitest';
import { construirServidor } from '../src/servidor.js';

const cierres: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const c of cierres.splice(0)) await c();
});

interface Escuchable {
  listen: (o: object) => Promise<string>;
  close: () => Promise<unknown>;
  server: { address: () => unknown };
}

async function escuchar(app: Escuchable) {
  await app.listen({ port: 0, host: '127.0.0.1' });
  cierres.push(() => app.close());
  return `http://127.0.0.1:${String((app.server.address() as AddressInfo).port)}`;
}

const json = async (r: Response) => (await r.json()) as Record<string, unknown>;
const pedir = (base: string, metodo: string, cuerpo?: unknown) =>
  fetch(`${base}/api/v1/caos`, {
    method: metodo,
    ...(cuerpo
      ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) }
      : {}),
  });

const factura = (correlativo: number, fecha = new Date().toISOString().slice(0, 10)): Factura => ({
  tipo: '01',
  serie: 'F001',
  correlativo,
  fechaEmision: fecha,
  moneda: 'PEN',
  emisor: {
    ruc: '20000000001',
    razonSocial: 'DEMO S.A.C.',
    direccion: {
      ubigeo: '150101',
      departamento: 'LIMA',
      provincia: 'LIMA',
      distrito: 'LIMA',
      linea: 'AV. FICTICIA 1',
    },
  },
  cliente: { tipoDocumento: '6', numeroDocumento: '20000000002', nombre: 'CLIENTE DEMO S.A.' },
  items: [
    { descripcion: 'Producto', cantidad: 1, unidad: 'NIU', valorUnitario: '100', afectacion: '10' },
  ],
});

describe('chaos-control', () => {
  test('perfiles, activar, consultar y desactivar', async () => {
    const base = await escuchar(await construirServidor({ registro: false }));
    const perfiles = (await (await fetch(`${base}/api/v1/perfiles`)).json()) as {
      nombre: string;
    }[];
    expect(perfiles.map((p) => p.nombre)).toContain('cierre-de-mes');
    expect(
      await json(await pedir(base, 'PUT', { perfil: 'red-inestable', semilla: 'demo' })),
    ).toMatchObject({ perfil: 'red-inestable', semilla: 'demo' });
    expect(await json(await fetch(`${base}/api/v1/caos`))).toMatchObject({
      perfil: 'red-inestable',
    });
    expect((await pedir(base, 'PUT', { perfil: 'no-existe' })).status).toBe(404);
    expect(
      (await pedir(base, 'PUT', { reglas: [{ porcentaje: 101, falla: { tipo: 'duplicado' } }] }))
        .status,
    ).toBe(400);
    expect(
      await json(
        await pedir(base, 'PUT', { reglas: [{ porcentaje: 30, falla: { tipo: 'duplicado' } }] }),
      ),
    ).toMatchObject({ perfil: null, semilla: 'demo' });
    expect(await json(await pedir(base, 'DELETE'))).toEqual({
      perfil: null,
      reglas: [],
      semilla: 'demo',
    });
    expect((await fetch(`${base}/docs/json`)).status).toBe(200);
    expect((await fetch(`${base}/api/v1/caos`, { method: 'OPTIONS' })).status).toBe(204);
  });

  test('los simuladores reciben cada cambio por SSE', async () => {
    const base = await escuchar(await construirServidor({ registro: false }));
    const fuente = new FuenteCaos(base).iniciar();
    cierres.push(() => {
      fuente.detener();
      return Promise.resolve();
    });
    await pedir(base, 'PUT', { perfil: 'pagos-saturados' });
    await expect.poll(() => fuente.estado().perfil, { timeout: 3000 }).toBe('pagos-saturados');
    await pedir(base, 'DELETE');
    await expect.poll(() => fuente.estado().perfil, { timeout: 3000 }).toBe(null);
  });
});

describe('de punta a punta: chaos-control gobierna a sunat-sim', () => {
  async function entorno() {
    const control = await escuchar(await construirServidor({ registro: false }));
    const fuente = new FuenteCaos(control).iniciar();
    const sunat = await escuchar(await construirSunat({ registro: false, caos: fuente }));
    const enviar = (n: number, cabeceras: Record<string, string> = {}) => {
      const { nombreZip, zip } = emitir(factura(n));
      return fetch(`${sunat}/api/v1/comprobantes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...cabeceras },
        body: JSON.stringify({
          nombreArchivo: nombreZip,
          contenido: Buffer.from(zip).toString('base64'),
        }),
      });
    };
    const activar = async (cuerpo: unknown) => {
      const e = await json(await pedir(control, 'PUT', cuerpo));
      await expect
        .poll(() => JSON.stringify(fuente.estado()), { timeout: 3000 })
        .toBe(JSON.stringify(e));
    };
    return { control, sunat, enviar, activar, fuente };
  }

  test('sunat-caida: 503 en REST, fault 0100 en SOAP; al desactivar, todo vuelve', async () => {
    const { sunat, enviar, activar } = await entorno();
    await activar({ perfil: 'sunat-caida' });
    const r = await enviar(1);
    expect(r.status).toBe(503);
    expect(r.headers.get('x-chasqui-falla')).toBe('inyectada');
    const soap = await fetch(`${sunat}/billService`, {
      method: 'POST',
      headers: { 'content-type': 'text/xml' },
      body: '<x/>',
    });
    expect(await soap.text()).toContain('soap-env:Client.0100');
    expect((await fetch(`${sunat}/salud`)).status).toBe(200);
    await activar({
      reglas: [{ servicio: 'otro', porcentaje: 100, falla: { tipo: 'duplicado' } }],
    });
    expect(await json(await enviar(1))).toMatchObject({ estado: 'aceptado' });
  });

  test('fallas de negocio: rechazo forzado con CDR y duplicado forzado', async () => {
    const { enviar, activar } = await entorno();
    await activar({ reglas: [{ porcentaje: 100, falla: { tipo: 'rechazo', codigo: '2335' } }] });
    const r = await json(await enviar(2));
    expect(r).toMatchObject({ estado: 'rechazado', codigo: '2335' });
    expect(leerCdr(Buffer.from(r.cdr as string, 'base64')).codigo).toBe('2335');
    await activar({ reglas: [{ porcentaje: 100, falla: { tipo: 'duplicado' } }] });
    expect(await json(await enviar(3))).toMatchObject({ codigo: '1033' });
  });

  test('la cabecera X-Chasqui-Chaos aplica un perfil solo a esa petición', async () => {
    const { enviar } = await entorno();
    expect((await enviar(4, { 'x-chasqui-chaos': 'sunat-caida' })).status).toBe(503);
    expect((await enviar(4)).status).toBe(200);
  });

  test('con la misma semilla, la misma secuencia de fallas (reproducible en CI)', async () => {
    const corrida = async () => {
      const { enviar, activar } = await entorno();
      await activar({
        reglas: [{ porcentaje: 50, falla: { tipo: 'error5xx', estado: 503 } }],
        semilla: 'ci-1234',
      });
      const estados = [];
      for (let i = 1; i <= 12; i++)
        estados.push((await enviar(i, { 'idempotency-key': `k${String(i)}` })).status);
      for (const c of cierres.splice(0)) await c();
      return estados;
    };
    const a = await corrida();
    expect(await corrida()).toEqual(a);
    expect(a).toContain(503);
    expect(a).toContain(200);
  });
});

test('los botones «Probar» del panel también reciben el caos activo', async () => {
  const control = await escuchar(await construirServidor({ registro: false }));
  const fuente = new FuenteCaos(control).iniciar();
  cierres.push(() => {
    fuente.detener();
    return Promise.resolve();
  });
  const sunat = await escuchar(await construirSunat({ registro: false, caos: fuente }));
  await pedir(control, 'PUT', { perfil: 'sunat-caida' });
  await expect.poll(() => fuente.estado().perfil, { timeout: 3000 }).toBe('sunat-caida');
  const r = await json(
    await fetch(`${sunat}/_chasqui/demo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ escenario: 'valida' }),
    }),
  );
  expect(r).toMatchObject({ escenario: 'valida', http: 503, estado: 'falla' });
});
