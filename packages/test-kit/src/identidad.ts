import { createHash } from 'node:crypto';

/**
 * Identidades ficticias y deterministas. Todas se derivan de un hash: el mismo número da siempre
 * la misma persona o empresa, sin guardar datos. Los nombres se combinan de listas genéricas; no
 * corresponden a personas reales.
 */

const PESOS_RUC = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;

/**
 * Dígito verificador del RUC (módulo 11 con pesos 5,4,3,2,7,6,5,4,3,2 sobre los 10 primeros
 * dígitos; 10 → 0 y 11 → 1). Fuente: docs/fuentes.md §11.
 */
export function digitoVerificadorRuc(diezDigitos: string): number {
  if (!/^\d{10}$/.test(diezDigitos))
    throw new RangeError(`Se esperaban 10 dígitos: ${diezDigitos}`);
  const suma = PESOS_RUC.reduce((s, peso, i) => s + Number(diezDigitos.charAt(i)) * peso, 0);
  const v = 11 - (suma % 11);
  return v === 10 ? 0 : v === 11 ? 1 : v;
}

/** RUC con prefijo válido (10 persona natural, 15/17 otros, 20 empresa) y dígito verificador correcto. */
export function rucValido(ruc: string): boolean {
  return (
    /^(10|15|17|20)\d{9}$/.test(ruc) && digitoVerificadorRuc(ruc.slice(0, 10)) === Number(ruc[10])
  );
}

export const dniValido = (dni: string): boolean => /^\d{8}$/.test(dni);

/** n-ésimo RUC de empresa ficticio y válido (20 + 8 dígitos + verificador). */
export function rucEmpresa(n: number): string {
  const base = `20${String(n % 100_000_000).padStart(8, '0')}`;
  return `${base}${String(digitoVerificadorRuc(base))}`;
}

/** RUC de persona natural para un DNI (10 + DNI + verificador). */
export function rucPersona(dni: string): string {
  if (!dniValido(dni)) throw new RangeError(`DNI inválido: ${dni}`);
  const base = `10${dni}`;
  return `${base}${String(digitoVerificadorRuc(base))}`;
}

/** n-ésimo DNI ficticio. */
export const dni = (n: number): string => String(n % 100_000_000).padStart(8, '0');

const NOMBRES = [
  'ANA',
  'LUIS',
  'ROSA',
  'JORGE',
  'CARMEN',
  'MIGUEL',
  'LUCIA',
  'JOSE',
  'ELENA',
  'DIEGO',
  'SOFIA',
  'PEDRO',
  'MARIA',
  'RAUL',
  'JULIA',
  'CESAR',
] as const;
const APELLIDOS = [
  'QUISPE',
  'FLORES',
  'MAMANI',
  'HUAMAN',
  'RAMOS',
  'TORRES',
  'CHAVEZ',
  'VARGAS',
  'ROJAS',
  'CASTILLO',
  'MENDOZA',
  'GUTIERREZ',
  'SALAZAR',
  'PAREDES',
  'CORDOVA',
  'VILCA',
] as const;
const RUBROS = [
  'INVERSIONES',
  'COMERCIAL',
  'DISTRIBUIDORA',
  'SERVICIOS',
  'CORPORACION',
  'TRANSPORTES',
  'CONSTRUCTORA',
  'AGROINDUSTRIAS',
] as const;
const NUCLEOS = [
  'ANDINA',
  'DEL PACIFICO',
  'LOS ANDES',
  'SAN MARTIN',
  'NORTE',
  'ALTIPLANO',
  'AMAZONICA',
  'COSTA VERDE',
  'INTI',
  'CHASKI',
] as const;
const SOCIEDADES = ['S.A.C.', 'S.A.', 'E.I.R.L.', 'S.R.L.'] as const;
const DISTRITOS = [
  ['150101', 'LIMA'],
  ['150122', 'MIRAFLORES'],
  ['040101', 'AREQUIPA'],
  ['130101', 'TRUJILLO'],
  ['080101', 'CUSCO'],
] as const;

/** Entero determinista en [0, n) a partir de una semilla y una etiqueta. */
function elegir(semilla: string, etiqueta: string, n: number): number {
  return createHash('sha256').update(`${semilla}|${etiqueta}`).digest().readUInt32BE(0) % n;
}

const de = <T>(lista: readonly T[], semilla: string, etiqueta: string): T =>
  lista[elegir(semilla, etiqueta, lista.length)] as T;

export interface Persona {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export function personaFicticia(numeroDni: string): Persona {
  return {
    dni: numeroDni,
    nombres: de(NOMBRES, numeroDni, 'nombre'),
    apellidoPaterno: de(APELLIDOS, numeroDni, 'paterno'),
    apellidoMaterno: de(APELLIDOS, numeroDni, 'materno'),
  };
}

export type EstadoContribuyente =
  'ACTIVO' | 'BAJA DE OFICIO' | 'BAJA DEFINITIVA' | 'SUSPENSION TEMPORAL';
export type CondicionDomicilio = 'HABIDO' | 'NO HABIDO';

export interface Contribuyente {
  ruc: string;
  razonSocial: string;
  estado: EstadoContribuyente;
  condicion: CondicionDomicilio;
  ubigeo: string;
  direccion: string;
}

/**
 * Contribuyente ficticio para un RUC válido. Distribución determinista: 80 % activo y habido,
 * 8 % no habido, 6 % baja de oficio, 3 % baja definitiva, 3 % suspensión temporal.
 */
export function contribuyenteFicticio(ruc: string): Contribuyente {
  const dado = elegir(ruc, 'estado', 100);
  const estado: EstadoContribuyente =
    dado < 88
      ? 'ACTIVO'
      : dado < 94
        ? 'BAJA DE OFICIO'
        : dado < 97
          ? 'BAJA DEFINITIVA'
          : 'SUSPENSION TEMPORAL';
  const condicion: CondicionDomicilio = dado >= 80 && dado < 88 ? 'NO HABIDO' : 'HABIDO';
  const [ubigeo, distrito] = de(DISTRITOS, ruc, 'distrito');
  const razonSocial = ruc.startsWith('10')
    ? (() => {
        const p = personaFicticia(ruc.slice(2, 10));
        return `${p.apellidoPaterno} ${p.apellidoMaterno} ${p.nombres}`;
      })()
    : `${de(RUBROS, ruc, 'rubro')} ${de(NUCLEOS, ruc, 'nucleo')} ${de(SOCIEDADES, ruc, 'sociedad')}`;
  return {
    ruc,
    razonSocial,
    estado,
    condicion,
    ubigeo,
    direccion: `AV. FICTICIA ${String(100 + elegir(ruc, 'numero', 900))} - ${distrito}`,
  };
}
