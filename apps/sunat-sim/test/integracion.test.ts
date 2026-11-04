import { leerCdr, verificarFirma } from '@chasqui/ubl-core';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { baja, emitir, emitirAlterado, factura, levantar, sendBill } from './ayudas.js';

type Servidor = Awaited<ReturnType<typeof levantar>>;
let s: Servidor;
beforeEach(async () => {
  s = await levantar();
});
afterEach(async () => {
  await s.app.close();
});

const json = async (r: Response) => (await r.json()) as Record<string, unknown>;

describe('REST', () => {
  test('acepta una factura válida y devuelve un CDR firmado', async () => {
    const { nombreZip, zip } = emitir(factura());
    const r = await s.enviarRest(nombreZip, zip);
    expect(r.status).toBe(200);
    expect(r.headers.get('x-chasqui-aviso')).toBe('simulador-no-oficial');
    const cuerpo = await json(r);
    expect(cuerpo).toMatchObject({ estado: 'aceptado', codigo: '0', observaciones: [] });
    const cdr = leerCdr(Buffer.from(cuerpo.cdr as string, 'base64'));
    expect(cdr).toMatchObject({ aceptado: true, serieNumero: 'F001-1' });
    expect(cdr.descripcion).toBe('La Factura numero F001-00000001, ha sido aceptada');
    expect(verificarFirma(cdr.xml).valida).toBe(true);
  });

  test('rechazo de negocio (2000-3999): CDR con el código y consulta «rechazado»', async () => {
    const { nombreZip, zip } = emitirAlterado(factura(), (x) =>
      x.replace('<cbc:UBLVersionID>2.1', '<cbc:UBLVersionID>2.0'),
    );
    const cuerpo = await json(await s.enviarRest(nombreZip, zip));
    expect(cuerpo).toMatchObject({ estado: 'rechazado', codigo: '2074' });
    expect(leerCdr(Buffer.from(cuerpo.cdr as string, 'base64')).codigo).toBe('2074');
    const estado = await json(await fetch(`${s.base}/api/v1/estado/20000000001/01/F001/1`));
    expect(estado).toMatchObject({ estado: 'rechazado', codigo: '2074' });
  });

  test('observaciones (4000+): aceptado con notas en el CDR', async () => {
    const { nombreZip, zip } = emitirAlterado(factura(), (x) =>
      x.replace(
        '<cbc:PayableAmount currencyID="PEN">118.00',
        '<cbc:PayableAmount currencyID="PEN">121.00',
      ),
    );
    const cuerpo = await json(await s.enviarRest(nombreZip, zip));
    expect(cuerpo).toMatchObject({ estado: 'observado', codigo: '0' });
    expect(
      leerCdr(Buffer.from(cuerpo.cdr as string, 'base64')).observaciones.map((o) => o.codigo),
    ).toEqual(['4312']);
  });

  test('excepción (0100-1999): HTTP 400 sin CDR y sin registro', async () => {
    const { zip } = emitir(factura());
    const r = await s.enviarRest('20000000001-01-F001-2.zip', zip);
    expect(r.status).toBe(400);
    expect(await json(r)).toMatchObject({ codigo: '0161' });
    const lista = (await (await fetch(`${s.base}/api/v1/comprobantes`)).json()) as unknown[];
    expect(lista).toHaveLength(0);
  });

  test('duplicados: 1033 si ya fue aceptado, 1032 si fue rechazado', async () => {
    const ok = emitir(factura(1));
    await s.enviarRest(ok.nombreZip, ok.zip);
    expect(await json(await s.enviarRest(ok.nombreZip, ok.zip))).toMatchObject({ codigo: '1033' });

    const malo = emitirAlterado(factura(2), (x) =>
      x.replace('<cbc:UBLVersionID>2.1', '<cbc:UBLVersionID>2.0'),
    );
    await s.enviarRest(malo.nombreZip, malo.zip);
    const corregido = emitir(factura(2));
    expect(await json(await s.enviarRest(corregido.nombreZip, corregido.zip))).toMatchObject({
      codigo: '1032',
    });
  });

  test('documento alterado después de firmar → 2335', async () => {
    const { nombreZip, xml } = emitir(factura());
    const { empaquetar } = await import('@chasqui/ubl-core');
    const alterado = xml.replace('Producto', 'Producto alterado');
    const cuerpo = await json(
      await s.enviarRest(nombreZip, empaquetar(nombreZip.replace('.zip', ''), alterado)),
    );
    expect(cuerpo).toMatchObject({ estado: 'rechazado', codigo: '2335' });
  });

  test('sin firma → excepción 1059', async () => {
    const { empaquetar, generarXml, calcular } = await import('@chasqui/ubl-core');
    const c = factura();
    const r = await s.enviarRest(
      '20000000001-01-F001-1.zip',
      empaquetar('20000000001-01-F001-1', generarXml(calcular(c))),
    );
    expect(await json(r)).toMatchObject({ codigo: '1059' });
  });

  test('plazos: fuera de fecha (2108) y fecha futura (2329)', async () => {
    const viejo = emitir(factura(1, '2026-10-29'));
    expect(await json(await s.enviarRest(viejo.nombreZip, viejo.zip))).toMatchObject({
      codigo: '2108',
    });
    const futuro = emitir(factura(2, '2026-11-06'));
    expect(await json(await s.enviarRest(futuro.nombreZip, futuro.zip))).toMatchObject({
      codigo: '2329',
    });
    const limite = emitir(factura(3, '2026-11-05'));
    expect(await json(await s.enviarRest(limite.nombreZip, limite.zip))).toMatchObject({
      estado: 'aceptado',
    });
  });

  test('historial y detalle con XML y CDR', async () => {
    const { nombreZip, zip } = emitir(factura());
    await s.enviarRest(nombreZip, zip);
    const lista = (await (await fetch(`${s.base}/api/v1/comprobantes?ruc=20000000001`)).json()) as {
      id: string;
    }[];
    expect(lista.map((c) => c.id)).toEqual(['20000000001-01-F001-1']);
    const detalle = await json(await fetch(`${s.base}/api/v1/comprobantes/20000000001-01-F001-1`));
    expect(detalle.xml).toContain('<Invoice');
    expect(detalle.cdrXml).toContain('ApplicationResponse');
    expect((await fetch(`${s.base}/api/v1/comprobantes/no-existe`)).status).toBe(404);
  });

  test('OpenAPI 3.1 generado', async () => {
    const doc = await json(await fetch(`${s.base}/docs/json`));
    expect(doc.openapi).toBe('3.1.0');
    expect(Object.keys(doc.paths as object)).toContain('/api/v1/comprobantes');
  });
});

describe('SOAP (billService)', () => {
  test('sendBill responde applicationResponse con el CDR', async () => {
    const { nombreZip, zip } = emitir(factura());
    const r = await s.soap(sendBill(nombreZip, zip));
    expect(r.status).toBe(200);
    const xml = await r.text();
    const b64 = /<applicationResponse>([^<]+)<\/applicationResponse>/.exec(xml)?.[1] ?? '';
    expect(leerCdr(Buffer.from(b64, 'base64'))).toMatchObject({ aceptado: true });
  });

  test.each<[string, { sinSeguridad?: boolean; usuario?: string; clave?: string }, string]>([
    ['sin cabecera de seguridad', { sinSeguridad: true }, '0101'],
    ['clave incorrecta', { clave: 'otra' }, '0102'],
    ['usuario de otro RUC', { usuario: '20999999999MODDATOS' }, '0154'],
  ])('%s → fault %s', async (_, o, codigo) => {
    const { nombreZip, zip } = emitir(factura());
    const r = await s.soap(sendBill(nombreZip, zip), o.usuario, o.clave, !o.sinSeguridad);
    expect(r.status).toBe(500);
    expect(await r.text()).toContain(`<faultcode>soap-env:Client.${codigo}</faultcode>`);
  });

  test('duplicado → fault Client.1033', async () => {
    const { nombreZip, zip } = emitir(factura());
    await s.soap(sendBill(nombreZip, zip));
    expect(await (await s.soap(sendBill(nombreZip, zip))).text()).toContain('soap-env:Client.1033');
  });

  test('XML SOAP inválido y operación desconocida', async () => {
    const r = await fetch(`${s.base}/billService`, {
      method: 'POST',
      headers: { 'content-type': 'text/xml' },
      body: '<no',
    });
    expect(await r.text()).toContain('Client.0306');
    expect(await (await s.soap('<ser:sendPack/>')).text()).toContain('Client.0200');
  });

  test('sirve el WSDL con su propia dirección (nunca un dominio de SUNAT)', async () => {
    const wsdl = await (await fetch(`${s.base}/billService?wsdl`)).text();
    expect(wsdl).toContain(`location="${s.base}/billService"`);
    expect(wsdl).not.toMatch(/sunat\.gob\.pe:443/);
    expect(await (await fetch(`${s.base}/billService?ns1.wsdl`)).text()).toContain(
      `${s.base}/billService?xsd2.xsd`,
    );
  });

  test('comunicación de baja: ticket 98 → 0, y el comprobante queda anulado', async () => {
    const f = emitir(factura());
    await s.soap(sendBill(f.nombreZip, f.zip));
    const ra = baja('F001', 1);
    const xml = await (
      await s.soap(
        `<ser:sendSummary><fileName>${ra.nombreZip}</fileName><contentFile>${Buffer.from(ra.zip).toString('base64')}</contentFile></ser:sendSummary>`,
      )
    ).text();
    const ticket = /<ticket>(\d+)<\/ticket>/.exec(xml)?.[1] ?? '';
    expect(ticket).toMatch(/^20261103\d{7}$/);

    const estado = async () =>
      (await s.soap(`<ser:getStatus><ticket>${ticket}</ticket></ser:getStatus>`)).text();
    expect(await estado()).toContain('<statusCode>98</statusCode>');
    s.avanzar(3000);
    const listo = await estado();
    expect(listo).toContain('<statusCode>0</statusCode>');
    expect(listo).toContain('<content>');
    expect(await json(await fetch(`${s.base}/api/v1/estado/20000000001/01/F001/1`))).toMatchObject({
      estado: 'anulado',
    });
    // Una vez resuelto, el ticket devuelve siempre el mismo CDR.
    expect(await estado()).toBe(listo);
  });

  test('ticket inexistente → fault 0127', async () => {
    expect(
      await (await s.soap('<ser:getStatus><ticket>123</ticket></ser:getStatus>')).text(),
    ).toContain('Client.0127');
  });
});

describe('eventos en vivo (SSE)', () => {
  test('cada recepción se publica en /_chasqui/eventos', async () => {
    const ctrl = new AbortController();
    const r = await fetch(`${s.base}/_chasqui/eventos`, { signal: ctrl.signal });
    const lector = r.body?.getReader();
    const { nombreZip, zip } = emitir(factura());
    await s.enviarRest(nombreZip, zip);
    let texto = '';
    while (!texto.includes('data: ')) {
      const { value } = (await lector?.read()) ?? {};
      texto += new TextDecoder().decode(value);
    }
    ctrl.abort();
    const linea = texto.split('\n').find((l) => l.startsWith('data: ')) ?? '';
    const evento = JSON.parse(linea.slice(6)) as Record<string, unknown>;
    expect(evento).toMatchObject({
      tipo: 'comprobante',
      servicio: 'sunat-sim',
      nombre: '20000000001-01-F001-1',
      estado: 'aceptado',
    });
  });
});

describe('demo', () => {
  test('cada escenario recorre su camino', async () => {
    const enviar = async (escenario: string) =>
      json(
        await fetch(`${s.base}/_chasqui/demo`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ escenario }),
        }),
      );
    expect(await enviar('valida')).toMatchObject({ estado: 'aceptado', codigo: '0' });
    expect(await enviar('observada')).toMatchObject({ estado: 'observado', codigo: '0' });
    expect(await enviar('rechazada')).toMatchObject({ estado: 'rechazado', codigo: '2074' });
    expect(await enviar('duplicada')).toMatchObject({ estado: 'excepcion', codigo: '1033' });
    expect(await enviar('excepcion')).toMatchObject({ estado: 'excepcion', codigo: '0161' });
  });
});
