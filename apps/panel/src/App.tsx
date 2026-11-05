import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  activarPerfil,
  detalle,
  emitirDemo,
  enlaceTraza,
  escuchar,
  estadoCaos,
  formatearXml,
  historial,
  perfiles,
  type Detalle,
  type Estado,
  type EstadoCaos,
  type Perfil,
  type Transaccion,
} from './api';
import { Identidad } from './Identidad';
import { Pagos } from './Pagos';

/** Sitio público de Chasqui (la landing); el logo del panel vuelve a él. */
const SITIO: string =
  (import.meta.env.VITE_SITIO_URL as string | undefined) ?? 'https://chasqui-lab.netlify.app/';

const AVISO = 'Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera.';

// Estados con borde y tinta (sin fondos con transparencia): la marca reserva el color para el estado.
const ESTILO_ESTADO: Record<Estado, { etiqueta: string; clase: string }> = {
  aceptado: { etiqueta: 'Aceptado', clase: 'text-[#5fc28b]' },
  observado: { etiqueta: 'Observado', clase: 'text-[#e8b54a]' },
  rechazado: { etiqueta: 'Rechazado', clase: 'text-[#e94964]' },
  anulado: { etiqueta: 'Anulado', clase: 'text-[#a29d90]' },
  excepcion: { etiqueta: 'Excepción', clase: 'text-[#ece8df]' },
  falla: { etiqueta: 'Falla inyectada', clase: 'text-[#e94964]' },
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
    id: 'credito',
    etiqueta: 'Crédito con detracción',
    ayuda: 'Dos cuotas y detracción del 10 %: código 0 con la observación 3249 oficial.',
  },
  {
    id: 'consumo',
    etiqueta: 'ISC, bolsas y gratuita',
    ayuda: 'ISC al valor, ICBPER, muestra gratuita y descuento global: código 0.',
  },
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
  return <span className={`insignia ${e.clase}`}>{e.etiqueta}</span>;
}

const VISTAS = [
  { id: 'comprobantes', etiqueta: 'Comprobantes' },
  { id: 'pagos', etiqueta: 'Pagos' },
  { id: 'identidad', etiqueta: 'Identidad' },
] as const;
type Vista = (typeof VISTAS)[number]['id'];

/** Vista activa en el hash (#pagos): sobrevive a recargas y se puede enlazar. */
function useVista(): Vista {
  const leer = (): Vista => VISTAS.find((v) => `#${v.id}` === location.hash)?.id ?? 'comprobantes';
  const [vista, setVista] = useState(leer);
  useEffect(() => {
    const alCambiar = () => {
      setVista(leer());
    };
    addEventListener('hashchange', alCambiar);
    return () => {
      removeEventListener('hashchange', alCambiar);
    };
  }, []);
  return vista;
}

const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour12: false });

export function App() {
  const [filas, setFilas] = useState<Transaccion[]>([]);
  const [conectado, setConectado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Transaccion | null>(null);
  const [filtro, setFiltro] = useState<Estado | 'todos'>('todos');
  const [listaPerfiles, setListaPerfiles] = useState<Perfil[]>([]);
  const [caos, setCaos] = useState<EstadoCaos | null>(null);
  const vista = useVista();

  useEffect(() => {
    void perfiles()
      .then(setListaPerfiles)
      .catch(() => undefined);
    const leer = () => void estadoCaos().then(setCaos);
    leer();
    // Otro cliente (SDK, MCP, curl) puede cambiar el caos: se relee cada 3 s.
    const intervalo = setInterval(leer, 3000);
    return () => {
      clearInterval(intervalo);
    };
  }, []);

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
      falla: 0,
    };
    for (const f of filas) c[f.estado]++;
    return c;
  }, [filas]);

  const visibles = filtro === 'todos' ? filas : filas.filter((f) => f.estado === filtro);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-[#3a3830] bg-[#0d0d0b]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <a
            href={SITIO}
            className="flex min-w-0 items-center gap-3 no-underline"
            title="Volver al sitio de Chasqui"
          >
            <img src="/nudo.webp" alt="" width="105" height="54" className="h-7 w-auto" />
            <span className="min-w-0">
              <span className="block text-xl font-extrabold tracking-tight [font-variation-settings:'wdth'_125]">
                Chasqui
              </span>
              <span className="block truncate text-xs text-stone-500">
                Panel en vivo · ← volver al sitio
              </span>
            </span>
          </a>
          <span
            className={`insignia ml-auto shrink-0 ${conectado ? 'text-[#5fc28b]' : 'text-[#a29d90]'}`}
            role="status"
          >
            <span
              className={`size-1.5 ${conectado ? 'animate-pulse bg-[#5fc28b]' : 'bg-[#a29d90]'}`}
            />
            {conectado ? 'En vivo' : 'Reconectando…'}
          </span>
        </div>
        <p className="border-t border-[#3a3830] bg-[#191915] px-4 py-1.5 text-center text-xs text-[#a29d90]">
          {AVISO}
        </p>
        <nav
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6"
          aria-label="Servicios"
        >
          {VISTAS.map((v) => (
            <a
              key={v.id}
              href={`#${v.id}`}
              aria-current={vista === v.id ? 'page' : undefined}
              className={`border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-marca)] ${vista === v.id ? 'border-[var(--color-marca)] text-stone-900 dark:text-stone-100' : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'}`}
            >
              {v.etiqueta}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <section className="min-w-0 space-y-6">
          {vista === 'pagos' ? (
            <Pagos />
          ) : vista === 'identidad' ? (
            <Identidad />
          ) : (
            <>
              <div className="grid grid-cols-2 border-t-2 border-[#ece8df] sm:grid-cols-4">
                {(['aceptado', 'observado', 'rechazado', 'excepcion'] as const).map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      setFiltro(filtro === e ? 'todos' : e);
                    }}
                    aria-pressed={filtro === e}
                    className={`border-r border-[#3a3830] px-4 pt-4 pb-3 text-left transition-colors last:border-r-0 hover:bg-[#191915] ${filtro === e ? 'bg-[#191915] shadow-[inset_0_3px_0_#e94964]' : ''}`}
                  >
                    <p className="text-xs text-stone-500 dark:text-stone-400">{METRICA[e]}</p>
                    <p className="mt-1 font-mono text-4xl font-semibold tracking-tighter tabular-nums">
                      {conteo[e]}
                    </p>
                  </button>
                ))}
              </div>

              <div className="border-t border-[#3a3830]">
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
                          className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 focus-visible:bg-stone-50 focus-visible:outline-none sm:grid-cols-[4.5rem_1fr_9.5rem_4rem] dark:hover:bg-stone-800/60 dark:focus-visible:bg-stone-800/60"
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
                            {f.observaciones[0] ?? f.codigo}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Caos</h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {caos
                  ? (caos.perfil ?? (caos.reglas.length ? 'reglas propias' : 'apagado'))
                  : 'chaos-control no responde'}
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Activa un perfil y mira el efecto en las transacciones.{' '}
              {conteo.falla > 0 && (
                <span className="font-medium text-orange-700 dark:text-orange-300">
                  {conteo.falla} {conteo.falla === 1 ? 'falla inyectada' : 'fallas inyectadas'}.
                </span>
              )}
            </p>
            <ul className="mt-3 space-y-2">
              {listaPerfiles.map((p) => {
                const activo = caos?.perfil === p.nombre;
                return (
                  <li key={p.nombre}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={activo}
                      disabled={!caos}
                      onClick={() => void activarPerfil(activo ? null : p.nombre).then(setCaos)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-[var(--color-marca)] disabled:opacity-50 ${activo ? 'border-orange-400 bg-[#191915] dark:border-orange-500/60 dark:bg-[#191915]' : 'border-stone-200 hover:border-stone-300 dark:border-stone-700'}`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center p-0.5 transition ${activo ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'}`}
                        aria-hidden
                      >
                        <span
                          className={`size-4 bg-[#ece8df] transition ${activo ? 'translate-x-4' : ''}`}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-sm font-medium">{p.nombre}</span>
                        <span className="block text-xs text-stone-500 dark:text-stone-400">
                          {p.descripcion}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {caos && (
              <p className="mt-2 font-mono text-xs text-stone-500 dark:text-stone-400">
                semilla: {caos.semilla}
              </p>
            )}
          </div>
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
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-left hover:border-[var(--color-marca)] hover:bg-[#191915] focus-visible:outline-2 focus-visible:outline-[var(--color-marca)] active:scale-[0.99] dark:border-stone-700 dark:hover:bg-[#191915]"
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

/** Datos del comprobante leídos del XML recibido (lo que SUNAT revisó). */
function FichaXml({ xml }: { xml: string }) {
  const datos = useMemo(() => {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const cbc = 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2';
    const cac = 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2';
    const uno = (ns: string, n: string) => doc.getElementsByTagNameNS(ns, n)[0]?.textContent ?? '';
    const total = doc.getElementsByTagNameNS(cbc, 'PayableAmount')[0];
    const lineas =
      doc.getElementsByTagNameNS(cac, 'InvoiceLine').length +
      doc.getElementsByTagNameNS(cac, 'CreditNoteLine').length +
      doc.getElementsByTagNameNS(cac, 'DebitNoteLine').length;
    const cliente = doc.getElementsByTagNameNS(cac, 'AccountingCustomerParty')[0];
    return [
      ['Emisión', `${uno(cbc, 'IssueDate')} ${uno(cbc, 'IssueTime')}`.trim()],
      ['Cliente', cliente?.getElementsByTagNameNS(cbc, 'RegistrationName')[0]?.textContent ?? '—'],
      ['Líneas', String(lineas)],
      ['IGV', uno(cbc, 'TaxAmount')],
      ['Total', total ? `${total.getAttribute('currencyID') ?? ''} ${total.textContent}` : '—'],
      [
        'Firma',
        doc.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'SignatureValue').length
          ? 'XML-DSig'
          : 'sin firma',
      ],
      ['Tamaño', `${(xml.length / 1024).toFixed(1)} KB`],
    ] as const;
  }, [xml]);
  return (
    <dl className="grid grid-cols-2 border-t-2 border-[#ece8df] sm:grid-cols-4">
      {datos.map(([k, v]) => (
        <div key={k} className="border-b border-[#3a3830] py-3 pr-3">
          <dt className="text-xs text-stone-500">{k}</dt>
          <dd className="mt-1 font-mono text-sm break-words">{v}</dd>
        </div>
      ))}
    </dl>
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
              {t.traza && (
                <a
                  href={enlaceTraza(t.traza)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--color-marca)] hover:underline"
                >
                  · Ver traza en Jaeger ↗
                </a>
              )}
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
            <div className="space-y-5 text-sm">
              <p className="text-base">{t.mensaje}</p>
              {d && <FichaXml xml={d.xml} />}
              {d && (
                <div>
                  <h3 className="text-xs text-stone-500">XML recibido · primeras líneas</h3>
                  <pre className="mt-2 max-h-80 overflow-hidden bg-[#191915] p-4 font-mono text-xs leading-relaxed text-stone-100 [mask-image:linear-gradient(#000_70%,transparent)]">
                    <code>{formatearXml(d.xml).split('\n').slice(0, 28).join('\n')}</code>
                  </pre>
                </div>
              )}
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
                        className="border-l-2 border-[#e8b54a] bg-[#191915] py-2 pr-3 pl-4"
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
