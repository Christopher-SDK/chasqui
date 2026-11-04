import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { EstadoCaos, Regla } from '@chasqui/chaos-engine';
import { emitir, type Comprobante, type OpcionesFirma } from '@chasqui/ubl-core';

export * from './comprobantes.js';

/** Error de la API: lleva el estado HTTP y el código del simulador (p. ej. '0151', 'LIMITE_DIARIO'). */
export class ErrorChasqui extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensaje: string,
  ) {
    super(`${String(status)} ${codigo}: ${mensaje}`);
    this.name = 'ErrorChasqui';
  }
}

export interface OpcionesCliente {
  sunat?: string;
  pagos?: string;
  identidad?: string;
  caos?: string;
  /** Reintentos ante 5xx, 429 o error de red (por defecto 3). Solo en peticiones idempotentes. */
  reintentos?: number;
  /** Espera base en ms del backoff exponencial (por defecto 200). */
  esperaBase?: number;
  /** Tiempo máximo por intento en ms (por defecto 10 000). */
  timeout?: number;
  /** Cabeceras extra en cada petición (p. ej. `{ 'x-chasqui-chaos': 'ninguno' }`). */
  cabeceras?: Record<string, string>;
  fetch?: typeof fetch;
}

const dormir = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
const reintentable = (status: number) => status === 429 || status >= 500;

export interface ResultadoSunat {
  id: string;
  estado: 'aceptado' | 'observado' | 'rechazado';
  codigo: string;
  mensaje: string;
  observaciones: { codigo: string; mensaje: string }[];
  cdr: string;
}

export interface Transferencia {
  id: string;
  origen: string;
  destino: string;
  monto: string;
  moneda: 'PEN';
  descripcion: string;
  estado: 'pendiente' | 'completada' | 'rechazada' | 'revertida';
  motivo: string | null;
  cobroId: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Contribuyente {
  ruc: string;
  razonSocial: string;
  estado: 'ACTIVO' | 'BAJA DE OFICIO' | 'BAJA DEFINITIVA' | 'SUSPENSION TEMPORAL';
  condicion: 'HABIDO' | 'NO HABIDO';
  ubigeo: string;
  direccion: string;
}

/**
 * Cliente de Chasqui. Los reintentos solo se aplican a peticiones seguras de repetir: lecturas y
 * escrituras con Idempotency-Key (que el SDK genera una vez y reutiliza en cada reintento).
 */
export class Chasqui {
  readonly sunat;
  readonly pagos;
  readonly identidad;
  readonly chaos;
  private readonly o: Required<Omit<OpcionesCliente, 'sunat' | 'pagos' | 'identidad' | 'caos'>> & {
    base: Record<string, string>;
  };

  constructor(opciones: OpcionesCliente = {}) {
    this.o = {
      reintentos: opciones.reintentos ?? 3,
      esperaBase: opciones.esperaBase ?? 200,
      timeout: opciones.timeout ?? 10_000,
      cabeceras: opciones.cabeceras ?? {},
      fetch: opciones.fetch ?? fetch,
      base: {
        sunat: opciones.sunat ?? 'http://localhost:7100',
        pagos: opciones.pagos ?? 'http://localhost:7200',
        identidad: opciones.identidad ?? 'http://localhost:7300',
        caos: opciones.caos ?? 'http://localhost:7400',
      },
    };
    const p = this.pedir.bind(this);

    this.sunat = {
      /** Calcula, firma, empaqueta y envía. Un rechazo (2000-3999) NO lanza: viene en `estado`. */
      enviar: async (c: Comprobante, firma: OpcionesFirma = {}): Promise<ResultadoSunat> => {
        const e = emitir(c, firma);
        // Reenviar el mismo ZIP es seguro: nunca duplica. Si un reintento recibe 1033 (ya registrado),
        // el primer envío sí llegó: consulte `sunat.estado`.
        return p<ResultadoSunat>('sunat', 'POST', '/api/v1/comprobantes', {
          cuerpo: { nombreArchivo: e.nombreZip, contenido: Buffer.from(e.zip).toString('base64') },
          idempotente: true,
        });
      },
      estado: (ruc: string, tipo: string, serie: string, numero: number) =>
        p<{ estado: string; codigo: string | null; mensaje: string | null }>(
          'sunat',
          'GET',
          `/api/v1/estado/${ruc}/${tipo}/${serie}/${String(numero)}`,
        ),
    };

    this.pagos = {
      /** Transferencia por celular. Monto en soles («12.50» o 12.5). Reintenta con la misma clave. */
      transferir: (
        t: { origen: string; destino: string; monto: string | number; descripcion?: string },
        clave: string = randomUUID(),
      ) =>
        p<Transferencia>('pagos', 'POST', '/api/v1/transferencias', {
          cuerpo: t,
          idempotente: true,
          cabeceras: { 'idempotency-key': clave },
        }),
      transferencia: (id: string) =>
        p<Transferencia>('pagos', 'GET', `/api/v1/transferencias/${id}`),
      revertir: (id: string) =>
        p<Transferencia>('pagos', 'POST', `/api/v1/transferencias/${id}/reversion`),
      saldo: (celular: string) =>
        p<{ saldo: string }>('pagos', 'GET', `/api/v1/cuentas/${celular}/saldo`).then(
          (r) => r.saldo,
        ),
      cobrar: (c: { destino: string; monto?: string | number; descripcion?: string }) =>
        p<{ id: string; payload: string; qrPng: string; estado: string }>(
          'pagos',
          'POST',
          '/api/v1/cobros',
          { cuerpo: c },
        ),
      pagarCobro: (
        id: string,
        origen: string,
        monto?: string | number,
        clave: string = randomUUID(),
      ) =>
        p<Transferencia>('pagos', 'POST', `/api/v1/cobros/${id}/pago`, {
          cuerpo: { origen, ...(monto === undefined ? {} : { monto }) },
          idempotente: true,
          cabeceras: { 'idempotency-key': clave },
        }),
      suscribir: (url: string) =>
        p<{ id: string; url: string; secreto: string }>('pagos', 'POST', '/api/v1/webhooks', {
          cuerpo: { url },
        }),
      /** Espera a que una transferencia deje de estar pendiente (consulta cada `cada` ms). */
      esperar: async (id: string, { maximo = 15_000, cada = 250 } = {}) => {
        const fin = Date.now() + maximo;
        for (;;) {
          const t = await p<Transferencia>('pagos', 'GET', `/api/v1/transferencias/${id}`);
          if (t.estado !== 'pendiente' || Date.now() > fin) return t;
          await dormir(cada);
        }
      },
    };

    this.identidad = {
      ruc: (numero: string) => p<Contribuyente>('identidad', 'GET', `/api/v1/ruc/${numero}`),
      dni: (numero: string) =>
        p<{ dni: string; nombres: string; apellidoPaterno: string; apellidoMaterno: string }>(
          'identidad',
          'GET',
          `/api/v1/dni/${numero}`,
        ),
    };

    this.chaos = {
      /** Activa un perfil (`'cierre-de-mes'`) o reglas propias. */
      activar: (perfilOReglas: string | Regla[], semilla?: string) =>
        p<EstadoCaos>('caos', 'PUT', '/api/v1/caos', {
          cuerpo:
            typeof perfilOReglas === 'string'
              ? { perfil: perfilOReglas, semilla }
              : { reglas: perfilOReglas, semilla },
          idempotente: true,
        }),
      desactivar: () => p<EstadoCaos>('caos', 'DELETE', '/api/v1/caos', { idempotente: true }),
      estado: () => p<EstadoCaos>('caos', 'GET', '/api/v1/caos'),
      /** Ejecuta `fn` con el caos activo y lo desactiva al terminar, aunque `fn` falle. */
      con: async <T>(
        perfilOReglas: string | Regla[],
        fn: () => Promise<T>,
        semilla?: string,
      ): Promise<T> => {
        await this.chaos.activar(perfilOReglas, semilla);
        try {
          return await fn();
        } finally {
          await this.chaos.desactivar();
        }
      },
    };
  }

  private async pedir<T>(
    servicio: string,
    metodo: string,
    ruta: string,
    o: { cuerpo?: unknown; cabeceras?: Record<string, string>; idempotente?: boolean } = {},
  ): Promise<T> {
    const intentos = metodo === 'GET' || o.idempotente ? this.o.reintentos + 1 : 1;
    let ultimo: unknown;
    for (let i = 0; i < intentos; i++) {
      if (i > 0) await dormir(this.o.esperaBase * 2 ** (i - 1));
      try {
        const r = await this.o.fetch(`${this.o.base[servicio] ?? ''}${ruta}`, {
          method: metodo,
          headers: {
            ...this.o.cabeceras,
            ...(o.cuerpo === undefined ? {} : { 'content-type': 'application/json' }),
            ...o.cabeceras,
          },
          ...(o.cuerpo === undefined ? {} : { body: JSON.stringify(o.cuerpo) }),
          signal: AbortSignal.timeout(this.o.timeout),
        });
        const texto = await r.text();
        let json: { codigo?: string; error?: string; mensaje?: string; message?: string };
        try {
          json = JSON.parse(texto) as typeof json;
        } catch {
          // Respuesta truncada (falla «malformada»): se trata como error de transporte.
          throw new ErrorChasqui(r.status, 'RESPUESTA_INVALIDA', texto.slice(0, 120));
        }
        if (r.ok) return json as T;
        const err = new ErrorChasqui(
          r.status,
          json.codigo ?? json.error ?? String(r.status),
          json.mensaje ?? json.message ?? '',
        );
        if (!reintentable(r.status)) throw err;
        ultimo = err;
      } catch (e) {
        if (
          e instanceof ErrorChasqui &&
          !reintentable(e.status) &&
          e.codigo !== 'RESPUESTA_INVALIDA'
        )
          throw e;
        ultimo = e;
      }
    }
    throw ultimo;
  }
}

/**
 * Verifica la cabecera X-Chasqui-Firma de un webhook de pagos-sim: HMAC-SHA256 en tiempo constante
 * y antigüedad máxima (anti-replay, 300 s por defecto).
 */
export function verificarWebhook(
  secreto: string,
  cuerpo: string,
  firma: string,
  toleranciaS = 300,
  ahora = Date.now(),
): boolean {
  const m = /^t=(\d+),v1=([0-9a-f]{64})$/.exec(firma);
  if (!m?.[1] || !m[2]) return false;
  if (Math.abs(ahora / 1000 - Number(m[1])) > toleranciaS) return false;
  const esperada = createHmac('sha256', secreto).update(`${m[1]}.${cuerpo}`).digest();
  return timingSafeEqual(esperada, Buffer.from(m[2], 'hex'));
}
