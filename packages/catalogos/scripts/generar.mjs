#!/usr/bin/env node
// Genera src/generado.ts desde los catálogos oficiales de SUNAT descargados y verificados por
// tools/sunat-oficial/descargar.mjs. El resultado se versiona; regenerarlo es determinista.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const base = join(aqui, '../../../.cache/sunat-oficial/validation/catalogo');
const lock = await readFile(join(aqui, '../../../tools/sunat-oficial/activos.lock.tsv'), 'utf8');
const hash = (archivo) =>
  lock
    .split('\n')
    .find((l) => l.endsWith(`/catalogo/${archivo}`))
    ?.split('\t')[0];

// Catálogos que usa Chasqui (Anexo 8, Resolución de Superintendencia 340-2017/SUNAT y modificatorias).
const CATALOGOS = {
  '01': 'Tipo de documento',
  '02': 'Monedas (ISO 4217)',
  '03': 'Unidades de medida (UN/ECE rec 20)',
  '05': 'Tipos de tributos',
  '06': 'Tipos de documento de identidad',
  '07': 'Tipo de afectación del IGV',
  '09': 'Tipo de nota de crédito',
  10: 'Tipo de nota de débito',
  11: 'Tipo de valor de venta (resumen diario)',
  12: 'Documentos relacionados tributarios',
  16: 'Tipo de precio de venta unitario',
  19: 'Código de estado del ítem (resumen diario)',
  51: 'Tipo de operación',
};

const desescapar = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

function leer(xml, etiqueta, clave) {
  const filas = {};
  const re = new RegExp(`<${etiqueta}\\s+([^>]*?)>([\\s\\S]*?)</${etiqueta}>`, 'g');
  for (const [, attrs, texto] of xml.matchAll(re)) {
    const { [clave]: id, ...a } = Object.fromEntries(
      [...attrs.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)].map(([, k, v]) => [k, v]),
    );
    // Duplicados reales en el oficial (p. ej. EUR en cat_02): se conserva la primera aparición.
    filas[id] ??= { nombre: desescapar(texto.trim()), ...a };
  }
  return filas;
}

let out = `// ARCHIVO GENERADO por scripts/generar.mjs — no editar a mano.\n// Fuente: paquete de validación SFS/OSE de SUNAT (ver docs/fuentes.md §1). SHA-256 por archivo abajo.\n\n`;
for (const [num, titulo] of Object.entries(CATALOGOS)) {
  const archivo = `cat_${num}.xml`;
  const filas = leer(await readFile(join(base, archivo), 'utf8'), 'c', 'id');
  out += `/** Catálogo N.° ${num}: ${titulo}. Fuente: ${archivo} (sha256 ${hash(archivo)}). */\n`;
  out += `export const catalogo${num} = ${JSON.stringify(filas, null, 2)} as const;\n\n`;
}
const errores = leer(await readFile(join(base, 'CatalogoErrores.xml'), 'utf8'), 'error', 'numero');
out += `/** Códigos de error y observación de SUNAT. Fuente: CatalogoErrores.xml (sha256 ${hash('CatalogoErrores.xml')}). */\n`;
out += `export const codigosError: Readonly<Record<string, string>> = ${JSON.stringify(
  Object.fromEntries(Object.entries(errores).map(([k, v]) => [k, v.nombre])),
  null,
  2,
)};\n`;
await writeFile(join(aqui, '../src/generado.ts'), out);
console.log(
  `catalogos: ${Object.keys(CATALOGOS).length} catálogos y ${Object.keys(errores).length} códigos de error`,
);
