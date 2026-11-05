import { levantarEcosistema, type Ecosistema } from '@chasqui/ecosistema';
import { contribuyenteFicticio, rucEmpresa } from '@chasqui/test-kit';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { construirServidor } from '../src/servidor.js';

let eco: Ecosistema;
let tienda: Awaited<ReturnType<typeof construirServidor>>;
beforeAll(async () => {
  eco = await levantarEcosistema({ pagos: { demoraInterbilletera: 50 } });
  tienda = await construirServidor({ registro: false, chasqui: { ...eco.urls, esperaBase: 10 } });
});
afterAll(async () => {
  await tienda.close();
  await eco.cerrar();
});

const pedir = (cuerpo: Record<string, unknown>, clave?: string) =>
  tienda.inject({
    method: 'POST',
    url: '/api/pedidos',
    payload: cuerpo,
    headers: clave ? { 'idempotency-key': clave } : {},
  });
const base = {
  tipo: 'boleta',
  documento: '12345678',
  nombre: 'CLIENTE FICTICIO',
  celular: '900000001',
  items: [
    { id: 'cafe', cantidad: 2 },
    { id: 'libro', cantidad: 1 },
  ],
};

/** RUC ficticios por estado, buscados en el dataset determinista (y que identidad-sim conoce). */
const rucCon = async (f: (c: ReturnType<typeof contribuyenteFicticio>) => boolean) => {
  for (let i = 0; ; i++) {
    const r = rucEmpresa(i);
    if (f(contribuyenteFicticio(r)) && (await fetch(`${eco.urls.identidad}/api/v1/ruc/${r}`)).ok)
      return r;
  }
};

describe('tienda-demo', () => {
  test('boleta: cobra el total con IGV y emite el comprobante', async () => {
    const r = await pedir(base, 'pedido-boleta-1');
    expect(r.statusCode).toBe(201);
    // 2 × 21.10 × 1.18 = 49.80 (gravado) + 35.00 (exonerado) = 84.80
    expect(r.json()).toMatchObject({
      estado: 'completado',
      total: '84.80',
      numero: 'B001-1',
      comprobante: { estado: 'aceptado' },
      pago: { estado: 'completada' },
    });
  });

  test('reintentar el checkout con la misma clave no cobra ni emite dos veces', async () => {
    const antes = (await fetch(`${eco.urls.pagos}/api/v1/cuentas/900000003/saldo`).then((x) =>
      x.json(),
    )) as { saldo: string };
    const a = await pedir({ ...base, celular: '900000003' }, 'pedido-repetido');
    const b = await pedir({ ...base, celular: '900000003' }, 'pedido-repetido');
    expect(b.json()).toEqual(a.json());
    const despues = (await fetch(`${eco.urls.pagos}/api/v1/cuentas/900000003/saldo`).then((x) =>
      x.json(),
    )) as { saldo: string };
    expect(Number(antes.saldo) - Number(despues.saldo)).toBeCloseTo(84.8, 2);
  });

  test('factura: toma la razón social del RUC y rechaza contribuyentes no activos', async () => {
    const activo = await rucCon((c) => c.estado === 'ACTIVO');
    const ok = await pedir({ ...base, tipo: 'factura', documento: activo, nombre: 'IGNORADO' });
    expect(ok.json()).toMatchObject({
      estado: 'completado',
      numero: 'F001-1',
      comprobante: { estado: 'aceptado' },
    });
    const baja = await rucCon((c) => c.estado === 'BAJA DEFINITIVA');
    expect((await pedir({ ...base, tipo: 'factura', documento: baja })).json()).toMatchObject({
      codigo: 'CONTRIBUYENTE_NO_ACTIVO',
    });
    expect(
      (await pedir({ ...base, tipo: 'factura', documento: '20000000002' })).json(),
    ).toMatchObject({ codigo: 'RUC_INVALIDO' });
    expect((await pedir({ ...base, tipo: 'factura' })).json()).toMatchObject({
      codigo: 'RUC_REQUERIDO',
    });
  });

  test('pago rechazado: 402, sin número de comprobante', async () => {
    const r = await pedir({ ...base, celular: '999999999' });
    expect(r.statusCode).toBe(402);
    expect(r.json()).toMatchObject({ estado: 'rechazado', numero: null, comprobante: null });
  });

  test('con SUNAT caída el pago no se pierde: comprobante pendiente y reintento posterior', async () => {
    await fetch(`${eco.urls.caos}/api/v1/caos`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        reglas: [
          { servicio: 'sunat-sim', porcentaje: 100, falla: { tipo: 'error5xx', estado: 503 } },
        ],
      }),
    });
    // Espera a que el caos llegue a sunat-sim por SSE.
    for (let i = 0; i < 100 && (await fetch(`${eco.urls.sunat}/api/v1/comprobantes`)).ok; i++)
      await new Promise((ok) => setTimeout(ok, 20));
    const r = await pedir({ ...base, celular: '900000005' }, 'pedido-sunat-caida');
    expect(r.json()).toMatchObject({
      estado: 'pagado',
      pago: { estado: 'completada' },
      comprobante: null,
    });
    expect(r.json<{ error: string }>().error).toBe(
      'Comprobante pendiente: 503 FALLA_INYECTADA: Falla inyectada por Chasqui (HTTP 503)',
    );

    await fetch(`${eco.urls.caos}/api/v1/caos`, { method: 'DELETE' });
    for (let i = 0; i < 100 && !(await fetch(`${eco.urls.sunat}/api/v1/comprobantes`)).ok; i++)
      await new Promise((ok) => setTimeout(ok, 20));
    const reintento = await tienda.inject({
      method: 'POST',
      url: '/api/pedidos/pedido-sunat-caida/comprobante',
    });
    expect(reintento.json()).toMatchObject({
      estado: 'completado',
      comprobante: { estado: 'aceptado' },
    });
  });

  test('sirve la página con el aviso y la lista de productos', async () => {
    const html = await tienda.inject({ url: '/' });
    expect(html.body).toContain('No afiliado a SUNAT');
    expect((await tienda.inject({ url: '/api/productos' })).json()).toHaveLength(4);
  });
});
