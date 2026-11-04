import { fileURLToPath } from 'node:url';
import { Verifier } from '@pact-foundation/pact';

/**
 * Verifica, contra un proveedor ya escuchando en `url`, el contrato que el SDK publicó en
 * pacts/chasqui-sdk-<proveedor>.json. `estados` prepara cada «given» del consumidor.
 */
export function verificarContrato(
  proveedor: string,
  url: string,
  estados: Record<string, () => Promise<unknown>> = {},
) {
  return new Verifier({
    provider: proveedor,
    providerBaseUrl: url,
    pactUrls: [
      fileURLToPath(new URL(`../../../pacts/chasqui-sdk-${proveedor}.json`, import.meta.url)),
    ],
    stateHandlers: Object.fromEntries(
      Object.entries(estados).map(([k, f]) => [
        k,
        async () => {
          await f();
        },
      ]),
    ),
    logLevel: 'error',
  }).verifyProvider();
}
