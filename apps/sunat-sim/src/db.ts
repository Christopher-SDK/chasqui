import { abrirKysely } from '@chasqui/db';
import type { Generated, Kysely } from 'kysely';

/**
 * Persistencia con Kysely: SQLite por defecto (node:sqlite, sin módulos nativos) y Postgres si
 * DB_URL empieza con postgres://. Ver docs/adr/0005.
 */

export type EstadoComprobante = 'aceptado' | 'observado' | 'rechazado' | 'anulado';

export interface TablaComprobantes {
  id: string;
  ruc: string;
  tipo: string;
  serie: string;
  numero: number;
  fecha_emision: string;
  hash: string;
  estado: EstadoComprobante;
  codigo: string;
  mensaje: string;
  observaciones: string;
  canal: string;
  xml: string;
  cdr: string | null;
  recibido_en: string;
}

export interface TablaTickets {
  ticket: string;
  tipo: string;
  nombre: string;
  /** Códigos de getStatus: 98 en proceso, 0 procesado, 99 procesado con errores. */
  estado: string;
  codigo: string;
  cdr: string | null;
  xml: string;
  creado_en: string;
  listo_en: string;
}

export interface TablaSecuencias {
  nombre: string;
  valor: Generated<number>;
}

export interface Esquema {
  comprobantes: TablaComprobantes;
  tickets: TablaTickets;
  secuencias: TablaSecuencias;
}

export type Db = Kysely<Esquema>;

export function abrirDb(url = process.env.DB_URL ?? ':memory:'): Db {
  return abrirKysely<Esquema>(url);
}

export async function migrar(db: Db): Promise<void> {
  await db.schema
    .createTable('comprobantes')
    .ifNotExists()
    .addColumn('id', 'varchar(64)', (c) => c.primaryKey())
    .addColumn('ruc', 'varchar(11)', (c) => c.notNull())
    .addColumn('tipo', 'varchar(2)', (c) => c.notNull())
    .addColumn('serie', 'varchar(4)', (c) => c.notNull())
    .addColumn('numero', 'integer', (c) => c.notNull())
    .addColumn('fecha_emision', 'varchar(10)', (c) => c.notNull())
    .addColumn('hash', 'varchar(64)', (c) => c.notNull())
    .addColumn('estado', 'varchar(12)', (c) => c.notNull())
    .addColumn('codigo', 'varchar(4)', (c) => c.notNull())
    .addColumn('mensaje', 'text', (c) => c.notNull())
    .addColumn('observaciones', 'text', (c) => c.notNull())
    .addColumn('canal', 'varchar(8)', (c) => c.notNull())
    .addColumn('xml', 'text', (c) => c.notNull())
    .addColumn('cdr', 'text')
    .addColumn('recibido_en', 'varchar(32)', (c) => c.notNull())
    // Un comprobante (RUC + tipo + serie + número) se registra una sola vez: base de 1032/1033.
    .addUniqueConstraint('comprobantes_unico', ['ruc', 'tipo', 'serie', 'numero'])
    .execute();
  await db.schema
    .createTable('tickets')
    .ifNotExists()
    .addColumn('ticket', 'varchar(32)', (c) => c.primaryKey())
    .addColumn('tipo', 'varchar(2)', (c) => c.notNull())
    .addColumn('nombre', 'varchar(64)', (c) => c.notNull())
    .addColumn('estado', 'varchar(2)', (c) => c.notNull())
    .addColumn('codigo', 'varchar(4)', (c) => c.notNull())
    .addColumn('cdr', 'text')
    .addColumn('xml', 'text', (c) => c.notNull())
    .addColumn('creado_en', 'varchar(32)', (c) => c.notNull())
    .addColumn('listo_en', 'varchar(32)', (c) => c.notNull())
    .execute();
  await db.schema
    .createTable('secuencias')
    .ifNotExists()
    .addColumn('nombre', 'varchar(32)', (c) => c.primaryKey())
    .addColumn('valor', 'integer', (c) => c.notNull())
    .execute();
}

/** Siguiente valor de una secuencia (IDs de CDR y tickets deterministas). */
export async function siguiente(db: Db, nombre: string): Promise<number> {
  return db.transaction().execute(async (tx) => {
    const fila = await tx
      .selectFrom('secuencias')
      .select('valor')
      .where('nombre', '=', nombre)
      .executeTakeFirst();
    const valor = (fila?.valor ?? 0) + 1;
    if (fila)
      await tx.updateTable('secuencias').set({ valor }).where('nombre', '=', nombre).execute();
    else await tx.insertInto('secuencias').values({ nombre, valor }).execute();
    return valor;
  });
}
