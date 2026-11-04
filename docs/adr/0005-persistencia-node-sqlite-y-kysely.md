# 0005 · Persistencia: node:sqlite por defecto, Postgres opcional, con Kysely

- Estado: aceptada · 2026-11-04

## Contexto

El plan pide SQLite por defecto (simple de levantar) y Postgres opcional. `better-sqlite3`, la
opción habitual, es un módulo nativo: complica la imagen Alpine y la CI.

## Decisión

- **Kysely** como constructor de consultas: un solo código para ambos motores, con tipos.
- **SQLite con `node:sqlite`**, incluido en Node 22, sin dependencias nativas. Un adaptador de 20
  líneas (`apps/sunat-sim/src/db.ts`) le da a `SqliteDialect` la interfaz de better-sqlite3; el
  campo `reader` le indica a Kysely si la sentencia devuelve filas.
- **Postgres** con `pg` (JavaScript puro) cuando `DB_URL` empieza con `postgres://`.
- Migraciones con el constructor de esquemas de Kysely (portables). La unicidad del comprobante
  (RUC + tipo + serie + número) es una restricción de la base de datos, no solo del código.

## Consecuencias

- `node:sqlite` emite un aviso de característica experimental en Node 22; la imagen define
  `NODE_NO_WARNINGS=1`. Se puede reemplazar por better-sqlite3 sin tocar las consultas.
- Por defecto la base es en memoria (`:memory:`); docker compose la persiste en un volumen.
