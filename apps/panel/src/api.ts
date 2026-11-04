/** Cliente mínimo de sunat-sim para el panel (REST + SSE). */

export const BASE_SUNAT: string =
  (import.meta.env.VITE_SUNAT_URL as string | undefined) ?? '/sunat';

export type Estado = 'aceptado' | 'observado' | 'rechazado' | 'anulado' | 'excepcion';

export interface Transaccion {
  /** Clave única en el panel (las excepciones no se registran en sunat-sim). */
  clave: string;
  nombre: string;
  canal: string;
  estado: Estado;
  codigo: string;
  mensaje: string;
  observaciones: string[];
  en: string;
  /** true si llegó por el flujo en vivo (para animar la fila). */
  enVivo?: boolean;
}

export interface Detalle {
  id: string;
  estado: string;
  codigo: string;
  mensaje: string;
  observaciones: { codigo: string; mensaje: string; fuente: string }[];
  xml: string;
  cdrXml: string | null;
  canal: string;
  recibidoEn: string;
}

interface Resumen {
  id: string;
  estado: Estado;
  codigo: string;
  mensaje: string;
  observaciones: { codigo: string }[];
  canal: string;
  recibidoEn: string;
}

export async function historial(): Promise<Transaccion[]> {
  const r = await fetch(`${BASE_SUNAT}/api/v1/comprobantes?limite=200`);
  if (!r.ok) throw new Error(`sunat-sim respondió ${String(r.status)}`);
  const filas = (await r.json()) as Resumen[];
  return filas.map((f) => ({
    clave: f.id,
    nombre: f.id,
    canal: f.canal,
    estado: f.estado,
    codigo: f.codigo,
    mensaje: f.mensaje,
    observaciones: f.observaciones.map((o) => o.codigo),
    en: f.recibidoEn,
  }));
}

export async function detalle(id: string): Promise<Detalle | null> {
  const r = await fetch(`${BASE_SUNAT}/api/v1/comprobantes/${encodeURIComponent(id)}`);
  return r.ok ? ((await r.json()) as Detalle) : null;
}

export async function emitirDemo(escenario: string): Promise<void> {
  await fetch(`${BASE_SUNAT}/_chasqui/demo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ escenario }),
  });
}

interface EventoSse {
  tipo: string;
  nombre: string;
  canal?: string;
  estado?: Estado;
  codigo?: string;
  mensaje?: string;
  observaciones?: string[];
  en: string;
}

/** Se suscribe al flujo en vivo; EventSource reconecta solo si se corta. */
export function escuchar(
  alRecibir: (t: Transaccion) => void,
  alConectar: (conectado: boolean) => void,
): () => void {
  const fuente = new EventSource(`${BASE_SUNAT}/_chasqui/eventos`);
  fuente.onopen = () => {
    alConectar(true);
  };
  fuente.onerror = () => {
    alConectar(false);
  };
  fuente.onmessage = (m: MessageEvent<string>) => {
    const e = JSON.parse(m.data) as EventoSse;
    if (e.tipo !== 'comprobante' && e.tipo !== 'excepcion') return;
    alRecibir({
      clave: e.tipo === 'excepcion' ? `${e.nombre}@${e.en}` : e.nombre,
      nombre: e.nombre,
      canal: e.canal ?? '',
      estado: e.tipo === 'excepcion' ? 'excepcion' : (e.estado ?? 'aceptado'),
      codigo: e.codigo ?? '',
      mensaje: e.mensaje ?? '',
      observaciones: e.observaciones ?? [],
      en: e.en,
      enVivo: true,
    });
  };
  return () => {
    fuente.close();
  };
}

/** Indenta un XML compacto para leerlo en el panel. */
export function formatearXml(xml: string): string {
  let nivel = 0;
  return xml
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map((linea) => {
      if (/^<\//.test(linea)) nivel = Math.max(nivel - 1, 0);
      const salida = '  '.repeat(nivel) + linea;
      if (/^<[^!?/][^>]*[^/]>$/.test(linea) && !/<\/[^>]+>$/.test(linea)) nivel++;
      return salida;
    })
    .join('\n');
}
