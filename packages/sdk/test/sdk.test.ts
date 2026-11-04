import { createHmac } from 'node:crypto';
import { levantarEcosistema, type Ecosistema } from '@chasqui/ecosistema';
import { rucEmpresa } from '@chasqui/test-kit';
import type { Emisor } from '@chasqui/ubl-core';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  boleta,
  Chasqui,
  ErrorChasqui,
  factura,
  notaCredito,
  notaDebito,
  verificarWebhook,
} from '../src/index.js';

const emisor: Emisor = {
  ruc: '20000000001',
  razonSocial: 'COMERCIAL CHASQUI DEMO S.A.C.',
  direccion: {
    ubigeo: '150101',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LIMA',
    linea: 'AV. FICTICIA 123',
  },
};
const RUC_CLIENTE = rucEmpresa(42);

let eco: Ecosistema;
let chasqui: Chasqui;
beforeAll(async () => {
  eco = await levantarEcosistema({ pagos: { demoraInterbilletera: 100 } });
  chasqui = new Chasqui({ ...eco.urls, esperaBase: 20 });
});
afterAll(() => eco.cerrar());

/** El caos llega a los servicios por SSE: se espera a que la condición se cumpla. */
async function hasta(cond: () => Promise<boolean>, ms = 3000) {
  const fin = Date.now() + ms;
  while (!(await cond())) {
    if (Date.now() > fin) throw new Error('la condición no se cumplió a tiempo');
    await new Promise((ok) => setTimeout(ok, 25));
  }
}

describe('builders', () => {
  test('construyen un comprobante completo y fallan pronto si falta algo', () => {
    const f = factura()
      .serie('F001', 1)
      .fecha('2026-11-04', '10:00:00')
      .emisor(emisor)
      .cliente(RUC_CLIENTE, 'CLIENTE S.A.C.')
      .item('Café', 2, '8.50')
      .construir();
    expect(f).toMatchObject({
      tipo: '01',
      serie: 'F001',
      moneda: 'PEN',
      cliente: { tipoDocumento: '6' },
      items: [{ unidad: 'NIU', afectacion: '10' }],
    });
    expect(
      boleta()
        .cliente('12345678', 'ANA')
        .emisor(emisor)
        .serie('B001', 1)
        .item('x', 1, 1)
        .construir().cliente.tipoDocumento,
    ).toBe('1');
    const nd = notaDebito()
      .serie('FD01', 1)
      .moneda('USD')
      .emisor(emisor)
      .cliente('A1', 'X', '0')
      .item('x', 1, 1)
      .modifica({ tipo: '01', serieNumero: 'F001-1' }, '01', 'Intereses')
      .construir();
    expect(nd).toMatchObject({
      tipo: '08',
      moneda: 'USD',
      cliente: { tipoDocumento: '0' },
      motivo: '01',
    });
    expect(() => factura().serie('F001', 1).construir()).toThrow(/falta emisor, cliente, items/);
    expect(() =>
      notaCredito()
        .serie('FC01', 1)
        .emisor(emisor)
        .cliente(RUC_CLIENTE, 'X')
        .item('x', 1, 1)
        .construir(),
    ).toThrow(/referencia/);
  });
});

describe('sunat', () => {
  test('envía una factura construida con el builder y consulta su estado', async () => {
    const f = factura()
      .serie('F001', 10)
      .emisor(emisor)
      .cliente(RUC_CLIENTE, 'CLIENTE S.A.C.')
      .item('Café', 2, '8.50')
      .item('Libro', 1, '40', { afectacion: '20' })
      .construir();
    const r = await chasqui.sunat.enviar(f);
    expect(r).toMatchObject({ estado: 'aceptado', codigo: '0' });
    expect((await chasqui.sunat.estado(emisor.ruc, '01', 'F001', 10)).estado).toBe('aceptado');
    const nc = notaCredito()
      .serie('FC01', 1)
      .emisor(emisor)
      .cliente(RUC_CLIENTE, 'CLIENTE S.A.C.')
      .item('Café', 1, '8.50')
      .modifica({ tipo: '01', serieNumero: 'F001-10' }, '07', 'Devolución')
      .construir();
    expect((await chasqui.sunat.enviar(nc)).estado).toBe('aceptado');
  });

  test('un duplicado es una excepción (ErrorChasqui con el código 1033)', async () => {
    const f = factura()
      .serie('F001', 11)
      .emisor(emisor)
      .cliente(RUC_CLIENTE, 'CLIENTE S.A.C.')
      .item('x', 1, 10)
      .construir();
    await chasqui.sunat.enviar(f);
    await expect(chasqui.sunat.enviar(f)).rejects.toMatchObject({
      name: 'ErrorChasqui',
      status: 400,
      codigo: '1033',
    });
  });
});

describe('pagos', () => {
  test('transferencia entre billeteras: pendiente y luego completada', async () => {
    const t = await chasqui.pagos.transferir({
      origen: '900000001',
      destino: '900000002',
      monto: '15.00',
    });
    expect(t.estado).toBe('pendiente');
    expect((await chasqui.pagos.esperar(t.id)).estado).toBe('completada');
  });

  test('cobro QR pagado desde otra cuenta', async () => {
    const c = await chasqui.pagos.cobrar({ destino: '900000003', monto: '9.90' });
    const t = await chasqui.pagos.pagarCobro(c.id, '900000005');
    expect(t).toMatchObject({ estado: 'completada', cobroId: c.id });
  });

  test('consulta, revierte y suscribe webhooks', async () => {
    const t = await chasqui.pagos.transferir({
      origen: '900000001',
      destino: '900000003',
      monto: 2,
      descripcion: 'x',
    });
    expect((await chasqui.pagos.transferencia(t.id)).id).toBe(t.id);
    expect((await chasqui.pagos.revertir(t.id)).estado).toBe('revertida');
    expect((await chasqui.pagos.suscribir('http://127.0.0.1:9/hook')).secreto).toMatch(/^whsec_/);
  });

  test('un error de negocio no se reintenta', async () => {
    const e = await chasqui.pagos.revertir('trf_inexistente').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErrorChasqui);
    expect(e).toMatchObject({ status: 404, codigo: 'NO_ENCONTRADA' });
  });
});

describe('identidad', () => {
  test('consulta RUC y DNI', async () => {
    expect((await chasqui.identidad.ruc(RUC_CLIENTE)).ruc).toBe(RUC_CLIENTE);
    expect(await chasqui.identidad.dni('12345678')).toHaveProperty('nombres');
    await expect(chasqui.identidad.ruc('20000000002')).rejects.toMatchObject({
      codigo: 'RUC_INVALIDO',
    });
  });
});

describe('chaos', () => {
  test('chaos.con activa un perfil y lo desactiva al terminar, aunque falle', async () => {
    await expect(
      chasqui.chaos.con('sunat-caida', async () => {
        expect((await chasqui.chaos.estado()).perfil).toBe('sunat-caida');
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect((await chasqui.chaos.estado()).perfil).toBeNull();
  });

  test('con 5xx intermitentes, el SDK reintenta con la MISMA Idempotency-Key: un solo cobro', async () => {
    const saldo0 = Number(await chasqui.pagos.saldo('900000007'));
    // El 60 % de las peticiones a pagos-sim falla con 503; la semilla hace la secuencia reproducible.
    await chasqui.chaos.activar(
      [{ servicio: 'pagos-sim', porcentaje: 60, falla: { tipo: 'error5xx', estado: 503 } }],
      'sdk-reintentos',
    );
    const sinReintentos = new Chasqui({ ...eco.urls, reintentos: 0 });
    await hasta(
      async () =>
        (await sinReintentos.identidad.ruc(RUC_CLIENTE).then(() => true)) &&
        (await sinReintentos.pagos.saldo('900000001').then(
          () => false,
          () => true,
        )),
    );
    const resistente = new Chasqui({ ...eco.urls, reintentos: 8, esperaBase: 5 });
    const clave = 'sdk-clave-unica-0001';
    const t = await resistente.pagos.transferir(
      { origen: '900000007', destino: '900000009', monto: 1 },
      clave,
    );
    await chasqui.chaos.desactivar();
    await hasta(async () =>
      sinReintentos.pagos.saldo('900000007').then(
        () => true,
        () => false,
      ),
    );
    expect(t.estado).toBe('completada');
    expect(Number(await chasqui.pagos.saldo('900000007'))).toBe(saldo0 - 1);
  });

  test('sin reintentos, la falla llega al cliente como ErrorChasqui 503', async () => {
    const cliente = new Chasqui({
      ...eco.urls,
      reintentos: 0,
      cabeceras: { 'x-chasqui-chaos': 'falla:error5xx' },
    });
    await expect(cliente.identidad.dni('12345678')).rejects.toMatchObject({ status: 503 });
  });
});

describe('verificarWebhook', () => {
  const secreto = 'whsec_prueba';
  const cuerpo = '{"evento":"transferencia.completada"}';
  const firmar = (t: number, s = secreto) =>
    `t=${String(t)},v1=${createHmac('sha256', s)
      .update(`${String(t)}.${cuerpo}`)
      .digest('hex')}`;
  const ahora = 1_793_800_000_000;

  test('acepta la firma válida y rechaza secreto, cuerpo, formato o antigüedad incorrectos', () => {
    const t = ahora / 1000;
    expect(verificarWebhook(secreto, cuerpo, firmar(t), 300, ahora)).toBe(true);
    expect(verificarWebhook(secreto, cuerpo, firmar(t, 'otro'), 300, ahora)).toBe(false);
    expect(verificarWebhook(secreto, `${cuerpo} `, firmar(t), 300, ahora)).toBe(false);
    expect(verificarWebhook(secreto, cuerpo, firmar(t - 301), 300, ahora)).toBe(false);
    expect(verificarWebhook(secreto, cuerpo, 'v1=abc', 300, ahora)).toBe(false);
  });
});
