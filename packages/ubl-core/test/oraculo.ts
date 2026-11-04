import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Oráculo de conformidad: reglas XSL oficiales de SUNAT (tools/sunat-oficial/oraculo.py). */
export interface VeredictoOficial {
  estado: 'ok' | 'rechazo';
  codigo: string | null;
  observaciones: string[];
}

export interface CasoOraculo {
  tipo: '01' | '03' | '07' | '08';
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

export function consultarOraculo(casos: CasoOraculo[]): VeredictoOficial[] {
  const salida = execFileSync(PYTHON, ['-I', SCRIPT], {
    input: JSON.stringify(casos),
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, FECHA_ORACULO: '2026-11-03' },
  });
  return JSON.parse(salida.toString()) as VeredictoOficial[];
}
