import { iniciarTelemetria } from '@chasqui/telemetria';
import { construirServidor } from './servidor.js';

iniciarTelemetria('pagos-sim');

const app = await construirServidor();
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 7200) });
