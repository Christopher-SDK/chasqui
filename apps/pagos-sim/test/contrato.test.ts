import type { AddressInfo } from 'node:net';
import { FuenteCaos } from '@chasqui/chaos-engine';
import { verificarContrato } from '@chasqui/test-kit/pact';
import { expect, test } from 'vitest';
import { abrirDb } from '../src/db.js';
import { construirServidor } from '../src/servidor.js';

test('cumple el contrato que espera el SDK', async () => {
  const app = await construirServidor({
    db: abrirDb(':memory:'),
    registro: false,
    trabajador: false,
    caos: new FuenteCaos(),
  });
  await app.listen({ port: 0, host: '127.0.0.1' });
  try {
    const url = `http://127.0.0.1:${String((app.server.address() as AddressInfo).port)}`;
    const reiniciar = () => fetch(`${url}/_chasqui/reiniciar`, { method: 'POST' });
    await expect(
      verificarContrato('pagos-sim', url, { 'las cuentas de prueba están sembradas': reiniciar }),
    ).resolves.not.toThrow();
  } finally {
    await app.close();
  }
});
