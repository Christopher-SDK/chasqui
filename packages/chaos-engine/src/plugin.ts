import type { OutgoingHttpHeaders } from 'node:http';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CabeceraInvalida, decidir, milisegundos } from './decision.js';
import type { EstadoCaos, Falla } from './modelo.js';

declare module 'fastify' {
  interface FastifyRequest {
    /** Fallas de negocio que el simulador debe aplicar (rechazo, duplicado, ticketEterno). */
    caos: Falla[];
  }
}

export interface EventoFalla {
  servicio: string;
  ruta: string;
  metodo: string;
  falla: Falla['tipo'];
  detalle: string;
  en: string;
}

export interface OpcionesCaos {
  servicio: string;
  /** Estado vigente (local, o el que llega de chaos-control). */
  estado: () => EstadoCaos;
  /** Reloj inyectable (rate limiting determinista en pruebas). */
  ahora?: () => number;
  /** Espera inyectable (las pruebas no duermen de verdad). */
  dormir?: (ms: number) => Promise<void>;
  alInyectar?: (e: EventoFalla) => void;
  /** Rutas que nunca reciben caos (salud, documentación, eventos del panel). */
  excluir?: readonly string[];
}

const NEGOCIO = new Set<Falla['tipo']>(['rechazo', 'duplicado', 'ticketEterno']);
const dormirReal = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Fault SOAP con el mismo formato que devuelve sunat-sim. */
const faultSoap = (codigo: string) =>
  '<?xml version="1.0" encoding="UTF-8"?><soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/"><soap-env:Body>' +
  `<soap-env:Fault><faultcode>soap-env:Client.${codigo}</faultcode><faultstring>El sistema no puede responder su solicitud. Intente nuevamente o comuníquese con su Administrador</faultstring></soap-env:Fault>` +
  '</soap-env:Body></soap-env:Envelope>';

/**
 * Registra el motor de caos en una instancia de Fastify. Se aplica a todas las rutas (incluidas las
 * de plugins registrados después), salvo las excluidas.
 */
export function registrarCaos(app: FastifyInstance, o: OpcionesCaos): void {
  const ahora = o.ahora ?? Date.now;
  const dormir = o.dormir ?? dormirReal;
  const excluir = o.excluir ?? ['/salud', '/docs', '/_chasqui', '/metrics'];
  const contadores = new Map<string, number>();
  const ventanas = new Map<number, { inicio: number; usados: number }>();
  const marcadas = new WeakMap<FastifyRequest, Falla['tipo']>();

  // Valor real en onRequest: Fastify 5 no admite referencias compartidas como valor inicial.
  app.decorateRequest('caos', null as unknown as Falla[]);

  const avisar = (req: FastifyRequest, falla: Falla, detalle: string) => {
    o.alInyectar?.({
      servicio: o.servicio,
      ruta: req.url,
      metodo: req.method,
      falla: falla.tipo,
      detalle,
      en: new Date(ahora()).toISOString(),
    });
  };

  const responder = (reply: FastifyReply, estado: number, cuerpo: string, tipo: string) =>
    reply.code(estado).header('x-chasqui-falla', 'inyectada').type(tipo).send(cuerpo);

  app.addHook('onRequest', async (req, reply) => {
    req.caos = [];
    const ruta = req.url.split('?')[0] ?? '/';
    if (excluir.some((e) => ruta.startsWith(e))) return;

    const estado = o.estado();
    const cabecera = req.headers['x-chasqui-chaos'];
    const base = `${req.method} ${ruta}`;
    const n = (contadores.get(base) ?? 0) + 1;
    contadores.set(base, n);
    const clave = String(
      req.headers['x-chasqui-clave'] ?? req.headers['idempotency-key'] ?? `${base}#${String(n)}`,
    );

    let fallas: Falla[];
    try {
      fallas = decidir(estado, {
        servicio: o.servicio,
        ruta,
        clave,
        cabecera: Array.isArray(cabecera) ? cabecera[0] : cabecera,
      });
    } catch (e) {
      if (e instanceof CabeceraInvalida)
        return responder(reply, 400, JSON.stringify({ error: e.message }), 'application/json');
      throw e;
    }

    for (const [i, f] of fallas.entries()) {
      switch (f.tipo) {
        case 'rateLimit': {
          // Ventana fija de 1 s por regla: el exceso recibe 429 con Retry-After.
          const t = ahora();
          const v = ventanas.get(i);
          const ventana = v && t - v.inicio < 1000 ? v : { inicio: t, usados: 0 };
          ventana.usados++;
          ventanas.set(i, ventana);
          if (ventana.usados > f.porSegundo) {
            avisar(req, f, `más de ${String(f.porSegundo)} por segundo`);
            reply.header('retry-after', '1');
            return responder(
              reply,
              429,
              JSON.stringify({ error: 'Demasiadas solicitudes' }),
              'application/json',
            );
          }
          break;
        }
        case 'latencia': {
          const ms = milisegundos(f.ms, estado.semilla, clave);
          avisar(req, f, `${String(ms)} ms`);
          await dormir(ms);
          break;
        }
        case 'timeout':
          // No responde: retiene la petición y corta la conexión sin respuesta.
          avisar(req, f, `${String(f.ms)} ms sin respuesta`);
          reply.hijack();
          await dormir(f.ms);
          reply.raw.destroy();
          return reply;
        case 'error5xx':
          avisar(req, f, `HTTP ${String(f.estado)}`);
          return responder(
            reply,
            f.estado,
            JSON.stringify({ error: 'Falla inyectada por Chasqui', estado: f.estado }),
            'application/json',
          );
        case 'soapFault':
          avisar(req, f, `Client.${f.codigo}`);
          return responder(reply, 500, faultSoap(f.codigo), 'text/xml; charset=utf-8');
        case 'malformada':
        case 'desconexion':
          marcadas.set(req, f.tipo);
          avisar(
            req,
            f,
            f.tipo === 'malformada' ? 'cuerpo truncado' : 'conexión cortada a mitad de respuesta',
          );
          break;
        default:
          if (NEGOCIO.has(f.tipo)) {
            req.caos.push(f);
            avisar(req, f, 'aplicada por el simulador');
          }
      }
    }
    return undefined;
  });

  app.addHook('onSend', async (req, reply, payload) => {
    const tipo = marcadas.get(req);
    if (!tipo || typeof payload !== 'string') return payload;
    const mitad = payload.slice(0, Math.max(1, Math.floor(payload.length / 2)));
    reply.header('x-chasqui-falla', 'inyectada');
    if (tipo === 'malformada') return `${mitad}\u0000<<truncado`;
    // Desconexión: escribe directo al socket anunciando el largo completo, envía la mitad y lo
    // corta. Fastify recalcularía content-length si se devolviera la mitad como cuerpo.
    reply.hijack();
    reply.raw.writeHead(reply.statusCode, {
      ...(reply.getHeaders() as OutgoingHttpHeaders),
      'content-length': String(Buffer.byteLength(payload)),
    });
    reply.raw.write(mitad, () => reply.raw.destroy());
    return null;
  });
}
