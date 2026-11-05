import { useState } from 'react';
import { consultarDocumento, type Contribuyente, type Persona } from './api';

export function Identidad() {
  const [resultado, setResultado] = useState<Contribuyente | Persona | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const alConsultar = (d: FormData) => {
    const numero = (d.get('numero') as string).trim();
    setOcupado(true);
    setError(null);
    consultarDocumento(numero)
      .then(setResultado)
      .catch((x: unknown) => {
        setResultado(null);
        setError(x instanceof Error ? x.message : String(x));
      })
      .finally(() => {
        setOcupado(false);
      });
  };

  const filas: [string, string][] = resultado
    ? 'ruc' in resultado
      ? [
          ['RUC', resultado.ruc],
          ['Razón social', resultado.razonSocial],
          ['Estado', resultado.estado],
          ['Condición', resultado.condicion],
          ['Ubigeo', resultado.ubigeo],
          ['Dirección', resultado.direccion],
        ]
      : [
          ['DNI', resultado.dni],
          ['Nombres', resultado.nombres],
          ['Apellidos', `${resultado.apellidoPaterno} ${resultado.apellidoMaterno}`],
        ]
    : [];

  return (
    <div className="space-y-4">
      <form
        action={alConsultar}
        className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
        aria-label="Consultar documento"
      >
        <h2 className="text-sm font-semibold">Consultar DNI o RUC</h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Dataset ficticio y determinista: el mismo número devuelve siempre los mismos datos. El RUC
          se valida con su dígito verificador.
        </p>
        <div className="mt-3 flex gap-2">
          <label className="sr-only" htmlFor="numero">
            Número de DNI (8 dígitos) o RUC (11 dígitos)
          </label>
          <input
            id="numero"
            name="numero"
            required
            inputMode="numeric"
            pattern="\d{8}|\d{11}"
            placeholder="20000000001"
            defaultValue="20000000001"
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-transparent px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-[var(--color-marca)] dark:border-stone-700"
          />
          <button
            type="submit"
            disabled={ocupado}
            className="rounded-lg bg-[var(--color-marca)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-marca)] disabled:opacity-50"
          >
            Consultar
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-[#191915] dark:text-rose-300"
        >
          {error}
        </p>
      )}

      {resultado && (
        <dl className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
          {filas.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 px-4 py-2.5 text-sm">
              <dt className="text-stone-500 dark:text-stone-400">{k}</dt>
              <dd className="min-w-0 break-words">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
