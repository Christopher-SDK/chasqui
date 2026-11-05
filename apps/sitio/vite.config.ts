import { cpSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const RAIZ = import.meta.dirname;
const FUERA = new Set(['node_modules', 'dist', 'src', 'public', 'scripts', 'datos']);
const REGLAS = resolve(import.meta.dirname, '../../packages/ubl-core/src/validador/oficial');

/** Todas las páginas generadas por scripts/generar.mjs (index.html por carpeta + 404.html). */
function paginas(dir = RAIZ, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) {
      if (!(dir === RAIZ && FUERA.has(e.name))) paginas(ruta, out);
    } else if (e.name === 'index.html' || e.name === '404.html') out.push(ruta);
  }
  return out;
}

/**
 * Las hojas oficiales compiladas (src/validador/oficial/*.json) se sirven como archivos estáticos
 * en /reglas/: el validador del navegador las pide con fetch solo cuando se usa la demo.
 */
function reglasOficiales(): Plugin {
  return {
    name: 'chasqui-reglas',
    configureServer(server) {
      server.middlewares.use('/reglas/', (req, res, next) => {
        const archivo = join(REGLAS, (req.url ?? '').replace(/^\//, '').split('?')[0] ?? '');
        if (!archivo.startsWith(REGLAS) || !existsSync(archivo)) {
          next();
          return;
        }
        res.setHeader('content-type', 'application/json');
        res.end(readFileSync(archivo));
      });
    },
    writeBundle(opciones) {
      cpSync(REGLAS, join(opciones.dir ?? 'dist', 'reglas'), { recursive: true });
    },
  };
}

export default defineConfig({
  root: RAIZ,
  publicDir: resolve(import.meta.dirname, 'public'),
  appType: 'mpa',
  plugins: [reglasOficiales()],
  resolve: {
    conditions: ['source'],
    // El validador lee las hojas con node:fs; en el navegador las pide por fetch.
    alias: [
      {
        find: /^\.\/oficial\.js$/,
        replacement: resolve(import.meta.dirname, 'src/oficial-navegador.ts'),
      },
    ],
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 0,
    rolldownOptions: { input: paginas() },
  },
});
