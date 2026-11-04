import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import fc from 'fast-check';
import Fastify from 'fastify';
import { afterEach, describe, expect, test } from 'vitest';
import {
  azar,
  CabeceraInvalida,
  decidir,
  FuenteCaos,
  milisegundos,
  PERFILES,
  registrarCaos,
  reglasEfectivas,
  SIN_CAOS,
  type EstadoCaos,
  type EventoFalla,
  type Regla,
} from '../src/index.js';

const estado = (reglas: Regla[], semilla = 'semilla-fija'): EstadoCaos => ({
  perfil: null,
  reglas,
  semilla,
});
const peticion = (
  clave: string,
  extra: Partial<{ servicio: string; ruta: string; cabecera: string }> = {},
) => ({
  servicio: 'sunat-sim',
  ruta: '/api/v1/comprobantes',
  clave,
  ...extra,
});

describe('decisión determinista', () => {
  test('azar está en [0, 1) y no depende del orden de llamada', () => {
    const a = ['x', 'y', 'z'].map((k) => azar('s', k));
    const b = ['z', 'y', 'x'].map((k) => azar('s', k)).reverse();
    expect(a).toEqual(b);
    for (const v of a) expect(v).toBeGreaterThanOrEqual(0);
    for (const v of a) expect(v).toBeLessThan(1);
    expect(azar('s', 'x')).not.toBe(azar('otra', 'x'));
  });

  test('la frecuencia de inyección converge al porcentaje configurado (property)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.string({ minLength: 1, maxLength: 8 }),
        (p, semilla) => {
          const e = estado([{ porcentaje: p, falla: { tipo: 'error5xx', estado: 503 } }], semilla);
          const n = 2000;
          let fallas = 0;
          for (let i = 0; i < n; i++) fallas += decidir(e, peticion(String(i))).length;
          expect(Math.abs(fallas / n - p / 100)).toBeLessThan(0.05);
          if (p === 0) expect(fallas).toBe(0);
          if (p === 100) expect(fallas).toBe(n);
        },
      ),
      { seed: 20261104, numRuns: 25 },
    );
  });

  test('filtra por servicio y por prefijo de ruta', () => {
    const e = estado([
      { servicio: 'pagos-sim', porcentaje: 100, falla: { tipo: 'duplicado' } },
      { ruta: '/billService', porcentaje: 100, falla: { tipo: 'soapFault', codigo: '0100' } },
    ]);
    expect(decidir(e, peticion('1'))).toEqual([]);
    expect(decidir(e, peticion('1', { servicio: 'pagos-sim' }))).toEqual([{ tipo: 'duplicado' }]);
    expect(decidir(e, peticion('1', { ruta: '/billService' }))).toEqual([
      { tipo: 'soapFault', codigo: '0100' },
    ]);
  });

  test('cabecera X-Chasqui-Chaos: perfil, falla puntual, ninguno o inválida', () => {
    const e = estado([{ porcentaje: 100, falla: { tipo: 'duplicado' } }]);
    expect(reglasEfectivas(e)).toBe(e.reglas);
    expect(reglasEfectivas(e, '')).toBe(e.reglas);
    expect(reglasEfectivas(e, 'ninguno')).toEqual([]);
    expect(reglasEfectivas(e, 'falla:error5xx')).toEqual([
      { porcentaje: 100, falla: { tipo: 'error5xx', estado: 503 } },
    ]);
    expect(reglasEfectivas(e, 'sunat-caida')).toBe(
      PERFILES.find((p) => p.nombre === 'sunat-caida')?.reglas,
    );
    expect(() => reglasEfectivas(e, 'falla:volcan')).toThrow(CabeceraInvalida);
    expect(() => reglasEfectivas(e, 'perfil-inexistente')).toThrow(/Perfil desconocido/);
  });

  test('latencia fija o en rango, también con el rango invertido', () => {
    expect(milisegundos(250, 's', 'k')).toBe(250);
    const v = milisegundos([100, 200], 's', 'k');
    expect(v).toBeGreaterThanOrEqual(100);
    expect(v).toBeLessThanOrEqual(200);
    expect(milisegundos([200, 100], 's', 'k')).toBe(v);
    expect(milisegundos([7, 7], 's', 'k')).toBe(7);
  });

  test('los perfiles predefinidos son válidos y únicos', () => {
    expect(PERFILES.map((p) => p.nombre)).toEqual([
      'cierre-de-mes',
      'sunat-caida',
      'red-inestable',
      'pagos-saturados',
    ]);
  });
});

describe('plugin sobre un servidor real', () => {
  let cerrar: (() => Promise<void>) | undefined;
  afterEach(async () => {
    await cerrar?.();
  });

  async function levantar(reglas: Regla[], extra: { reloj?: { t: number } } = {}) {
    const eventos: EventoFalla[] = [];
    const esperas: number[] = [];
    const app = Fastify({ forceCloseConnections: true });
    const e = estado(reglas);
    registrarCaos(app, {
      servicio: 'sunat-sim',
      estado: () => e,
      ...(extra.reloj ? { ahora: () => extra.reloj?.t ?? 0 } : {}),
      dormir: (ms) => {
        esperas.push(ms);
        return Promise.resolve();
      },
      alInyectar: (ev) => eventos.push(ev),
    });
    app.get('/api/v1/eco', (req) => ({
      ok: true,
      caos: req.caos.map((f) => f.tipo),
      relleno: 'x'.repeat(200),
    }));
    app.get('/salud', () => ({ estado: 'ok' }));
    await app.listen({ port: 0, host: '127.0.0.1' });
    const base = `http://127.0.0.1:${String((app.server.address() as AddressInfo).port)}`;
    cerrar = () => app.close();
    return { base, eventos, esperas };
  }

  test('sin reglas responde normal y marca la petición sin caos', async () => {
    const { base } = await levantar([]);
    expect(await (await fetch(`${base}/api/v1/eco`)).json()).toMatchObject({ ok: true, caos: [] });
  });

  test('latencia: espera los milisegundos indicados y responde', async () => {
    const { base, esperas, eventos } = await levantar([
      { porcentaje: 100, falla: { tipo: 'latencia', ms: 1234 } },
    ]);
    expect((await fetch(`${base}/api/v1/eco`)).status).toBe(200);
    expect(esperas).toEqual([1234]);
    expect(eventos[0]).toMatchObject({
      servicio: 'sunat-sim',
      falla: 'latencia',
      detalle: '1234 ms',
      metodo: 'GET',
    });
  });

  test('error 5xx y SOAP fault con cabecera de falla inyectada', async () => {
    const a = await levantar([{ porcentaje: 100, falla: { tipo: 'error5xx', estado: 502 } }]);
    const r = await fetch(`${a.base}/api/v1/eco`);
    expect(r.status).toBe(502);
    expect(r.headers.get('x-chasqui-falla')).toBe('inyectada');
    await cerrar?.();
    const b = await levantar([{ porcentaje: 100, falla: { tipo: 'soapFault', codigo: '0100' } }]);
    const s = await fetch(`${b.base}/api/v1/eco`);
    expect(s.status).toBe(500);
    expect(await s.text()).toContain('<faultcode>soap-env:Client.0100</faultcode>');
  });

  test('timeout: la conexión se corta sin respuesta', async () => {
    const { base, esperas } = await levantar([
      { porcentaje: 100, falla: { tipo: 'timeout', ms: 30_000 } },
    ]);
    await expect(fetch(`${base}/api/v1/eco`)).rejects.toThrow();
    expect(esperas).toEqual([30_000]);
  });

  test('malformada: cuerpo truncado que no se puede parsear', async () => {
    const { base } = await levantar([{ porcentaje: 100, falla: { tipo: 'malformada' } }]);
    const r = await fetch(`${base}/api/v1/eco`);
    const texto = await r.text();
    expect(r.headers.get('x-chasqui-falla')).toBe('inyectada');
    expect(texto).toContain('<<truncado');
    expect(() => JSON.parse(texto) as unknown).toThrow();
  });

  test('desconexión: se anuncia el largo completo y se corta a mitad del cuerpo', async () => {
    const { base } = await levantar([{ porcentaje: 100, falla: { tipo: 'desconexion' } }]);
    const r = await fetch(`${base}/api/v1/eco`);
    await expect(r.text()).rejects.toThrow();
  });

  test('rate limiting: el exceso por segundo recibe 429 y la ventana se renueva', async () => {
    const reloj = { t: 1_000_000 };
    const { base } = await levantar(
      [{ porcentaje: 100, falla: { tipo: 'rateLimit', porSegundo: 2 } }],
      { reloj },
    );
    const estados = [];
    for (let i = 0; i < 3; i++) estados.push((await fetch(`${base}/api/v1/eco`)).status);
    expect(estados).toEqual([200, 200, 429]);
    reloj.t += 1000;
    expect((await fetch(`${base}/api/v1/eco`)).status).toBe(200);
  });

  test('fallas de negocio llegan al simulador en req.caos', async () => {
    const { base } = await levantar([
      { porcentaje: 100, falla: { tipo: 'rechazo', codigo: '2335' } },
      { porcentaje: 100, falla: { tipo: 'ticketEterno' } },
    ]);
    expect(await (await fetch(`${base}/api/v1/eco`)).json()).toMatchObject({
      caos: ['rechazo', 'ticketEterno'],
    });
  });

  test('cabecera: falla puntual, ninguno, inválida; las rutas excluidas no reciben caos', async () => {
    const { base } = await levantar([
      { porcentaje: 100, falla: { tipo: 'error5xx', estado: 503 } },
    ]);
    expect(
      (await fetch(`${base}/api/v1/eco`, { headers: { 'x-chasqui-chaos': 'ninguno' } })).status,
    ).toBe(200);
    expect(
      (await fetch(`${base}/api/v1/eco`, { headers: { 'x-chasqui-chaos': 'falla:error5xx' } }))
        .status,
    ).toBe(503);
    expect(
      (await fetch(`${base}/api/v1/eco`, { headers: { 'x-chasqui-chaos': 'volcan' } })).status,
    ).toBe(400);
    expect((await fetch(`${base}/salud`)).status).toBe(200);
  });

  test('el intento n de una clave decide igual en cada corrida; los reintentos pueden sanar', async () => {
    const reglas = [{ porcentaje: 50, falla: { tipo: 'error5xx' as const, estado: 503 as const } }];
    const corrida = async () => {
      const { base } = await levantar(reglas);
      const estados: number[] = [];
      for (const k of ['a', 'b', 'c', 'd', 'e', 'f'])
        for (let intento = 0; intento < 4; intento++)
          estados.push(
            (await fetch(`${base}/api/v1/eco`, { headers: { 'idempotency-key': k } })).status,
          );
      return estados;
    };
    const primera = await corrida();
    expect(await corrida()).toEqual(primera);
    // Alguna clave falla y luego responde bien en un reintento.
    const porClave = Array.from({ length: 6 }, (_, i) => primera.slice(i * 4, i * 4 + 4));
    expect(porClave.some((e) => e.includes(503) && e.includes(200))).toBe(true);
  });
});

describe('FuenteCaos', () => {
  test('sin URL usa el estado local y valida lo que se fija', () => {
    const f = new FuenteCaos().iniciar();
    expect(f.estado()).toEqual(SIN_CAOS);
    f.fijar({ perfil: 'x', reglas: [], semilla: 's' });
    expect(f.estado().perfil).toBe('x');
    expect(() => {
      f.fijar({
        perfil: null,
        reglas: [{ porcentaje: 500, falla: { tipo: 'duplicado' } }],
        semilla: 's',
      });
    }).toThrow();
    f.detener();
  });

  test('recibe el estado por SSE y reconecta si el servidor no está', async () => {
    const nuevo: EstadoCaos = {
      perfil: 'sunat-caida',
      reglas: [{ porcentaje: 100, falla: { tipo: 'duplicado' } }],
      semilla: 'k',
    };
    const servidor = createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      res.write(`: hola\n\ndata: ${JSON.stringify(nuevo)}\n\n`);
    });
    await new Promise<void>((ok) => servidor.listen(0, '127.0.0.1', ok));
    const puerto = (servidor.address() as AddressInfo).port;
    const f = new FuenteCaos(`http://127.0.0.1:${String(puerto)}`).iniciar();
    await expect.poll(() => f.estado().perfil, { timeout: 3000 }).toBe('sunat-caida');
    f.detener();
    servidor.closeAllConnections();
    await new Promise((ok) => servidor.close(ok));

    const caida = new FuenteCaos('http://127.0.0.1:1').iniciar();
    await new Promise((ok) => setTimeout(ok, 50));
    expect(caida.estado()).toEqual(SIN_CAOS);
    caida.detener();
  });
});
