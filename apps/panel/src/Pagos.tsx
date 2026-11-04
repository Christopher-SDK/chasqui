import { useCallback, useEffect, useState } from 'react';
import {
  cobrar,
  cuentas,
  enlaceTraza,
  escucharPagos,
  revertir,
  transferencias,
  transferir,
  type Cuenta,
  type Transferencia,
} from './api';

const CLASE_ESTADO: Record<Transferencia['estado'], string> = {
  pendiente:
    'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/30',
  completada:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30',
  rechazada:
    'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30',
  revertida:
    'bg-stone-100 text-stone-600 ring-stone-500/20 dark:bg-stone-500/10 dark:text-stone-300 dark:ring-stone-400/30',
};

const tarjeta =
  'rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900';
const campo =
  'w-full rounded-lg border border-stone-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[var(--color-marca)] dark:border-stone-700';
const boton =
  'rounded-lg bg-[var(--color-marca)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-marca)] disabled:opacity-50';

export function Pagos() {
  const [lista, setLista] = useState<Cuenta[]>([]);
  const [movimientos, setMovimientos] = useState<Transferencia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [traza, setTraza] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [qr, setQr] = useState<{ qrPng: string; payload: string } | null>(null);

  const recargar = useCallback(() => {
    Promise.all([cuentas(), transferencias()])
      .then(([c, t]) => {
        setLista(c);
        setMovimientos(t);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
      });
  }, []);

  useEffect(() => {
    recargar();
    // Cada evento de pagos-sim (completada, rechazada, revertida, falla) refresca la vista.
    return escucharPagos(recargar);
  }, [recargar]);

  const accion = (fn: () => Promise<string>) => {
    setOcupado(true);
    setAviso(null);
    setTraza(null);
    fn()
      .then(setAviso)
      .catch((e: unknown) => {
        setAviso(`Error · ${e instanceof Error ? e.message : String(e)}`);
      })
      .finally(() => {
        setOcupado(false);
        recargar();
      });
  };

  const alTransferir = (d: FormData) => {
    accion(async () => {
      const t = await transferir(
        d.get('origen') as string,
        d.get('destino') as string,
        d.get('monto') as string,
      );
      setTraza(t.traza);
      return `Transferencia ${t.estado}${t.motivo ? ` (${t.motivo})` : ''} · S/ ${t.monto}`;
    });
  };

  const alCobrar = (d: FormData) => {
    accion(async () => {
      const c = await cobrar(d.get('destino') as string, d.get('monto') as string);
      setQr(c);
      return `Cobro ${c.id} generado`;
    });
  };

  const opciones = lista.map((c) => (
    <option key={c.celular} value={c.celular}>
      {c.celular} ({c.billetera.slice(-1)})
    </option>
  ));

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          No se pudo leer pagos-sim: {error}. ¿Está corriendo en :7200?
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <form
          key={`t${String(lista.length)}`}
          action={alTransferir}
          className={`${tarjeta} space-y-3 p-4`}
          aria-label="Transferir"
        >
          <h2 className="text-sm font-semibold">Transferir</h2>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-stone-500 dark:text-stone-400">
              Origen
              <select name="origen" className={campo} defaultValue="900000001">
                {opciones}
              </select>
            </label>
            <label className="text-xs text-stone-500 dark:text-stone-400">
              Destino
              <select name="destino" className={campo} defaultValue="900000002">
                {opciones}
              </select>
            </label>
          </div>
          <label className="block text-xs text-stone-500 dark:text-stone-400">
            Monto (S/)
            <input
              name="monto"
              required
              defaultValue="10.00"
              inputMode="decimal"
              pattern="\d{1,7}(\.\d{1,2})?"
              className={campo}
            />
          </label>
          <button type="submit" className={boton} disabled={ocupado}>
            Transferir
          </button>
        </form>

        <form
          key={`c${String(lista.length)}`}
          action={alCobrar}
          className={`${tarjeta} space-y-3 p-4`}
          aria-label="Cobrar con QR"
        >
          <h2 className="text-sm font-semibold">Cobrar con QR</h2>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-stone-500 dark:text-stone-400">
              Cobra
              <select name="destino" className={campo} defaultValue="900000003">
                {opciones}
              </select>
            </label>
            <label className="text-xs text-stone-500 dark:text-stone-400">
              Monto (vacío = QR estático)
              <input
                name="monto"
                defaultValue="12.90"
                inputMode="decimal"
                pattern="(\d{1,7}(\.\d{1,2})?)?"
                className={campo}
              />
            </label>
          </div>
          <button type="submit" className={boton} disabled={ocupado}>
            Generar QR
          </button>
          {qr && (
            <div className="flex items-start gap-3">
              <img
                src={qr.qrPng}
                alt="Código QR del cobro (ficticio)"
                className="size-28 rounded bg-white p-1"
              />
              <code className="min-w-0 text-[11px] break-all text-stone-500 dark:text-stone-400">
                {qr.payload}
              </code>
            </div>
          )}
        </form>
      </div>

      {aviso && (
        <p
          role="status"
          className="rounded-lg border border-stone-200 px-4 py-2 text-sm dark:border-stone-800"
        >
          {aviso}
          {traza && (
            <a
              href={enlaceTraza(traza)}
              target="_blank"
              rel="noreferrer"
              className="ml-2 font-medium text-[var(--color-marca)] hover:underline"
            >
              Ver traza en Jaeger ↗
            </a>
          )}
        </p>
      )}

      <section className={`${tarjeta} overflow-hidden`} aria-labelledby="titulo-cuentas">
        <h2
          id="titulo-cuentas"
          className="border-b border-stone-200 px-4 py-3 text-sm font-semibold dark:border-stone-800"
        >
          Cuentas de prueba
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-stone-500 dark:text-stone-400">
              <tr>
                <th className="px-4 py-2 font-medium">Celular</th>
                <th className="px-4 py-2 font-medium">Titular</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">Billetera</th>
                <th className="px-4 py-2 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {lista.map((c) => (
                <tr key={c.celular}>
                  <td className="px-4 py-2 font-mono">{c.celular}</td>
                  <td className="px-4 py-2">
                    {c.titular}
                    <span className="block text-xs text-stone-500 sm:hidden dark:text-stone-400">
                      {c.billetera}
                    </span>
                  </td>
                  <td className="hidden px-4 py-2 whitespace-nowrap sm:table-cell">
                    {c.billetera}
                  </td>
                  <td
                    className="px-4 py-2 text-right font-mono whitespace-nowrap tabular-nums"
                    data-saldo={c.celular}
                  >
                    S/ {c.saldo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${tarjeta} overflow-hidden`} aria-labelledby="titulo-movimientos">
        <h2
          id="titulo-movimientos"
          className="border-b border-stone-200 px-4 py-3 text-sm font-semibold dark:border-stone-800"
        >
          Transferencias
        </h2>
        {movimientos.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-stone-500 dark:text-stone-400">
            Todavía no hay transferencias.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {movimientos.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm"
              >
                <span className="font-mono text-xs text-stone-500 dark:text-stone-400">
                  {new Date(t.creadoEn).toLocaleTimeString('es-PE', { hour12: false })}
                </span>
                <span className="font-mono">
                  {t.origen} → {t.destino}
                </span>
                <span className="font-mono tabular-nums">S/ {t.monto}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CLASE_ESTADO[t.estado]}`}
                >
                  {t.estado}
                  {t.motivo ? ` · ${t.motivo}` : ''}
                </span>
                {t.estado === 'completada' && (
                  <button
                    type="button"
                    className="ml-auto text-xs font-medium text-[var(--color-marca)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-marca)]"
                    disabled={ocupado}
                    onClick={() => {
                      accion(async () => `Transferencia ${(await revertir(t.id)).estado}`);
                    }}
                  >
                    Revertir
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
