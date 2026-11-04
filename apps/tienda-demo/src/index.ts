import { construirServidor } from './servidor.js';

const app = construirServidor();
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 7600) });
