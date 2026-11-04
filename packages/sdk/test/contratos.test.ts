import { fileURLToPath } from 'node:url';
import { MatchersV3, PactV4 } from '@pact-foundation/pact';
import { rucEmpresa } from '@chasqui/test-kit';
import { describe, expect, test } from 'vitest';
import { emitir } from '@chasqui/ubl-core';
import { Chasqui, factura } from '../src/index.js';

/**
 * Contratos del consumidor (el SDK). Generan pacts/chasqui-sdk-<proveedor>.json, que cada
 * simulador verifica en sus propias pruebas (apps/<proveedor>/test/contrato.test.ts).
 */
const { regex, string } = MatchersV3;
const dir = fileURLToPath(new URL('../../../pacts', import.meta.url));
const pacto = (provider: string) =>
  new PactV4({ consumer: 'chasqui-sdk', provider, dir, logLevel: 'error' });
const RUC = rucEmpresa(10);
const FECHA_ISO = '^\\d{4}-\\d{2}-\\d{2}T[\\d:.]+Z$';
const cliente = (servicio: string, url: string) => new Chasqui({ [servicio]: url, reintentos: 0 });

describe('contrato SDK → identidad-sim', () => {
  test('consulta de RUC existente', () =>
    pacto('identidad-sim')
      .addInteraction()
      .given('el RUC existe en el dataset ficticio')
      .uponReceiving('una consulta de RUC válido')
      .withRequest('GET', `/api/v1/ruc/${RUC}`)
      .willRespondWith(200, (b) =>
        b.jsonBody({
          ruc: RUC,
          razonSocial: string('EMPRESA FICTICIA S.A.C.'),
          estado: regex('^(ACTIVO|BAJA DE OFICIO|BAJA DEFINITIVA|SUSPENSION TEMPORAL)$', 'ACTIVO'),
          condicion: regex('^(HABIDO|NO HABIDO)$', 'HABIDO'),
          ubigeo: regex('^\\d{6}$', '150101'),
          direccion: string('AV. FICTICIA 1'),
        }),
      )
      .executeTest(async (m) => {
        expect((await cliente('identidad', m.url).identidad.ruc(RUC)).ruc).toBe(RUC);
      }));

  test('RUC con dígito verificador incorrecto', () =>
    pacto('identidad-sim')
      .addInteraction()
      .uponReceiving('una consulta de RUC inválido')
      .withRequest('GET', '/api/v1/ruc/20000000002')
      .willRespondWith(400, (b) =>
        b.jsonBody({
          codigo: 'RUC_INVALIDO',
          mensaje: string('Formato o dígito verificador incorrecto'),
        }),
      )
      .executeTest(async (m) => {
        await expect(
          cliente('identidad', m.url).identidad.ruc('20000000002'),
        ).rejects.toMatchObject({ codigo: 'RUC_INVALIDO' });
      }));
});

const transferencia = (estado: string) => ({
  id: regex('^trf_[\\w-]+$', 'trf_abc123'),
  origen: '900000001',
  destino: '900000003',
  monto: '10.00',
  moneda: 'PEN',
  descripcion: '',
  estado: regex('^(pendiente|completada|rechazada|revertida)$', estado),
  motivo: null,
  cobroId: null,
  creadoEn: regex(FECHA_ISO, '2026-11-04T15:00:00.000Z'),
  actualizadoEn: regex(FECHA_ISO, '2026-11-04T15:00:00.000Z'),
});

describe('contrato SDK → pagos-sim', () => {
  test('transferencia con Idempotency-Key', () =>
    pacto('pagos-sim')
      .addInteraction()
      .given('las cuentas de prueba están sembradas')
      .uponReceiving('una transferencia entre cuentas de la misma billetera')
      .withRequest('POST', '/api/v1/transferencias', (b) =>
        b
          .headers({
            'idempotency-key': regex('^.{8,120}$', 'clave-de-prueba-0001'),
            'content-type': 'application/json',
          })
          .jsonBody({ origen: '900000001', destino: '900000003', monto: '10.00' }),
      )
      .willRespondWith(201, (b) => b.jsonBody(transferencia('completada')))
      .executeTest(async (m) => {
        const t = await cliente('pagos', m.url).pagos.transferir(
          { origen: '900000001', destino: '900000003', monto: '10.00' },
          'clave-de-prueba-0001',
        );
        expect(t.estado).toBe('completada');
      }));

  test('saldo de una cuenta', () =>
    pacto('pagos-sim')
      .addInteraction()
      .given('las cuentas de prueba están sembradas')
      .uponReceiving('una consulta de saldo')
      .withRequest('GET', '/api/v1/cuentas/900000001/saldo')
      .willRespondWith(200, (b) =>
        b.jsonBody({
          celular: '900000001',
          saldo: regex('^\\d+\\.\\d{2}$', '1000.00'),
          moneda: 'PEN',
        }),
      )
      .executeTest(async (m) => {
        expect(await cliente('pagos', m.url).pagos.saldo('900000001')).toMatch(/^\d+\.\d{2}$/);
      }));
});

describe('contrato SDK → sunat-sim', () => {
  const f = factura()
    .serie('F001', 1)
    .emisor({
      ruc: '20000000001',
      razonSocial: 'DEMO S.A.C.',
      direccion: {
        ubigeo: '150101',
        departamento: 'LIMA',
        provincia: 'LIMA',
        distrito: 'LIMA',
        linea: 'AV. FICTICIA 1',
      },
    })
    .cliente(RUC, 'CLIENTE S.A.C.')
    .item('Café', 1, '10.00')
    .construir();

  // Pact reenvía el ejemplo al proveedor: tiene que ser el ZIP firmado real.
  const zip = emitir(f);

  test('envío de un comprobante por REST', () =>
    pacto('sunat-sim')
      .addInteraction()
      .uponReceiving('el envío de una factura firmada')
      .withRequest('POST', '/api/v1/comprobantes', (b) =>
        b.jsonBody({
          nombreArchivo: regex('^\\d{11}-\\d{2}-[A-Z0-9]{4}-\\d{1,8}\\.zip$', zip.nombreZip),
          contenido: string(Buffer.from(zip.zip).toString('base64')),
        }),
      )
      .willRespondWith(200, (b) =>
        b.jsonBody({
          id: string('cmp_1'),
          // El ejemplo se reenvía al verificar, quizá otro día: plazos y fechas pueden cambiar el estado.
          estado: regex('^(aceptado|observado|rechazado)$', 'aceptado'),
          codigo: regex('^\\d+$', '0'),
          mensaje: string('La Factura numero F001-1, ha sido aceptada'),
          observaciones: [],
          cdr: string('UEsDBA=='),
        }),
      )
      .executeTest(async (m) => {
        expect((await cliente('sunat', m.url).sunat.enviar(f)).estado).toBe('aceptado');
      }));
});
