import { abrirKysely } from '@chasqui/db';
import type { Kysely } from 'kysely';

/** Montos en céntimos (enteros): sin errores de punto flotante en saldos. */
export interface Esquema {
  cuentas: {
    celular: string;
    titular: string;
    billetera: string;
    saldo: number;
    limite_operacion: number;
    limite_diario: number;
  };
  transferencias: {
    id: string;
    clave_idempotencia: string;
    hash_peticion: string;
    origen: string;
    destino: string;
    monto: number;
    descripcion: string;
    estado: 'pendiente' | 'completada' | 'rechazada' | 'revertida';
    motivo: string | null;
    cobro_id: string | null;
    listo_en: string;
    creado_en: string;
    actualizado_en: string;
  };
  cobros: {
    id: string;
    destino: string;
    monto: number | null;
    descripcion: string;
    payload: string;
    estado: 'pendiente' | 'pagado';
    transferencia_id: string | null;
    creado_en: string;
  };
  suscripciones: { id: string; url: string; secreto: string; creado_en: string };
  entregas: {
    id: string;
    suscripcion_id: string;
    evento: string;
    cuerpo: string;
    intentos: number;
    proximo_intento: string;
    estado: 'pendiente' | 'entregada' | 'fallida';
    ultimo_error: string | null;
    creado_en: string;
  };
}

export type Db = Kysely<Esquema>;

export const abrirDb = (url = process.env.DB_URL ?? ':memory:'): Db => abrirKysely<Esquema>(url);

export async function migrar(db: Db): Promise<void> {
  await db.schema
    .createTable('cuentas')
    .ifNotExists()
    .addColumn('celular', 'varchar(9)', (c) => c.primaryKey())
    .addColumn('titular', 'varchar(120)', (c) => c.notNull())
    .addColumn('billetera', 'varchar(40)', (c) => c.notNull())
    .addColumn('saldo', 'integer', (c) => c.notNull())
    .addColumn('limite_operacion', 'integer', (c) => c.notNull())
    .addColumn('limite_diario', 'integer', (c) => c.notNull())
    .execute();
  await db.schema
    .createTable('transferencias')
    .ifNotExists()
    .addColumn('id', 'varchar(40)', (c) => c.primaryKey())
    // La idempotencia la garantiza la base de datos, no solo el código.
    .addColumn('clave_idempotencia', 'varchar(120)', (c) => c.notNull().unique())
    .addColumn('hash_peticion', 'varchar(64)', (c) => c.notNull())
    .addColumn('origen', 'varchar(9)', (c) => c.notNull())
    .addColumn('destino', 'varchar(9)', (c) => c.notNull())
    .addColumn('monto', 'integer', (c) => c.notNull())
    .addColumn('descripcion', 'varchar(140)', (c) => c.notNull())
    .addColumn('estado', 'varchar(12)', (c) => c.notNull())
    .addColumn('motivo', 'varchar(40)')
    .addColumn('cobro_id', 'varchar(40)')
    .addColumn('listo_en', 'varchar(32)', (c) => c.notNull())
    .addColumn('creado_en', 'varchar(32)', (c) => c.notNull())
    .addColumn('actualizado_en', 'varchar(32)', (c) => c.notNull())
    .execute();
  await db.schema
    .createTable('cobros')
    .ifNotExists()
    .addColumn('id', 'varchar(40)', (c) => c.primaryKey())
    .addColumn('destino', 'varchar(9)', (c) => c.notNull())
    .addColumn('monto', 'integer')
    .addColumn('descripcion', 'varchar(140)', (c) => c.notNull())
    .addColumn('payload', 'text', (c) => c.notNull())
    .addColumn('estado', 'varchar(12)', (c) => c.notNull())
    .addColumn('transferencia_id', 'varchar(40)')
    .addColumn('creado_en', 'varchar(32)', (c) => c.notNull())
    .execute();
  await db.schema
    .createTable('suscripciones')
    .ifNotExists()
    .addColumn('id', 'varchar(40)', (c) => c.primaryKey())
    .addColumn('url', 'text', (c) => c.notNull())
    .addColumn('secreto', 'varchar(80)', (c) => c.notNull())
    .addColumn('creado_en', 'varchar(32)', (c) => c.notNull())
    .execute();
  await db.schema
    .createTable('entregas')
    .ifNotExists()
    .addColumn('id', 'varchar(40)', (c) => c.primaryKey())
    .addColumn('suscripcion_id', 'varchar(40)', (c) => c.notNull())
    .addColumn('evento', 'varchar(40)', (c) => c.notNull())
    .addColumn('cuerpo', 'text', (c) => c.notNull())
    .addColumn('intentos', 'integer', (c) => c.notNull())
    .addColumn('proximo_intento', 'varchar(32)', (c) => c.notNull())
    .addColumn('estado', 'varchar(12)', (c) => c.notNull())
    .addColumn('ultimo_error', 'text')
    .addColumn('creado_en', 'varchar(32)', (c) => c.notNull())
    .execute();
}
