import { z } from 'zod';

/**
 * Fallas inyectables. Las de transporte (latencia, timeout, 5xx, SOAP fault, respuesta malformada,
 * desconexión, rate limiting) las ejecuta el motor; las de negocio (rechazo, duplicado, ticket
 * eterno) las aplica cada simulador leyendo `req.caos` (ver docs/guia-caos.md).
 */
export const Falla = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('latencia'),
    /** Milisegundos fijos, o un rango [min, max] con distribución uniforme determinista. */
    ms: z.union([
      z.number().int().min(0),
      z.tuple([z.number().int().min(0), z.number().int().min(0)]),
    ]),
  }),
  z.object({ tipo: z.literal('timeout'), ms: z.number().int().min(1).default(30_000) }),
  z.object({
    tipo: z.literal('error5xx'),
    estado: z.union([z.literal(500), z.literal(502), z.literal(503), z.literal(504)]).default(503),
  }),
  z.object({ tipo: z.literal('soapFault'), codigo: z.string().default('0100') }),
  z.object({ tipo: z.literal('malformada') }),
  z.object({ tipo: z.literal('desconexion') }),
  z.object({ tipo: z.literal('rateLimit'), porSegundo: z.number().int().min(1) }),
  z.object({ tipo: z.literal('rechazo'), codigo: z.string().default('2335') }),
  z.object({ tipo: z.literal('duplicado') }),
  z.object({ tipo: z.literal('ticketEterno') }),
]);
export type Falla = z.infer<typeof Falla>;

export const Regla = z.object({
  /** Servicio al que aplica (sunat-sim, pagos-sim, …). Sin valor: todos. */
  servicio: z.string().optional(),
  /** Prefijo de ruta (p. ej. /billService). Sin valor: todas. */
  ruta: z.string().optional(),
  /** Probabilidad de 0 a 100. */
  porcentaje: z.number().min(0).max(100),
  falla: Falla,
});
export type Regla = z.infer<typeof Regla>;

export const Perfil = z.object({
  nombre: z.string().regex(/^[a-z0-9-]+$/),
  descripcion: z.string(),
  reglas: z.array(Regla),
});
export type Perfil = z.infer<typeof Perfil>;

/** Estado activo del caos: un perfil (o reglas propias) y la semilla que lo hace reproducible. */
export const EstadoCaos = z.object({
  perfil: z.string().nullable(),
  reglas: z.array(Regla),
  semilla: z.string(),
});
export type EstadoCaos = z.infer<typeof EstadoCaos>;

export const SIN_CAOS: EstadoCaos = { perfil: null, reglas: [], semilla: 'chasqui' };
