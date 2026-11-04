import { createHash, createHmac, randomBytes } from 'node:crypto';
import type { Falla } from '@chasqui/chaos-engine';
import { dni, personaFicticia } from '@chasqui/test-kit';
import type { Db, Esquema } from './db.js';

/**
 * Billetera interoperable simulada: transferencias P2P por número de celular entre billeteras
 * ficticias («Billetera A», «Billetera B»). Montos en céntimos.
 *
 * Estados: pendiente → completada | rechazada; completada → revertida. Entre la misma billetera la
 * transferencia se completa al instante; entre billeteras distintas queda pendiente unos segundos,
 * como un pago interoperable real, y luego se completa. Ver docs/fuentes.md §12.
 */

export type Transferencia = Esquema['transferencias'];
export type Evento =
  | 'transferencia.completada'
  | 'transferencia.rechazada'
  | 'transferencia.revertida'
  | 'cobro.pagado';

export interface Contexto {
  db: Db;
  ahora: () => Date;
  /** Milisegundos que una transferencia entre billeteras distintas queda pendiente. */
  demoraInterbilletera: number;
  publicar: (evento: Evento, datos: Record<string, unknown>) => Promise<void>;
}

export const LIMITE_OPERACION = 50_000; // S/ 500.00
export const LIMITE_DIARIO = 200_000; // S/ 2,000.00
const NUNCA = '9999-12-31T23:59:59.999Z';

const id = (prefijo: string) => `${prefijo}_${randomBytes(9).toString('base64url')}`;
const hoyLima = (d: Date) => new Date(d.getTime() - 5 * 3600_000).toISOString().slice(0, 10);

/** Diez cuentas ficticias: 900000001…900000010, S/ 1,000.00 cada una. */
export async function sembrar(db: Db): Promise<void> {
  const hay = await db.selectFrom('cuentas').select('celular').limit(1).executeTakeFirst();
  if (hay) return;
  for (let n = 1; n <= 10; n++) {
    const p = personaFicticia(dni(n));
    await db
      .insertInto('cuentas')
      .values({
        celular: `9${String(n).padStart(8, '0')}`,
        titular: `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
        billetera: n % 2 === 1 ? 'Billetera A' : 'Billetera B',
        saldo: 100_000,
        limite_operacion: LIMITE_OPERACION,
        limite_diario: LIMITE_DIARIO,
      })
      .execute();
  }
}

/** Titular enmascarado, como lo muestran las billeteras antes de confirmar: «Ana Q. F.». */
export function enmascarar(titular: string): string {
  const [nombre = '', ...apellidos] = titular.split(' ');
  return [
    nombre.charAt(0) + nombre.slice(1).toLowerCase(),
    ...apellidos.map((a) => `${a.charAt(0)}.`),
  ].join(' ');
}

export interface Solicitud {
  origen: string;
  destino: string;
  /** Céntimos. */
  monto: number;
  descripcion: string;
  cobroId?: string;
}

export type Resultado =
  | { tipo: 'creada'; transferencia: Transferencia }
  | { tipo: 'repetida'; transferencia: Transferencia }
  | { tipo: 'conflicto' };

/** Violación de unicidad en SQLite (node:sqlite) o Postgres (23505). */
const esUnicidad = (e: unknown) =>
  e instanceof Error &&
  (/UNIQUE constraint failed/i.test(e.message) || (e as { code?: string }).code === '23505');

export const hashSolicitud = (s: Solicitud) =>
  createHash('sha256')
    .update(JSON.stringify([s.origen, s.destino, s.monto, s.descripcion, s.cobroId ?? null]))
    .digest('hex');

/**
 * Crea una transferencia de forma idempotente. Misma clave y mismo cuerpo: devuelve la misma
 * transferencia. Misma clave y otro cuerpo: conflicto (422). La unicidad la garantiza la base.
 */
export async function transferir(
  ctx: Contexto,
  clave: string,
  s: Solicitud,
  caos: readonly Falla[] = [],
): Promise<Resultado> {
  const hash = hashSolicitud(s);
  const previa = await ctx.db
    .selectFrom('transferencias')
    .selectAll()
    .where('clave_idempotencia', '=', clave)
    .executeTakeFirst();
  if (previa)
    return previa.hash_peticion === hash
      ? { tipo: 'repetida', transferencia: previa }
      : { tipo: 'conflicto' };

  const ahora = ctx.ahora();
  const t: Transferencia = {
    id: id('trf'),
    clave_idempotencia: clave,
    hash_peticion: hash,
    origen: s.origen,
    destino: s.destino,
    monto: s.monto,
    descripcion: s.descripcion,
    estado: 'pendiente',
    motivo: null,
    cobro_id: s.cobroId ?? null,
    listo_en: ahora.toISOString(),
    creado_en: ahora.toISOString(),
    actualizado_en: ahora.toISOString(),
  };

  let motivo: string | null;
  try {
    motivo = await ctx.db.transaction().execute(async (tx) => {
      const [o, d] = await Promise.all([
        tx.selectFrom('cuentas').selectAll().where('celular', '=', s.origen).executeTakeFirst(),
        tx.selectFrom('cuentas').selectAll().where('celular', '=', s.destino).executeTakeFirst(),
      ]);
      const rechazo = (m: string) => {
        t.estado = 'rechazada';
        t.motivo = m;
        return m;
      };
      let m: string | null = null;
      if (caos.some((f) => f.tipo === 'rechazo')) m = rechazo('RECHAZO_SIMULADO');
      else if (!o || !d) m = rechazo('CUENTA_NO_EXISTE');
      else if (o.celular === d.celular) m = rechazo('MISMA_CUENTA');
      else if (s.monto > o.limite_operacion) m = rechazo('LIMITE_OPERACION');
      else if (s.monto > o.saldo) m = rechazo('SALDO_INSUFICIENTE');
      else {
        const hoy = await tx
          .selectFrom('transferencias')
          .select((eb) => eb.fn.sum<number | string>('monto').as('total'))
          .where('origen', '=', o.celular)
          .where('estado', 'in', ['pendiente', 'completada'])
          .where('creado_en', '>=', `${hoyLima(ahora)}T05:00:00.000Z`)
          .executeTakeFirst();
        if (Number(hoy?.total ?? 0) + s.monto > o.limite_diario) m = rechazo('LIMITE_DIARIO');
      }
      if (!m && o && d) {
        // Se reserva el monto al crear: no se puede gastar dos veces mientras está pendiente.
        await tx
          .updateTable('cuentas')
          .set({ saldo: o.saldo - s.monto })
          .where('celular', '=', o.celular)
          .execute();
        if (caos.some((f) => f.tipo === 'ticketEterno')) t.listo_en = NUNCA;
        else if (o.billetera === d.billetera) {
          await tx
            .updateTable('cuentas')
            .set({ saldo: d.saldo + s.monto })
            .where('celular', '=', d.celular)
            .execute();
          t.estado = 'completada';
        } else t.listo_en = new Date(ahora.getTime() + ctx.demoraInterbilletera).toISOString();
      }
      await tx.insertInto('transferencias').values(t).execute();
      return m;
    });
  } catch (e) {
    // Dos peticiones concurrentes con la misma clave: la base rechaza la segunda (UNIQUE) y se
    // responde con la transferencia que quedó registrada.
    if (!esUnicidad(e)) throw e;
    const ganadora = await ctx.db
      .selectFrom('transferencias')
      .selectAll()
      .where('clave_idempotencia', '=', clave)
      .executeTakeFirstOrThrow();
    return ganadora.hash_peticion === hash
      ? { tipo: 'repetida', transferencia: ganadora }
      : { tipo: 'conflicto' };
  }

  if (t.estado === 'completada') await alCompletar(ctx, t);
  if (motivo) await ctx.publicar('transferencia.rechazada', { transferencia: publica(t) });
  return { tipo: 'creada', transferencia: t };
}

async function alCompletar(ctx: Contexto, t: Transferencia) {
  await ctx.publicar('transferencia.completada', { transferencia: publica(t) });
  if (t.cobro_id) {
    await ctx.db
      .updateTable('cobros')
      .set({ estado: 'pagado', transferencia_id: t.id })
      .where('id', '=', t.cobro_id)
      .execute();
    await ctx.publicar('cobro.pagado', { cobroId: t.cobro_id, transferencia: publica(t) });
  }
}

/** Completa las transferencias pendientes cuya demora ya pasó. Lo llama el trabajador. */
export async function completarPendientes(ctx: Contexto): Promise<number> {
  const ahora = ctx.ahora().toISOString();
  const listas = await ctx.db
    .selectFrom('transferencias')
    .selectAll()
    .where('estado', '=', 'pendiente')
    .where('listo_en', '<=', ahora)
    .execute();
  for (const t of listas) {
    await ctx.db.transaction().execute(async (tx) => {
      const d = await tx
        .selectFrom('cuentas')
        .select('saldo')
        .where('celular', '=', t.destino)
        .executeTakeFirstOrThrow();
      await tx
        .updateTable('cuentas')
        .set({ saldo: d.saldo + t.monto })
        .where('celular', '=', t.destino)
        .execute();
      await tx
        .updateTable('transferencias')
        .set({ estado: 'completada', actualizado_en: ahora })
        .where('id', '=', t.id)
        .execute();
    });
    await alCompletar(ctx, { ...t, estado: 'completada', actualizado_en: ahora });
  }
  return listas.length;
}

export type ResultadoReversion =
  | { ok: true; transferencia: Transferencia }
  | { ok: false; codigo: 'NO_ENCONTRADA' | 'NO_REVERSIBLE' | 'SALDO_INSUFICIENTE_DESTINO' };

/** Revierte una transferencia completada: devuelve el dinero al origen. */
export async function revertir(
  ctx: Contexto,
  idTransferencia: string,
): Promise<ResultadoReversion> {
  const ahora = ctx.ahora().toISOString();
  const r = await ctx.db.transaction().execute(async (tx): Promise<ResultadoReversion> => {
    const t = await tx
      .selectFrom('transferencias')
      .selectAll()
      .where('id', '=', idTransferencia)
      .executeTakeFirst();
    if (!t) return { ok: false, codigo: 'NO_ENCONTRADA' };
    if (t.estado !== 'completada') return { ok: false, codigo: 'NO_REVERSIBLE' };
    const d = await tx
      .selectFrom('cuentas')
      .select('saldo')
      .where('celular', '=', t.destino)
      .executeTakeFirstOrThrow();
    if (d.saldo < t.monto) return { ok: false, codigo: 'SALDO_INSUFICIENTE_DESTINO' };
    const o = await tx
      .selectFrom('cuentas')
      .select('saldo')
      .where('celular', '=', t.origen)
      .executeTakeFirstOrThrow();
    await tx
      .updateTable('cuentas')
      .set({ saldo: d.saldo - t.monto })
      .where('celular', '=', t.destino)
      .execute();
    await tx
      .updateTable('cuentas')
      .set({ saldo: o.saldo + t.monto })
      .where('celular', '=', t.origen)
      .execute();
    await tx
      .updateTable('transferencias')
      .set({ estado: 'revertida', actualizado_en: ahora })
      .where('id', '=', t.id)
      .execute();
    return { ok: true, transferencia: { ...t, estado: 'revertida', actualizado_en: ahora } };
  });
  if (r.ok)
    await ctx.publicar('transferencia.revertida', { transferencia: publica(r.transferencia) });
  return r;
}

/** Vista pública de una transferencia (montos en soles con dos decimales). */
export function publica(t: Transferencia) {
  return {
    id: t.id,
    origen: t.origen,
    destino: t.destino,
    monto: (t.monto / 100).toFixed(2),
    moneda: 'PEN' as const,
    descripcion: t.descripcion,
    estado: t.estado,
    motivo: t.motivo,
    cobroId: t.cobro_id,
    creadoEn: t.creado_en,
    actualizadoEn: t.actualizado_en,
  };
}

/**
 * Firma de webhooks: X-Chasqui-Firma: t=<unix>,v1=<hex(HMAC-SHA256(secreto, `${t}.${cuerpo}`))>.
 * El receptor recalcula la firma y descarta mensajes con t muy antiguo (anti-replay).
 */
export function firmarWebhook(secreto: string, cuerpo: string, t: number): string {
  return `t=${String(t)},v1=${createHmac('sha256', secreto)
    .update(`${String(t)}.${cuerpo}`)
    .digest('hex')}`;
}

/** Esperas entre reintentos: 1, 2, 4, 8 y 16 s. Tras el sexto intento fallido, «fallida». */
export const BACKOFF_MS = [1000, 2000, 4000, 8000, 16_000] as const;

export async function encolar(ctx: Contexto, evento: Evento, datos: Record<string, unknown>) {
  const ahora = ctx.ahora().toISOString();
  const subs = await ctx.db.selectFrom('suscripciones').selectAll().execute();
  for (const s of subs) {
    await ctx.db
      .insertInto('entregas')
      .values({
        id: id('evt'),
        suscripcion_id: s.id,
        evento,
        cuerpo: JSON.stringify({ evento, creadoEn: ahora, datos }),
        intentos: 0,
        proximo_intento: ahora,
        estado: 'pendiente',
        ultimo_error: null,
        creado_en: ahora,
      })
      .execute();
  }
}

/** Intenta las entregas vencidas. Con backoff exponencial y tope de 6 intentos. */
export async function entregarWebhooks(
  ctx: Contexto,
  enviar: typeof fetch = fetch,
): Promise<number> {
  const ahora = ctx.ahora();
  const vencidas = await ctx.db
    .selectFrom('entregas')
    .innerJoin('suscripciones', 'suscripciones.id', 'entregas.suscripcion_id')
    .select([
      'entregas.id',
      'entregas.evento',
      'entregas.cuerpo',
      'entregas.intentos',
      'suscripciones.url',
      'suscripciones.secreto',
    ])
    .where('entregas.estado', '=', 'pendiente')
    .where('entregas.proximo_intento', '<=', ahora.toISOString())
    .execute();
  for (const e of vencidas) {
    let error: string | null = null;
    try {
      const r = await enviar(e.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-chasqui-evento': e.evento,
          'x-chasqui-entrega': e.id,
          'x-chasqui-firma': firmarWebhook(e.secreto, e.cuerpo, Math.floor(ahora.getTime() / 1000)),
        },
        body: e.cuerpo,
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) error = `HTTP ${String(r.status)}`;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    const intentos = e.intentos + 1;
    const espera = BACKOFF_MS[intentos - 1];
    await ctx.db
      .updateTable('entregas')
      .set(
        error === null
          ? { estado: 'entregada', intentos, ultimo_error: null }
          : espera === undefined
            ? { estado: 'fallida', intentos, ultimo_error: error }
            : {
                intentos,
                ultimo_error: error,
                proximo_intento: new Date(ahora.getTime() + espera).toISOString(),
              },
      )
      .where('id', '=', e.id)
      .execute();
  }
  return vencidas.length;
}
