/** Cliente mínimo de sunat-sim para el panel (REST + SSE). */

export const BASE_CAOS: string = (import.meta.env.VITE_CAOS_URL as string | undefined) ?? '/caos';

export const BASE_SUNAT: string =
  (import.meta.env.VITE_SUNAT_URL as string | undefined) ?? '/sunat';

export type Estado = 'aceptado' | 'observado' | 'rechazado' | 'anulado' | 'excepcion' | 'falla';

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

/** El panel observa el caos, no lo sufre: sus lecturas piden «sin caos». */
const SIN_CAOS = { headers: { 'x-chasqui-chaos': 'ninguno' } };

export async function historial(): Promise<Transaccion[]> {
  const r = await fetch(`${BASE_SUNAT}/api/v1/comprobantes?limite=200`, SIN_CAOS);
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
  const r = await fetch(`${BASE_SUNAT}/api/v1/comprobantes/${encodeURIComponent(id)}`, SIN_CAOS);
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
    if (e.tipo === 'falla') {
      const f = e as unknown as {
        falla: string;
        detalle: string;
        metodo: string;
        ruta: string;
        servicio: string;
        en: string;
      };
      alRecibir({
        clave: `falla@${f.en}@${f.ruta}@${f.falla}`,
        nombre: `${f.metodo} ${f.ruta}`,
        canal: f.servicio,
        estado: 'falla',
        codigo: f.falla,
        mensaje: `Falla inyectada: ${f.falla} (${f.detalle})`,
        observaciones: [],
        en: f.en,
        enVivo: true,
      });
      return;
    }
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

export interface Perfil {
  nombre: string;
  descripcion: string;
}

export interface EstadoCaos {
  perfil: string | null;
  reglas: unknown[];
  semilla: string;
}

export async function perfiles(): Promise<Perfil[]> {
  const r = await fetch(`${BASE_CAOS}/api/v1/perfiles`);
  return r.ok ? ((await r.json()) as Perfil[]) : [];
}

export async function estadoCaos(): Promise<EstadoCaos | null> {
  const r = await fetch(`${BASE_CAOS}/api/v1/caos`).catch(() => null);
  return r?.ok ? ((await r.json()) as EstadoCaos) : null;
}

export async function activarPerfil(nombre: string | null): Promise<EstadoCaos | null> {
  const r = await fetch(
    `${BASE_CAOS}/api/v1/caos`,
    nombre
      ? {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ perfil: nombre }),
        }
      : { method: 'DELETE' },
  );
  return r.ok ? ((await r.json()) as EstadoCaos) : null;
}

// ── pagos-sim e identidad-sim ──────────────────────────────────────────────────────────────

export const BASE_PAGOS: string =
  (import.meta.env.VITE_PAGOS_URL as string | undefined) ?? '/pagos';
export const BASE_IDENTIDAD: string =
  (import.meta.env.VITE_IDENTIDAD_URL as string | undefined) ?? '/identidad';

export interface Cuenta {
  celular: string;
  titular: string;
  billetera: string;
  saldo: string;
}

export interface Transferencia {
  id: string;
  origen: string;
  destino: string;
  monto: string;
  estado: 'pendiente' | 'completada' | 'rechazada' | 'revertida';
  motivo: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

/** Respuesta de error de los simuladores, o el estado HTTP si no vino JSON (falla «malformada»). */
async function cuerpo<T>(r: Response): Promise<T> {
  const texto = await r.text();
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    throw new Error(`Respuesta inválida (HTTP ${String(r.status)})`);
  }
  if (!r.ok) {
    const e = json as { codigo?: string; mensaje?: string; message?: string };
    throw new Error(`${e.codigo ?? String(r.status)}: ${e.mensaje ?? e.message ?? ''}`);
  }
  return json as T;
}

export const cuentas = () =>
  fetch(`${BASE_PAGOS}/api/v1/cuentas`, SIN_CAOS).then((r) => cuerpo<Cuenta[]>(r));

export const transferencias = () =>
  fetch(`${BASE_PAGOS}/api/v1/transferencias?limite=50`, SIN_CAOS).then((r) =>
    cuerpo<Transferencia[]>(r),
  );

/** Las acciones del panel SÍ pasan por el caos: así se ve su efecto. */
export const transferir = (origen: string, destino: string, monto: string) =>
  fetch(`${BASE_PAGOS}/api/v1/transferencias`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'idempotency-key': crypto.randomUUID() },
    body: JSON.stringify({ origen, destino, monto, descripcion: 'Desde el panel' }),
  }).then((r) => cuerpo<Transferencia>(r));

export const revertir = (id: string) =>
  fetch(`${BASE_PAGOS}/api/v1/transferencias/${id}/reversion`, { method: 'POST' }).then((r) =>
    cuerpo<Transferencia>(r),
  );

export const cobrar = (destino: string, monto: string) =>
  fetch(`${BASE_PAGOS}/api/v1/cobros`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      destino,
      ...(monto ? { monto } : {}),
      descripcion: 'Cobro desde el panel',
    }),
  }).then((r) => cuerpo<{ id: string; payload: string; qrPng: string }>(r));

/** Avisa cada evento de pagos-sim (transferencias y fallas inyectadas). */
export function escucharPagos(alRecibir: (e: { tipo: string; evento?: string }) => void) {
  const fuente = new EventSource(`${BASE_PAGOS}/_chasqui/eventos`);
  fuente.onmessage = (m: MessageEvent<string>) => {
    alRecibir(JSON.parse(m.data) as { tipo: string; evento?: string });
  };
  return () => {
    fuente.close();
  };
}

export interface Contribuyente {
  ruc: string;
  razonSocial: string;
  estado: string;
  condicion: string;
  ubigeo: string;
  direccion: string;
}

export interface Persona {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export const consultarDocumento = (numero: string) =>
  fetch(`${BASE_IDENTIDAD}/api/v1/${numero.length === 8 ? 'dni' : 'ruc'}/${numero}`).then((r) =>
    cuerpo<Contribuyente | Persona>(r),
  );
