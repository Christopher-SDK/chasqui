import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Veredicto } from '../src/validador/index.js';

/** Oráculo de conformidad: reglas XSL oficiales de SUNAT (tools/sunat-oficial/oraculo.py). */
export interface VeredictoOficial {
  estado: 'ok' | 'rechazo';
  codigo: string | null;
  observaciones: string[];
}

export interface CasoOraculo {
  tipo: '01' | '03' | '07' | '08' | '09' | 'RA' | 'RC';
  nombre: string;
  xml: string;
}

const SCRIPT = fileURLToPath(new URL('../../../tools/sunat-oficial/oraculo.py', import.meta.url));
const REGLAS = fileURLToPath(new URL('../../../.cache/sunat-oficial/validation', import.meta.url));
const VENV = fileURLToPath(
  new URL('../../../tools/sunat-oficial/.venv/bin/python', import.meta.url),
);
/** Intérprete: ORACULO_PYTHON, o el venv de tools/sunat-oficial (`pnpm sunat:preparar`). */
const PYTHON = process.env.ORACULO_PYTHON ?? (existsSync(VENV) ? VENV : 'python3');

/** El oráculo necesita python3 + lxml y las reglas descargadas (`pnpm sunat:preparar`). */
export const oraculoDisponible = (() => {
  if (!existsSync(REGLAS)) return false;
  try {
    execFileSync(PYTHON, ['-I', '-c', 'import lxml'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

const CACHE = fileURLToPath(new URL('../../../.cache/oraculo/', import.meta.url));
const LOCK = fileURLToPath(
  new URL('../../../tools/sunat-oficial/activos.lock.tsv', import.meta.url),
);

/**
 * Veredictos oficiales para `casos`. Son deterministas, así que se guardan en .cache/oraculo/
 * con una clave que cubre los casos, el script del oráculo y el lock de las reglas: cambiar
 * cualquiera de los tres invalida la caché. Así el mutation testing no relanza Python por mutante.
 */
export function consultarOraculo(casos: CasoOraculo[]): VeredictoOficial[] {
  const entrada = JSON.stringify(casos);
  const clave = createHash('sha256')
    .update(entrada)
    .update(readFileSync(SCRIPT))
    .update(readFileSync(LOCK))
    .digest('hex');
  const archivo = `${CACHE}${clave}.json`;
  if (existsSync(archivo)) return JSON.parse(readFileSync(archivo, 'utf8')) as VeredictoOficial[];
  const salida = execFileSync(PYTHON, ['-I', SCRIPT], {
    input: entrada,
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, FECHA_ORACULO: '2026-11-03' },
  }).toString();
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(archivo, salida);
  return JSON.parse(salida) as VeredictoOficial[];
}

/** Veredicto de Chasqui en el formato del oráculo. */
export function comoOficial(v: Veredicto): VeredictoOficial {
  return {
    estado: v.estado === 'rechazado' ? 'rechazo' : 'ok',
    codigo: v.error?.codigo ?? null,
    observaciones: v.observaciones.map((o) => o.codigo),
  };
}
