import { leerCdr, verificarFirma } from '@chasqui/ubl-core';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  baja,
  emitir,
  emitirAlterado,
  factura,
  levantar,
  resumenBoletas,
  sendBill,
  sendSummary,
} from './ayudas.js';

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

describe('tickets: resumen diario y bajas', () => {
  /** Envía por sendSummary, avanza el reloj y devuelve el estado y el código del CDR. */
  async function procesar(envio: { nombreZip: string; zip: Uint8Array }) {
    const xml = await (await s.soap(sendSummary(envio.nombreZip, envio.zip))).text();
    const ticket = /<ticket>(\d+)<\/ticket>/.exec(xml)?.[1];
    if (!ticket) throw new Error(xml);
    s.avanzar(3000);
    const r = await (
      await s.soap(`<ser:getStatus><ticket>${ticket}</ticket></ser:getStatus>`)
    ).text();
    const contenido = /<content>([^<]+)</.exec(r)?.[1] ?? '';
    return {
      estado: /<statusCode>(\d+)</.exec(r)?.[1],
      codigo: leerCdr(Buffer.from(contenido, 'base64')).codigo,
    };
  }

  test('resumen diario: registra la boleta adicionada y la anulada', async () => {
    expect(await procesar(resumenBoletas())).toEqual({ estado: '0', codigo: '0' });
    expect(await json(await fetch(`${s.base}/api/v1/estado/20000000001/03/B001/1`))).toMatchObject({
      estado: 'aceptado',
    });
    expect(await json(await fetch(`${s.base}/api/v1/estado/20000000001/03/B001/2`))).toMatchObject({
      estado: 'anulado',
    });
  });

  test('baja de un comprobante no registrado → 99 con 2105', async () => {
    expect(await procesar(baja('F001', 77))).toEqual({ estado: '99', codigo: '2105' });
  });

  test('baja repetida → 2323', async () => {
    const f = emitir(factura());
    await s.enviarRest(f.nombreZip, f.zip);
    expect(await procesar(baja('F001', 1, '2026-11-03', 1))).toEqual({ estado: '0', codigo: '0' });
    expect(await procesar(baja('F001', 1, '2026-11-03', 2))).toEqual({
      estado: '99',
      codigo: '2323',
    });
  });

  test('baja fuera de plazo → 2958', async () => {
    const f = emitir(factura());
    await s.enviarRest(f.nombreZip, f.zip);
    s.avanzar(8 * 86_400_000);
    expect(await procesar(baja('F001', 1, '2026-11-11'))).toEqual({ estado: '99', codigo: '2958' });
  });

  test('regla XSL oficial en la baja: IssueDate distinta a la del nombre → 99 con 2346', async () => {
    const { empaquetar, firmar, generarBaja, nombreBaja } = await import('@chasqui/ubl-core');
    const b = {
      emisor: factura().emisor,
      correlativo: 1,
      fechaComunicacion: '2026-11-03',
      fechaReferencia: '2026-11-03',
      lineas: [{ tipo: '01' as const, serie: 'F001', numero: 1, motivo: 'Error en la operación' }],
    };
    const nombre = nombreBaja(b);
    const xml = firmar(
      generarBaja(b).replace('<cbc:IssueDate>2026-11-03', '<cbc:IssueDate>2026-11-02'),
    );
    expect(await procesar({ nombreZip: `${nombre}.zip`, zip: empaquetar(nombre, xml) })).toEqual({
      estado: '99',
      codigo: '2346',
    });
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
    // 3249: la hoja oficial observa toda factura al crédito.
    expect(await enviar('credito')).toMatchObject({ estado: 'observado', codigo: '0' });
    expect(await enviar('consumo')).toMatchObject({ estado: 'aceptado', codigo: '0' });
    expect(await enviar('observada')).toMatchObject({ estado: 'observado', codigo: '0' });
    expect(await enviar('rechazada')).toMatchObject({ estado: 'rechazado', codigo: '2074' });
    expect(await enviar('duplicada')).toMatchObject({ estado: 'excepcion', codigo: '1033' });
    expect(await enviar('excepcion')).toMatchObject({ estado: 'excepcion', codigo: '0161' });
  });
});

describe('GRE por REST con OAuth', () => {
  async function token(usuario = '20000000001MODDATOS', clave = 'moddatos') {
    const r = await fetch(`${s.base}/v1/clientessol/test-85e5b0ae/oauth2/token/`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        scope: 'https://api-cpe',
        client_id: 'test-85e5b0ae',
        client_secret: 'secreto',
        username: usuario,
        password: clave,
      }),
    });
    return { status: r.status, cuerpo: await json(r) };
  }

  async function enviarGuia(t: string, alterar: (x: string) => string = (x) => x, correlativo = 1) {
    const { empaquetar, firmar, generarGuia, nombreGuia } = await import('@chasqui/ubl-core');
    const { createHash } = await import('node:crypto');
    const g = {
      serie: 'T001',
      correlativo,
      fechaEmision: '2026-11-03',
      emisor: factura().emisor,
      destinatario: {
        tipoDocumento: '6' as const,
        numeroDocumento: '20000000002',
        nombre: 'CLIENTE DEMO S.A.',
      },
      motivo: '01',
      fechaTraslado: '2026-11-03',
      pesoBrutoKg: '10',
      partida: { ubigeo: '150101', linea: 'AV. FICTICIA 123' },
      llegada: { ubigeo: '150122', linea: 'JR. INVENTADO 456' },
      vehiculo: { placa: 'ABC123' },
      conductor: {
        tipoDocumento: '1' as const,
        numeroDocumento: '00000001',
        nombres: 'JUAN',
        apellidos: 'PEREZ',
        licencia: 'Q00000001',
      },
      items: [{ descripcion: 'Producto', cantidad: 1, unidad: 'NIU' as const, codigo: 'P1' }],
    };
    const nombre = nombreGuia(g);
    const zip = Buffer.from(empaquetar(nombre, firmar(alterar(generarGuia(g)))));
    const r = await fetch(`${s.base}/v1/contribuyente/gem/comprobantes/${nombre}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${t}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        archivo: {
          nomArchivo: `${nombre}.zip`,
          arcGreZip: zip.toString('base64'),
          hashZip: createHash('sha256').update(zip).digest('hex'),
        },
      }),
    });
    return { status: r.status, cuerpo: await json(r) };
  }

  const consultar = async (t: string, ticket: string) =>
    json(
      await fetch(`${s.base}/v1/contribuyente/gem/comprobantes/envios/${ticket}`, {
        headers: { authorization: `Bearer ${t}` },
      }),
    );

  test('token, envío, 98 y luego 0 con CDR', async () => {
    const { cuerpo } = await token();
    const t = cuerpo.access_token as string;
    expect(cuerpo).toMatchObject({ token_type: 'JWT', expires_in: 3600 });
    const envio = await enviarGuia(t);
    expect(envio.status).toBe(200);
    const ticket = envio.cuerpo.numTicket as string;
    expect(ticket).toMatch(/^[0-9a-f-]{36}$/);
    expect(await consultar(t, ticket)).toEqual({ codRespuesta: '98' });
    s.avanzar(3000);
    const listo = await consultar(t, ticket);
    expect(listo).toMatchObject({ codRespuesta: '0', indCdrGenerado: '1' });
    expect(leerCdr(Buffer.from(listo.arcCdr as string, 'base64'))).toMatchObject({
      aceptado: true,
      serieNumero: 'T001-1',
    });
    expect(await json(await fetch(`${s.base}/api/v1/estado/20000000001/09/T001/1`))).toMatchObject({
      estado: 'aceptado',
    });
  });

  test('guía con error de las reglas oficiales → 99 con CDR de rechazo', async () => {
    const t = (await token()).cuerpo.access_token as string;
    const envio = await enviarGuia(t, (x) => x.replace('<cbc:ID>ABC123<', '<cbc:ID>ABC-123<'));
    s.avanzar(3000);
    const r = await consultar(t, envio.cuerpo.numTicket as string);
    expect(r).toMatchObject({
      codRespuesta: '99',
      error: { numError: '2567' },
      indCdrGenerado: '1',
    });
  });

  test('duplicada → 99 sin CDR (excepción 1033)', async () => {
    const t = (await token()).cuerpo.access_token as string;
    const primera = await enviarGuia(t);
    s.avanzar(3000);
    await consultar(t, primera.cuerpo.numTicket as string);
    const segunda = await enviarGuia(t);
    s.avanzar(3000);
    expect(await consultar(t, segunda.cuerpo.numTicket as string)).toMatchObject({
      codRespuesta: '99',
      error: { numError: '1033' },
      indCdrGenerado: '0',
    });
  });

  test('credenciales, token y hash', async () => {
    expect((await token('20000000001MODDATOS', 'otra')).status).toBe(400);
    expect((await enviarGuia('token.falso.x')).status).toBe(401);
    const t = (await token()).cuerpo.access_token as string;
    s.avanzar(3601 * 1000);
    expect((await enviarGuia(t)).status).toBe(401); // vencido
    const otro = (await token('20999999999MODDATOS')).cuerpo.access_token as string;
    expect(await enviarGuia(otro)).toMatchObject({
      status: 422,
      cuerpo: { errors: [{ cod: '0154' }] },
    });
  });
});
