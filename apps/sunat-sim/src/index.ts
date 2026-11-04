import { abrirDb } from './db.js';
import { construirServidor } from './servidor.js';

const app = await construirServidor({
  db: abrirDb(process.env.DB_URL ?? process.env.DB_RUTA ?? ':memory:'),
});
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 7100) });
