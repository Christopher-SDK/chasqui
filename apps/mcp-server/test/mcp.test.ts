import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { levantarEcosistema, type Ecosistema } from '@chasqui/ecosistema';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { construirServidorMcp } from '../src/servidor.js';

let eco: Ecosistema;
let cliente: Client;
beforeAll(async () => {
  eco = await levantarEcosistema({ pagos: { demoraInterbilletera: 50 } });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await construirServidorMcp({ ...eco.urls, esperaBase: 10 }).connect(a);
  cliente = new Client({ name: 'prueba', version: '1.0.0' });
  await cliente.connect(b);
});
afterAll(async () => {
  await cliente.close();
  await eco.cerrar();
});

/** Llama una herramienta y devuelve el JSON de su respuesta. */
async function llamar(nombre: string, args: Record<string, unknown> = {}) {
  const r = (await cliente.callTool({ name: nombre, arguments: args })) as {
    content: { text: string }[];
    isError?: boolean;
  };
  return {
    error: r.isError ?? false,
    datos: JSON.parse(r.content[0]?.text ?? '{}') as Record<string, unknown>,
  };
}

describe('mcp-server', () => {
  test('expone las herramientas con descripción y anotaciones, y el aviso en las instrucciones', async () => {
    const { tools } = await cliente.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(
      [
        'caos_activar',
        'caos_desactivar',
        'caos_estado',
        'consultar_dni',
        'consultar_ruc',
        'consultar_transferencia',
        'emitir_comprobante',
        'estado_comprobante',
        'saldo',
        'transferir',
        'validar_xml',
      ].sort(),
    );
    expect(tools.find((t) => t.name === 'consultar_ruc')?.annotations?.readOnlyHint).toBe(true);
    expect(cliente.getInstructions()).toContain('No afiliado a SUNAT');
  });

  test('emite una factura y consulta su estado', async () => {
    const r = await llamar('emitir_comprobante', {
      tipo: 'factura',
      serie: 'F001',
      numero: 7,
      cliente: { documento: '20000000001', nombre: 'CLIENTE S.A.C.' },
      items: [{ descripcion: 'Café', cantidad: 2, valorUnitario: '8.50' }],
    });
    expect(r).toMatchObject({ error: false, datos: { estado: 'aceptado', codigo: '0' } });
    expect(r.datos).not.toHaveProperty('cdr');
    expect(
      (await llamar('estado_comprobante', { tipo: '01', serie: 'F001', numero: 7 })).datos.estado,
    ).toBe('aceptado');
  });

  test('emite operaciones especiales: crédito con detracción, ISC, bolsas y gratuitas', async () => {
    const cliente = { documento: '20000000001', nombre: 'CLIENTE S.A.C.' };
    const credito = await llamar('emitir_comprobante', {
      tipo: 'factura',
      serie: 'F001',
      numero: 30,
      cliente,
      items: [{ descripcion: 'Mantenimiento', cantidad: 1, valorUnitario: '2000' }],
      detraccion: { codigoBien: '020', cuentaBancoNacion: '00-000-000001' },
      cuotas: [{ monto: '2124', fechaPago: '2026-12-15' }],
    });
    expect(credito).toMatchObject({ error: false, datos: { estado: 'observado', codigo: '0' } });
    const consumo = await llamar('emitir_comprobante', {
      tipo: 'boleta',
      serie: 'B001',
      numero: 30,
      cliente: { documento: '12345678', nombre: 'ANA' },
      items: [
        {
          descripcion: 'Licor',
          cantidad: 1,
          valorUnitario: '40',
          isc: { sistema: '01', tasa: '0.25' },
        },
        { descripcion: 'Bolsa', cantidad: 2, valorUnitario: '0.10', icbper: true },
        { descripcion: 'Muestra', cantidad: 1, valorUnitario: '5', afectacion: '13' },
      ],
      tasaIgv: '10',
    });
    expect(consumo).toMatchObject({ error: false, datos: { estado: 'aceptado' } });
    expect(
      await llamar('emitir_comprobante', {
        tipo: 'boleta',
        serie: 'B001',
        numero: 31,
        cliente: { documento: '12345678', nombre: 'ANA' },
        items: [{ descripcion: 'x', cantidad: 1, valorUnitario: '10' }],
        percepcion: '51',
      }),
    ).toMatchObject({
      error: true,
      datos: { error: { mensaje: 'Solo las facturas (01) admiten esta operación' } },
    });
  });

  test('un duplicado vuelve como error de herramienta con su código, no como excepción', async () => {
    const args = {
      tipo: 'boleta',
      serie: 'B001',
      numero: 3,
      cliente: { documento: '12345678', nombre: 'ANA' },
      items: [{ descripcion: 'x', cantidad: 1, valorUnitario: '10' }],
    };
    await llamar('emitir_comprobante', args);
    expect(await llamar('emitir_comprobante', args)).toMatchObject({
      error: true,
      datos: { error: { codigo: '1033' } },
    });
  });

  test('valida un XML sin enviarlo', async () => {
    const r = await llamar('validar_xml', {
      xml: '<Invoice/>',
      nombreArchivo: '20000000001-01-F001-1.xml',
    });
    expect(r.error).toBe(false);
    expect(r.datos).toHaveProperty('estado');
  });

  test('identidad, transferencia idempotente y saldo', async () => {
    expect((await llamar('consultar_dni', { dni: '12345678' })).datos).toHaveProperty('nombres');
    expect((await llamar('consultar_ruc', { ruc: '20000000002' })).datos).toMatchObject({
      error: { codigo: 'RUC_INVALIDO' },
    });
    const args = {
      origen: '900000001',
      destino: '900000003',
      monto: '5.00',
      claveIdempotencia: 'mcp-clave-0001',
    };
    const a = await llamar('transferir', args);
    const b = await llamar('transferir', args);
    expect(b.datos.id).toBe(a.datos.id);
    expect((await llamar('consultar_transferencia', { id: String(a.datos.id) })).datos.estado).toBe(
      'completada',
    );
    expect((await llamar('saldo', { celular: '900000001' })).datos.saldo).toBe('995.00');
  });

  test('activa, consulta y desactiva el caos', async () => {
    expect(
      (await llamar('caos_activar', { perfil: 'red-inestable', semilla: 'mcp' })).datos,
    ).toMatchObject({ perfil: 'red-inestable', semilla: 'mcp' });
    expect((await llamar('caos_estado')).datos).toMatchObject({
      actual: { perfil: 'red-inestable' },
    });
    expect((await llamar('caos_desactivar')).datos).toMatchObject({ perfil: null });
  });

  test('rechaza argumentos inválidos con el esquema', async () => {
    const r = await cliente.callTool({
      name: 'transferir',
      arguments: { origen: '123', destino: '900000003', monto: 'diez' },
    });
    expect(r.isError).toBe(true);
  });
});
