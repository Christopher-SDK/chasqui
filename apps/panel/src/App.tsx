import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  detalle,
  emitirDemo,
  escuchar,
  formatearXml,
  historial,
  type Detalle,
  type Estado,
  type Transaccion,
} from './api';

const AVISO = 'Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera.';

const ESTILO_ESTADO: Record<Estado, { etiqueta: string; clase: string }> = {
  aceptado: {
    etiqueta: 'Aceptado',
    clase:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30',
  },
  observado: {
    etiqueta: 'Con observaciones',
    clase:
      'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30',
  },
  rechazado: {
    etiqueta: 'Rechazado',
    clase:
      'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30',
  },
  anulado: {
    etiqueta: 'Anulado',
    clase:
      'bg-stone-100 text-stone-600 ring-stone-500/20 dark:bg-stone-500/10 dark:text-stone-300 dark:ring-stone-400/30',
  },
  excepcion: {
    etiqueta: 'Excepción',
    clase:
      'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/30',
  },
};

const METRICA = {
  aceptado: 'Aceptados',
  observado: 'Con observaciones',
  rechazado: 'Rechazados',
  excepcion: 'Excepciones',
} as const;

const ESCENARIOS = [
  { id: 'valida', etiqueta: 'Factura válida', ayuda: 'Pasa todas las reglas: CDR con código 0.' },
  {
    id: 'observada',
    etiqueta: 'Con observación',
    ayuda: 'Importe total desfasado: aceptada con 4312.',
  },
  { id: 'rechazada', etiqueta: 'Rechazada', ayuda: 'UBL 2.0 en vez de 2.1: CDR de rechazo 2074.' },
  { id: 'duplicada', etiqueta: 'Duplicada', ayuda: 'Reenvía la última válida: excepción 1033.' },
  {
    id: 'excepcion',
    etiqueta: 'ZIP inconsistente',
    ayuda: 'El XML no coincide con el ZIP: excepción 0161.',
  },
] as const;

function Insignia({ estado }: { estado: Estado }) {
  const e = ESTILO_ESTADO[estado];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${e.clase}`}
    >
      {e.etiqueta}
    </span>
  );
}

function useTema() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro);
    try {
      localStorage.setItem('chasqui-tema', oscuro ? 'oscuro' : 'claro');
    } catch {
      /* almacenamiento no disponible: el tema no se recuerda */
    }
  }, [oscuro]);
  return [oscuro, setOscuro] as const;
}

const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour12: false });

export function App() {
  const [filas, setFilas] = useState<Transaccion[]>([]);
  const [conectado, setConectado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Transaccion | null>(null);
  const [filtro, setFiltro] = useState<Estado | 'todos'>('todos');
  const [oscuro, setOscuro] = useTema();

  useEffect(() => {
    historial()
      .then((h) => {
        setFilas((actual) => [
          ...actual,
          ...h.filter((x) => !actual.some((a) => a.clave === x.clave)),
        ]);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
      });
    return escuchar(
      (t) => {
        setFilas((actual) => [t, ...actual.filter((a) => a.clave !== t.clave)].slice(0, 500));
      },
      (c) => {
        setConectado(c);
        if (c) setError(null);
      },
    );
  }, []);

  const conteo = useMemo(() => {
    const c: Record<Estado, number> = {
      aceptado: 0,
      observado: 0,
      rechazado: 0,
      anulado: 0,
      excepcion: 0,
    };
    for (const f of filas) c[f.estado]++;
    return c;
  }, [filas]);

  const visibles = filtro === 'todos' ? filas : filas.filter((f) => f.estado === filtro);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-50/85 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <span
            className="grid size-8 place-items-center rounded-lg bg-[var(--color-marca)] text-white"
            aria-hidden
          >
            <svg viewBox="0 0 32 32" className="size-5">
              <path
                d="M9 21l7-10 7 10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight">Chasqui</h1>
            <p className="truncate text-xs text-stone-500 dark:text-stone-400">
              Laboratorio de integraciones · sunat-sim
            </p>
          </div>
          <span
            className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full whitespace-nowrap px-2.5 py-1 text-xs font-medium ${conectado ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300'}`}
            role="status"
          >
            <span
              className={`size-1.5 rounded-full ${conectado ? 'animate-pulse bg-emerald-500' : 'bg-stone-400'}`}
            />
            {conectado ? 'En vivo' : 'Reconectando…'}
          </span>
          <button
            type="button"
            onClick={() => {
              setOscuro(!oscuro);
            }}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-200/70 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-[var(--color-marca)] dark:hover:bg-stone-800 dark:hover:text-stone-100"
            aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {oscuro ? '☀︎' : '☾'}
          </button>
        </div>
        <p className="border-t border-amber-200/70 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          {AVISO}
        </p>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <section className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['aceptado', 'observado', 'rechazado', 'excepcion'] as const).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setFiltro(filtro === e ? 'todos' : e);
                }}
                aria-pressed={filtro === e}
                className={`rounded-xl border bg-white p-4 text-left transition hover:border-stone-300 focus-visible:outline-2 focus-visible:outline-[var(--color-marca)] dark:bg-stone-900 dark:hover:border-stone-700 ${filtro === e ? 'border-[var(--color-marca)] ring-1 ring-[var(--color-marca)]' : 'border-stone-200 dark:border-stone-800'}`}
              >
                <p className="text-xs text-stone-500 dark:text-stone-400">{METRICA[e]}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{conteo[e]}</p>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
              <h2 className="text-sm font-semibold">Transacciones</h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {filtro === 'todos'
                  ? `${String(filas.length)} en total`
                  : `Filtro: ${ESTILO_ESTADO[filtro].etiqueta}`}
              </span>
            </div>
            {error && (
              <p className="px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                No se pudo leer el historial: {error}. ¿Está corriendo sunat-sim en :7100?
              </p>
            )}
            {visibles.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-sm font-medium">Todavía no llega ningún comprobante</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  Envía uno desde tu sistema o usa «Probar» para ver el flujo completo.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {visibles.map((f) => (
                  <li key={f.clave} className={f.enVivo ? 'fila-nueva' : undefined}>
                    <button
                      type="button"
                      onClick={() => {
                        setSeleccion(f);
                      }}
                      className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 focus-visible:bg-stone-50 focus-visible:outline-none sm:grid-cols-[4.5rem_1fr_9rem_3.5rem] dark:hover:bg-stone-800/60 dark:focus-visible:bg-stone-800/60"
                    >
                      <time className="hidden font-mono text-xs text-stone-500 tabular-nums sm:block dark:text-stone-400">
                        {hora(f.en)}
                      </time>
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-sm">{f.nombre}</span>
                        <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                          <span className="font-mono sm:hidden">{hora(f.en)} · </span>
                          {f.mensaje}
                        </span>
                      </span>
                      <span className="justify-self-end sm:justify-self-start">
                        <Insignia estado={f.estado} />
                      </span>
                      <span className="hidden font-mono text-xs text-stone-500 sm:block dark:text-stone-400">
                        {f.codigo}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-sm font-semibold">Probar</h2>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Emite comprobantes ficticios contra sunat-sim y míralos llegar.
            </p>
            <div className="mt-3 space-y-2">
              {ESCENARIOS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => void emitirDemo(e.id)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-left hover:border-[var(--color-marca)] hover:bg-teal-50/60 focus-visible:outline-2 focus-visible:outline-[var(--color-marca)] active:scale-[0.99] dark:border-stone-700 dark:hover:bg-teal-500/10"
                >
                  <span className="block text-sm font-medium">{e.etiqueta}</span>
                  <span className="block text-xs text-stone-500 dark:text-stone-400">
                    {e.ayuda}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <p className="font-medium text-stone-900 dark:text-stone-100">Endpoints</p>
            <ul className="mt-2 space-y-1 font-mono">
              <li>SOAP · /billService?wsdl</li>
              <li>REST · /api/v1/comprobantes</li>
              <li>OpenAPI · /docs</li>
            </ul>
          </div>
        </aside>
      </main>

      {seleccion && (
        <PanelDetalle
          t={seleccion}
          alCerrar={() => {
            setSeleccion(null);
          }}
        />
      )}
    </div>
  );
}

function PanelDetalle({ t, alCerrar }: { t: Transaccion; alCerrar: () => void }) {
  const [d, setD] = useState<Detalle | null>(null);
  const [pestana, setPestana] = useState<'resumen' | 'xml' | 'cdr'>('resumen');

  useEffect(() => {
    if (t.estado !== 'excepcion') void detalle(t.nombre).then(setD);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar();
    };
    window.addEventListener('keydown', tecla);
    // El fondo no se desplaza mientras el detalle está abierto.
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', tecla);
      document.body.style.overflow = '';
    };
  }, [t, alCerrar]);

  const copiar = useCallback((texto: string) => void navigator.clipboard.writeText(texto), []);
  const contenido = pestana === 'xml' ? d?.xml : pestana === 'cdr' ? d?.cdrXml : null;

  return (
    <div
      className="fixed inset-0 z-30 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-detalle"
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px]"
        aria-label="Cerrar detalle"
        onClick={alCerrar}
      />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl dark:bg-stone-900">
        <div className="flex items-start gap-3 border-b border-stone-200 p-4 dark:border-stone-800">
          <div className="min-w-0 flex-1">
            <h2 id="titulo-detalle" className="truncate font-mono text-sm font-semibold">
              {t.nombre}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <Insignia estado={t.estado} />
              <span>código {t.codigo || '—'}</span>
              <span>· {t.canal.toUpperCase()}</span>
              <span>· {hora(t.en)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {t.estado !== 'excepcion' && (
          <div
            className="flex gap-1 border-b border-stone-200 px-4 dark:border-stone-800"
            role="tablist"
          >
            {(
              [
                ['resumen', 'Resumen'],
                ['xml', 'XML recibido'],
                ['cdr', 'CDR devuelto'],
              ] as const
            ).map(([id, etiqueta]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={pestana === id}
                onClick={() => {
                  setPestana(id);
                }}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm ${pestana === id ? 'border-[var(--color-marca)] font-medium text-stone-900 dark:text-stone-100' : 'border-transparent text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'}`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {pestana === 'resumen' || t.estado === 'excepcion' ? (
            <div className="space-y-4 text-sm">
              <p>{t.mensaje}</p>
              {t.estado === 'excepcion' && (
                <p className="text-stone-500 dark:text-stone-400">
                  Excepción (códigos 0100-1999): no se emite CDR ni se registra el comprobante.
                </p>
              )}
              {d && d.observaciones.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
                    Observaciones
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {d.observaciones.map((o) => (
                      <li
                        key={o.codigo + o.fuente}
                        className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/60 dark:bg-amber-950/30"
                      >
                        <p className="font-mono text-xs font-semibold">{o.codigo}</p>
                        <p className="mt-0.5">{o.mensaje}</p>
                        <p className="mt-1 font-mono text-xs text-stone-500 dark:text-stone-400">
                          regla: {o.fuente}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : contenido ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  copiar(contenido);
                }}
                className="absolute top-2 right-2 rounded-md border border-stone-200 bg-white/90 px-2 py-1 text-xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800/90"
              >
                Copiar
              </button>
              <pre className="overflow-x-auto rounded-lg bg-stone-950 p-4 font-mono text-xs leading-relaxed text-stone-100">
                <code>{formatearXml(contenido)}</code>
              </pre>
            </div>
          ) : (
            <p className="text-sm text-stone-500">Cargando…</p>
          )}
        </div>
      </div>
    </div>
  );
}
