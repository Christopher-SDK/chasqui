import { createHmac } from 'node:crypto';
import { createServer, type IncomingMessage } from 'node:http';
import type { AddressInfo } from 'node:net';
import { FuenteCaos } from '@chasqui/chaos-engine';
import { afterEach, describe, expect, test } from 'vitest';
import { BACKOFF_MS, enmascarar, firmarWebhook } from '../src/billetera.js';
import { abrirDb } from '../src/db.js';
import { crc16, leerQr, payloadQr } from '../src/qr.js';
import { construirServidor } from '../src/servidor.js';

const cierres: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const c of cierres.splice(0)) await c();
});

async function levantar(demora = 1500) {
  const reloj = { t: new Date('2026-11-04T15:00:00Z').getTime() };
  const caos = new FuenteCaos();
  const app = await construirServidor({
    db: abrirDb(':memory:'),
    registro: false,
    trabajador: false,
    ahora: () => new Date(reloj.t),
    demoraInterbilletera: demora,
    caos,
  });
  await app.listen({ port: 0, host: '127.0.0.1' });
  cierres.push(() => app.close());
  const base = `http://127.0.0.1:${String((app.server.address() as AddressInfo).port)}`;
  const pedir = async (
    metodo: string,
    ruta: string,
    cuerpo?: unknown,
    cabeceras: Record<string, string> = {},
  ) => {
    const r = await fetch(`${base}${ruta}`, {
      method: metodo,
      headers: { ...(cuerpo ? { 'content-type': 'application/json' } : {}), ...cabeceras },
      ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
    });
    return {
      status: r.status,
      cuerpo: (await r.json()) as Record<string, unknown>,
      cabeceras: r.headers,
    };
  };
  const transferir = (
    clave: string,
    cuerpo: Record<string, unknown>,
    extra: Record<string, string> = {},
  ) => pedir('POST', '/api/v1/transferencias', cuerpo, { 'idempotency-key': clave, ...extra });
  const saldo = async (cel: string) =>
    (await pedir('GET', `/api/v1/cuentas/${cel}/saldo`)).cuerpo.saldo;
  return {
    app,
    base,
    reloj,
    caos,
    pedir,
    transferir,
    saldo,
    avanzar: (ms: number) => (reloj.t += ms),
  };
}

// Cuentas sembradas: 9000000NN, impares en Billetera A y pares en Billetera B, S/ 1,000.00 cada una.
const A1 = '900000001';
const A3 = '900000003';
const B2 = '900000002';

describe('transferencias', () => {
  test('misma billetera: completada al instante y saldos actualizados', async () => {
    const s = await levantar();
    const r = await s.transferir('clave-0001', {
      origen: A1,
      destino: A3,
      monto: '25.50',
      descripcion: 'Almuerzo',
    });
    expect(r.status).toBe(201);
    expect(r.cuerpo).toMatchObject({ estado: 'completada', monto: '25.50', moneda: 'PEN' });
    expect(await s.saldo(A1)).toBe('974.50');
    expect(await s.saldo(A3)).toBe('1025.50');
  });

  test('entre billeteras: pendiente, con el monto reservado, y completada tras la demora', async () => {
    const s = await levantar();
    const r = await s.transferir('clave-0002', { origen: A1, destino: B2, monto: 100 });
    expect(r.cuerpo.estado).toBe('pendiente');
    expect(await s.saldo(A1)).toBe('900.00');
    expect(await s.saldo(B2)).toBe('1000.00');
    await s.app.pagos.tick();
    expect(
      (await s.pedir('GET', `/api/v1/transferencias/${String(r.cuerpo.id)}`)).cuerpo.estado,
    ).toBe('pendiente');
    s.avanzar(1500);
    await s.app.pagos.tick();
    expect(
      (await s.pedir('GET', `/api/v1/transferencias/${String(r.cuerpo.id)}`)).cuerpo.estado,
    ).toBe('completada');
    expect(await s.saldo(B2)).toBe('1100.00');
  });

  test.each([
    ['saldo insuficiente', { origen: A1, destino: A3, monto: '1000.01' }, 'LIMITE_OPERACION'],
    ['límite por operación', { origen: A1, destino: A3, monto: '500.01' }, 'LIMITE_OPERACION'],
    [
      'cuenta destino inexistente',
      { origen: A1, destino: '999999999', monto: 1 },
      'CUENTA_NO_EXISTE',
    ],
    ['misma cuenta', { origen: A1, destino: A1, monto: 1 }, 'MISMA_CUENTA'],
  ])('%s → rechazada (%s)', async (_, cuerpo, motivo) => {
    const s = await levantar();
    const r = await s.transferir(`clave-${motivo}`, cuerpo);
    expect(r.cuerpo).toMatchObject({ estado: 'rechazada', motivo });
    expect(await s.saldo(A1)).toBe('1000.00');
  });

  test('saldo insuficiente con límite holgado', async () => {
    const s = await levantar();
    await s.pedir('POST', '/api/v1/cuentas', {
      celular: '911111111',
      titular: 'Prueba Saldo',
      billetera: 'Billetera A',
      saldo: '5',
    });
    expect(
      (await s.transferir('clave-saldo', { origen: '911111111', destino: A1, monto: '5.01' }))
        .cuerpo.motivo,
    ).toBe('SALDO_INSUFICIENTE');
  });

  test('límite diario: la suma del día no puede pasar de S/ 2,000', async () => {
    const s = await levantar();
    await s.pedir('POST', '/api/v1/cuentas', {
      celular: '922222222',
      titular: 'Prueba Diario',
      billetera: 'Billetera A',
      saldo: '5000',
    });
    const estados = [];
    for (let i = 0; i < 5; i++)
      estados.push(
        (
          await s.transferir(`diario-${String(i)}`, {
            origen: '922222222',
            destino: A1,
            monto: 450,
          })
        ).cuerpo.estado,
      );
    expect(estados).toEqual(['completada', 'completada', 'completada', 'completada', 'rechazada']);
    s.avanzar(24 * 3600_000);
    expect(
      (await s.transferir('diario-manana', { origen: '922222222', destino: A1, monto: 450 })).cuerpo
        .estado,
    ).toBe('completada');
  });

  test('validación: Idempotency-Key obligatoria, monto con 2 decimales, celular de 9 dígitos', async () => {
    const s = await levantar();
    expect(
      (await s.pedir('POST', '/api/v1/transferencias', { origen: A1, destino: A3, monto: 1 }))
        .status,
    ).toBe(400);
    expect(
      (await s.transferir('clave-monto', { origen: A1, destino: A3, monto: '1.001' })).status,
    ).toBe(400);
    expect(
      (await s.transferir('clave-cel', { origen: '12345', destino: A3, monto: 1 })).status,
    ).toBe(400);
  });
});

describe('idempotencia', () => {
  test('misma clave y mismo cuerpo: misma transferencia, sin cobrar dos veces', async () => {
    const s = await levantar();
    const cuerpo = { origen: A1, destino: A3, monto: 10 };
    const a = await s.transferir('idem-0001', cuerpo);
    const b = await s.transferir('idem-0001', cuerpo);
    expect(b.status).toBe(200);
    expect(b.cabeceras.get('idempotent-replayed')).toBe('true');
    expect(b.cuerpo.id).toBe(a.cuerpo.id);
    expect(await s.saldo(A1)).toBe('990.00');
  });

  test('misma clave con otro cuerpo → 422', async () => {
    const s = await levantar();
    await s.transferir('idem-0002', { origen: A1, destino: A3, monto: 10 });
    expect(await s.transferir('idem-0002', { origen: A1, destino: A3, monto: 11 })).toMatchObject({
      status: 422,
      cuerpo: { codigo: 'IDEMPOTENCIA_CONFLICTO' },
    });
  });

  test('10 peticiones concurrentes con la misma clave: una sola transferencia', async () => {
    const s = await levantar();
    const rs = await Promise.all(
      Array.from({ length: 10 }, () =>
        s.transferir('idem-carrera', { origen: A1, destino: A3, monto: 7 }),
      ),
    );
    expect(new Set(rs.map((r) => r.cuerpo.id)).size).toBe(1);
    expect(rs.every((r) => r.status === 200 || r.status === 201)).toBe(true);
    expect(await s.saldo(A1)).toBe('993.00');
  });
});

describe('reversión', () => {
  test('completada → revertida; el dinero vuelve; no se revierte dos veces', async () => {
    const s = await levantar();
    const t = await s.transferir('rev-0001', { origen: A1, destino: A3, monto: 30 });
    const id = String(t.cuerpo.id);
    expect((await s.pedir('POST', `/api/v1/transferencias/${id}/reversion`)).cuerpo.estado).toBe(
      'revertida',
    );
    expect(await s.saldo(A1)).toBe('1000.00');
    expect((await s.pedir('POST', `/api/v1/transferencias/${id}/reversion`)).status).toBe(422);
    expect((await s.pedir('POST', '/api/v1/transferencias/trf_x/reversion')).status).toBe(404);
  });

  test('no se revierte si el destino ya gastó el dinero', async () => {
    const s = await levantar();
    await s.pedir('POST', '/api/v1/cuentas', {
      celular: '933333333',
      titular: 'Destino Gastador',
      billetera: 'Billetera A',
    });
    const t = await s.transferir('rev-0002', { origen: A1, destino: '933333333', monto: 50 });
    await s.transferir('rev-0003', { origen: '933333333', destino: A3, monto: 50 });
    expect(
      await s.pedir('POST', `/api/v1/transferencias/${String(t.cuerpo.id)}/reversion`),
    ).toMatchObject({ status: 422, cuerpo: { codigo: 'SALDO_INSUFICIENTE_DESTINO' } });
  });
});

describe('cuentas', () => {
  test('consulta de titular enmascarado, cuenta inexistente y alta duplicada', async () => {
    const s = await levantar();
    const c = await s.pedir('GET', `/api/v1/cuentas/${A1}`);
    expect(c.cuerpo).toMatchObject({ celular: A1, billetera: 'Billetera A' });
    expect(String(c.cuerpo.titular)).toMatch(/^[A-Z][a-z]+ [A-Z]\. [A-Z]\.$/);
    expect((await s.pedir('GET', '/api/v1/cuentas/999999999')).status).toBe(404);
    expect(
      (
        await s.pedir('POST', '/api/v1/cuentas', {
          celular: A1,
          titular: 'Otro',
          billetera: 'Billetera A',
        })
      ).status,
    ).toBe(409);
    expect(enmascarar('ANA QUISPE FLORES')).toBe('Ana Q. F.');
    const todas = (await fetch(`${s.base}/api/v1/cuentas`).then((x) => x.json())) as {
      saldo: string;
    }[];
    expect(todas).toHaveLength(10);
    expect(todas[0]).toMatchObject({ celular: A1, saldo: '1000.00' });
  });
});

describe('cobros QR', () => {
  test('payload tipo EMVCo con CRC válido, pago y estado «pagado»', async () => {
    const s = await levantar();
    const cobro = await s.pedir('POST', '/api/v1/cobros', {
      destino: A3,
      monto: '12.90',
      descripcion: 'Café',
    });
    expect(cobro.status).toBe(201);
    expect(String(cobro.cuerpo.qrPng)).toMatch(/^data:image\/png;base64,/);
    const qr = leerQr(String(cobro.cuerpo.payload));
    expect(qr.valido).toBe(true);
    expect(qr.campos).toMatchObject({
      '00': '01',
      '01': '12',
      '53': '604',
      '54': '12.90',
      '58': 'PE',
    });
    const pago = await s.pedir(
      'POST',
      `/api/v1/cobros/${String(cobro.cuerpo.id)}/pago`,
      { origen: A1 },
      { 'idempotency-key': 'pago-qr-01' },
    );
    expect(pago.cuerpo).toMatchObject({
      estado: 'completada',
      monto: '12.90',
      cobroId: cobro.cuerpo.id,
    });
    expect(
      (
        await s.pedir(
          'POST',
          `/api/v1/cobros/${String(cobro.cuerpo.id)}/pago`,
          { origen: A1 },
          { 'idempotency-key': 'pago-qr-02' },
        )
      ).cuerpo.codigo,
    ).toBe('COBRO_PAGADO');
  });

  test('QR estático: el pagador indica el monto', async () => {
    const s = await levantar();
    const cobro = await s.pedir('POST', '/api/v1/cobros', { destino: A3 });
    expect(leerQr(String(cobro.cuerpo.payload)).campos['01']).toBe('11');
    const sinMonto = await s.pedir(
      'POST',
      `/api/v1/cobros/${String(cobro.cuerpo.id)}/pago`,
      { origen: A1 },
      { 'idempotency-key': 'pago-qr-03' },
    );
    expect(sinMonto.cuerpo.codigo).toBe('MONTO_REQUERIDO');
    expect(
      (
        await s.pedir(
          'POST',
          `/api/v1/cobros/${String(cobro.cuerpo.id)}/pago`,
          { origen: A1, monto: 3 },
          { 'idempotency-key': 'pago-qr-04' },
        )
      ).cuerpo.estado,
    ).toBe('completada');
    expect((await s.pedir('POST', '/api/v1/cobros', { destino: '999999999' })).status).toBe(404);
  });

  test('CRC16-CCITT con el vector estándar y detección de alteración', () => {
    expect(crc16('123456789')).toBe('29B1');
    const p = payloadQr({ celular: A3, titular: 'X', monto: 100, referencia: 'r' });
    expect(leerQr(p).valido).toBe(true);
    expect(leerQr(p.replace('1.00', '9.00')).valido).toBe(false);
  });
});

describe('webhooks firmados con reintentos', () => {
  /** Receptor de webhooks: responde con los códigos de `respuestas` y guarda lo recibido. */
  async function receptor(respuestas: number[]) {
    const recibidos: { cuerpo: string; firma: string; evento: string }[] = [];
    const srv = createServer((req: IncomingMessage, res) => {
      let cuerpo = '';
      req.on('data', (c: Buffer) => (cuerpo += c.toString()));
      req.on('end', () => {
        recibidos.push({
          cuerpo,
          firma: String(req.headers['x-chasqui-firma']),
          evento: String(req.headers['x-chasqui-evento']),
        });
        res.writeHead(respuestas.shift() ?? 200).end();
      });
    });
    await new Promise<void>((ok) => srv.listen(0, '127.0.0.1', ok));
    cierres.push(() => new Promise((ok) => srv.close(ok)));
    return {
      url: `http://127.0.0.1:${String((srv.address() as AddressInfo).port)}/hook`,
      recibidos,
    };
  }

  test('la firma HMAC verifica y los fallos se reintentan con backoff', async () => {
    const s = await levantar();
    const r = await receptor([500, 503, 200]);
    const sub = await s.pedir('POST', '/api/v1/webhooks', { url: r.url });
    const secreto = String(sub.cuerpo.secreto);
    await s.transferir('whk-0001', { origen: A1, destino: A3, monto: 5 });

    await s.app.pagos.tick(); // intento 1 → 500
    s.avanzar(BACKOFF_MS[0] - 1);
    await s.app.pagos.tick(); // aún no toca
    expect(r.recibidos).toHaveLength(1);
    s.avanzar(1);
    await s.app.pagos.tick(); // intento 2 → 503
    s.avanzar(BACKOFF_MS[1]);
    await s.app.pagos.tick(); // intento 3 → 200
    expect(r.recibidos).toHaveLength(3);

    const ultimo = r.recibidos[2];
    if (!ultimo) throw new Error('sin entrega');
    expect(ultimo.evento).toBe('transferencia.completada');
    const [t, v1] = ultimo.firma.replace('t=', '').split(',v1=');
    const esperada = createHmac('sha256', secreto)
      .update(`${String(t)}.${ultimo.cuerpo}`)
      .digest('hex');
    expect(v1).toBe(esperada);
    expect(firmarWebhook(secreto, ultimo.cuerpo, Number(t))).toBe(ultimo.firma);
    const entregas = (await fetch(`${s.base}/api/v1/webhooks/entregas`).then((x) => x.json())) as {
      estado: string;
      intentos: number;
    }[];
    expect(entregas[0]).toMatchObject({ estado: 'entregada', intentos: 3 });
  });

  test('tras 6 intentos fallidos la entrega queda «fallida»', async () => {
    const s = await levantar();
    const r = await receptor(Array.from({ length: 10 }, () => 500));
    await s.pedir('POST', '/api/v1/webhooks', { url: r.url });
    await s.transferir('whk-0002', { origen: A1, destino: A3, monto: 5 });
    for (let i = 0; i < 8; i++) {
      await s.app.pagos.tick();
      s.avanzar(20_000);
    }
    expect(r.recibidos).toHaveLength(6);
    const entregas = (await fetch(`${s.base}/api/v1/webhooks/entregas`).then((x) => x.json())) as {
      estado: string;
      ultimoError: string;
    }[];
    expect(entregas[0]).toMatchObject({ estado: 'fallida', ultimoError: 'HTTP 500' });
  });

  test('rechazos y reversiones también se notifican', async () => {
    const s = await levantar();
    const r = await receptor([]);
    await s.pedir('POST', '/api/v1/webhooks', { url: r.url });
    await s.transferir('whk-0003', { origen: A1, destino: A1, monto: 1 });
    const t = await s.transferir('whk-0004', { origen: A1, destino: A3, monto: 1 });
    await s.pedir('POST', `/api/v1/transferencias/${String(t.cuerpo.id)}/reversion`);
    await s.app.pagos.tick();
    expect(r.recibidos.map((x) => x.evento).sort()).toEqual([
      'transferencia.completada',
      'transferencia.rechazada',
      'transferencia.revertida',
    ]);
  });
});

describe('caos en pagos', () => {
  test('rechazo forzado, transferencia eterna y rate limiting de pagos-saturados', async () => {
    const s = await levantar();
    s.caos.fijar({
      perfil: null,
      reglas: [{ porcentaje: 100, falla: { tipo: 'rechazo', codigo: 'X' } }],
      semilla: 's',
    });
    expect(
      (await s.transferir('caos-0001', { origen: A1, destino: A3, monto: 1 })).cuerpo,
    ).toMatchObject({ estado: 'rechazada', motivo: 'RECHAZO_SIMULADO' });
    s.caos.fijar({
      perfil: null,
      reglas: [{ porcentaje: 100, falla: { tipo: 'ticketEterno' } }],
      semilla: 's',
    });
    const eterna = await s.transferir('caos-0002', { origen: A1, destino: B2, monto: 1 });
    s.avanzar(3600_000);
    await s.app.pagos.tick();
    expect(
      (await s.pedir('GET', `/api/v1/transferencias/${String(eterna.cuerpo.id)}`)).cuerpo.estado,
    ).toBe('pendiente');
    s.caos.fijar({
      perfil: null,
      reglas: [
        { servicio: 'pagos-sim', porcentaje: 100, falla: { tipo: 'rateLimit', porSegundo: 5 } },
      ],
      semilla: 's',
    });
    const saturado = [];
    for (let i = 0; i < 7; i++)
      saturado.push((await s.pedir('GET', `/api/v1/cuentas/${A1}`)).status);
    expect(saturado).toEqual([200, 200, 200, 200, 200, 429, 429]);
    s.avanzar(1000);
    expect((await s.pedir('GET', `/api/v1/cuentas/${A1}`)).status).toBe(200);
  });
});
