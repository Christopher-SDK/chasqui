import { construirServidor } from './servidor.js';

const app = await construirServidor();
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 7400) });
