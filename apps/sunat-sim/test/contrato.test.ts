import type { AddressInfo } from 'node:net';
import { FuenteCaos } from '@chasqui/chaos-engine';
import { verificarContrato } from '@chasqui/test-kit/pact';
import { expect, test } from 'vitest';
import { construirServidor } from '../src/servidor.js';

test('cumple el contrato que espera el SDK', async () => {
  const app = await construirServidor({ registro: false, caos: new FuenteCaos() });
  await app.listen({ port: 0, host: '127.0.0.1' });
  try {
    const url = `http://127.0.0.1:${String((app.server.address() as AddressInfo).port)}`;
    await expect(verificarContrato('sunat-sim', url)).resolves.not.toThrow();
  } finally {
    await app.close();
  }
});
