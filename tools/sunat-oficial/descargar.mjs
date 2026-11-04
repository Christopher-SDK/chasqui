#!/usr/bin/env node
// Descarga las reglas de validación y catálogos oficiales de SUNAT (paquete SFS/OSE) a
// .cache/sunat-oficial/ y verifica el SHA-256 de cada archivo contra activos.lock.tsv.
// Fuente y motivo de la réplica: docs/fuentes.md §1. No se versionan en el repo.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPLICA =
  'https://raw.githubusercontent.com/muglerman/ublkit-java/2319342d1f06a3f06deca4ddb944aaa521d10def/ublkit-validation/src/main/resources/sunat/';
const aqui = dirname(fileURLToPath(import.meta.url));
const destino = join(aqui, '../../.cache/sunat-oficial');
const sha = (b) => createHash('sha256').update(b).digest('hex');

const filas = (await readFile(join(aqui, 'activos.lock.tsv'), 'utf8'))
  .split('\n')
  .filter(Boolean)
  .map((l) => l.split('\t'));

let bajados = 0;
await Promise.all(
  filas.map(async ([hash, , ruta]) => {
    const archivo = join(destino, ruta);
    try {
      if (sha(await readFile(archivo)) === hash) return;
    } catch {
      /* no existe todavía */
    }
    const res = await fetch(REPLICA + ruta);
    if (!res.ok) throw new Error(`${ruta}: HTTP ${res.status}`);
    const datos = Buffer.from(await res.arrayBuffer());
    if (sha(datos) !== hash) throw new Error(`${ruta}: SHA-256 no coincide con el lock`);
    await mkdir(dirname(archivo), { recursive: true });
    await writeFile(archivo, datos);
    bajados++;
  }),
);
console.log(
  `sunat-oficial: ${filas.length} archivos verificados (${bajados} descargados) en ${destino}`,
);
