import { DatabaseSync } from 'node:sqlite';
import { Kysely, PostgresDialect, SqliteDialect } from 'kysely';
import pg from 'pg';

/**
 * Kysely sobre SQLite (node:sqlite, sin módulos nativos) o Postgres si la URL empieza con
 * postgres://. Ver docs/adr/0005.
 */

/** Adaptador de node:sqlite a la interfaz de better-sqlite3 que espera SqliteDialect. */
function sqliteNativo(ruta: string) {
  const db = new DatabaseSync(ruta);
  db.exec('PRAGMA journal_mode = WAL');
  return {
    close: () => {
      db.close();
    },
    prepare: (sql: string) => {
      const st = db.prepare(sql);
      return {
        reader: /^\s*(select|with|pragma)\b/i.test(sql) || /\breturning\b/i.test(sql),
        all: (p: readonly unknown[]) => st.all(...(p as never[])),
        run: (p: readonly unknown[]) => {
          const r = st.run(...(p as never[]));
          return { changes: r.changes, lastInsertRowid: r.lastInsertRowid };
        },
        iterate: (p: readonly unknown[]) => st.iterate(...(p as never[])),
      };
    },
  };
}

export function abrirKysely<T>(url = ':memory:'): Kysely<T> {
  const dialect = /^postgres(ql)?:\/\//.test(url)
    ? new PostgresDialect({ pool: new pg.Pool({ connectionString: url, max: 10 }) })
    : new SqliteDialect({ database: sqliteNativo(url.replace(/^sqlite:\/\//, '')) });
  return new Kysely<T>({ dialect });
}
