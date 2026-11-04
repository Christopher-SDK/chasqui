import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { mensajeError } from '@chasqui/catalogos';
import {
  desempaquetar,
  empaquetarCdr,
  generarCdr,
  validarXml,
  verificarFirma,
} from '@chasqui/ubl-core';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { enLima, type Dependencias } from './recepcion.js';
import { DEMORA_TICKET_MS, NUNCA } from './tickets.js';

/**
 * Guía de remisión electrónica por REST con OAuth simulado. Rutas y esquemas de la API GRE según
 * el OpenAPI de thegreenter/gre-api (MIT): token OAuth2 «password», envío con el ZIP en base64 y su
 * SHA-256, y consulta por ticket con codRespuesta 98 (en proceso), 0 (aceptado) o 99 (con error).
 * Es el diferencial de Chasqui: la plataforma real no ofrece ambiente de pruebas para la GRE.
 */

const SECRETO = process.env.GRE_SECRETO ?? randomBytes(32).toString('hex');
const b64 = (x: string | Buffer) => Buffer.from(x).toString('base64url');

export function firmarToken(payload: Record<string, unknown>): string {
  const cuerpo = `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify(payload))}`;
  return `${cuerpo}.${createHmac('sha256', SECRETO).update(cuerpo).digest('base64url')}`;
}

/** RUC del token si la firma es válida y no venció; si no, null. */
export function verificarToken(token: string, ahora: Date): string | null {
  const [h, p, firma] = token.split('.');
  if (!h || !p || !firma) return null;
  const esperada = Buffer.from(
    createHmac('sha256', SECRETO).update(`${h}.${p}`).digest('base64url'),
  );
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  const datos = JSON.parse(Buffer.from(p, 'base64url').toString()) as {
    sub?: string;
    exp?: number;
  };
  if (!datos.sub || !datos.exp || datos.exp * 1000 < ahora.getTime()) return null;
  return datos.sub;
}

const ErrorValidacion = z.object({
  cod: z.string(),
  msg: z.string(),
  errors: z.array(z.object({ cod: z.string(), msg: z.string() })),
});

export function rutasGre(deps: Dependencias): FastifyPluginCallback {
  return (app, _o, listo) => {
    const r = app.withTypeProvider<ZodTypeProvider>();
    app.addContentTypeParser(
      'application/x-www-form-urlencoded',
      { parseAs: 'string' },
      (_req, cuerpo, hecho) => {
        hecho(null, Object.fromEntries(new URLSearchParams(String(cuerpo))));
      },
    );

    const autenticado = (req: FastifyRequest) => {
      const m = /^Bearer (.+)$/.exec(req.headers.authorization ?? '');
      return m?.[1] ? verificarToken(m[1], deps.ahora()) : null;
    };
    const error422 = (cod: string, msg = mensajeError(cod)) => ({
      cod: '422',
      msg: 'Unprocessable Entity',
      errors: [{ cod, msg }],
    });

    r.post(
      '/v1/clientessol/:clientId/oauth2/token/',
      {
        schema: {
          summary: 'Token OAuth2 (grant_type=password). Usuario: <RUC>MODDATOS, clave: moddatos',
          tags: ['gre'],
          params: z.object({ clientId: z.string() }),
          body: z.object({
            grant_type: z.string(),
            scope: z.string().optional(),
            client_id: z.string().optional(),
            client_secret: z.string().min(1),
            username: z.string(),
            password: z.string(),
          }),
          response: {
            200: z.object({
              access_token: z.string(),
              token_type: z.string(),
              expires_in: z.number(),
            }),
            400: z.object({ error: z.string(), error_description: z.string() }),
          },
        },
      },
      async (req, reply) => {
        const m = /^(\d{11})MODDATOS$/i.exec(req.body.username);
        if (
          req.body.grant_type !== 'password' ||
          !m?.[1] ||
          req.body.password.toLowerCase() !== 'moddatos'
        )
          return reply.code(400).send({
            error: 'invalid_grant',
            error_description: 'Usuario o contraseña incorrectos',
          });
        const exp = Math.floor(deps.ahora().getTime() / 1000) + 3600;
        return {
          access_token: firmarToken({ sub: m[1], cid: req.params.clientId, exp }),
          token_type: 'JWT',
          expires_in: 3600,
        };
      },
    );

    r.post(
      '/v1/contribuyente/gem/comprobantes/:archivo',
      {
        schema: {
          summary: 'Enviar una guía de remisión (devuelve un ticket)',
          tags: ['gre'],
          params: z.object({ archivo: z.string().describe('RUC-09-SERIE-NUMERO, sin extensión') }),
          body: z.object({
            archivo: z.object({
              nomArchivo: z.string(),
              arcGreZip: z.string(),
              hashZip: z.string(),
            }),
          }),
          response: {
            200: z.object({ numTicket: z.string(), fecRecepcion: z.string() }),
            401: z.object({ msg: z.string() }),
            422: ErrorValidacion,
          },
        },
      },
      async (req, reply) => {
        const ruc = autenticado(req);
        if (!ruc) return reply.code(401).send({ msg: 'Token inválido o vencido' });
        const { nomArchivo, arcGreZip, hashZip } = req.body.archivo;
        if (nomArchivo !== `${req.params.archivo}.zip` || !/^\d{11}-09-/.test(nomArchivo))
          return reply.code(422).send(error422('0151'));
        if (!nomArchivo.startsWith(ruc)) return reply.code(422).send(error422('0154'));
        const zip = Buffer.from(arcGreZip, 'base64');
        // TODO verificar: código oficial para un hashZip que no coincide; se usa 0156 (ZIP corrupto).
        if (createHash('sha256').update(zip).digest('hex') !== hashZip.toLowerCase())
          return reply
            .code(422)
            .send(error422('0156', 'El hashZip no coincide con el SHA-256 del archivo'));
        const abierto = desempaquetar(nomArchivo, zip);
        if (!abierto.ok) return reply.code(422).send(error422(abierto.codigo));

        const ahora = deps.ahora();
        const nombre = req.params.archivo;
        const [, , serie = '', numero = '0'] = nombre.split('-');
        const previo = await deps.db
          .selectFrom('comprobantes')
          .select('estado')
          .where('id', '=', nombre)
          .executeTakeFirst();
        const firma = verificarFirma(abierto.xml);
        const forzado = req.caos.find((f) => f.tipo === 'rechazo');
        const duplicado = req.caos.some((f) => f.tipo === 'duplicado');
        const codigo = duplicado
          ? '1033'
          : forzado
            ? forzado.codigo
            : previo
              ? previo.estado === 'rechazado'
                ? '1032'
                : '1033'
              : !firma.valida
                ? firma.codigo
                : (validarXml(abierto.xml, abierto.nombreXml).error?.codigo ?? '0');
        const ticket = randomUUID();
        await deps.db
          .insertInto('tickets')
          .values({
            ticket,
            tipo: '09',
            nombre,
            estado: '98',
            codigo,
            cdr: null,
            xml: abierto.xml,
            creado_en: ahora.toISOString(),
            listo_en: req.caos.some((f) => f.tipo === 'ticketEterno')
              ? NUNCA
              : new Date(ahora.getTime() + DEMORA_TICKET_MS).toISOString(),
          })
          .execute();
        deps.eventos.emitir({
          tipo: 'ticket',
          servicio: 'sunat-sim',
          canal: 'gre',
          nombre,
          ticket,
          estado: '98',
          en: ahora.toISOString(),
          serie,
          numero,
        });
        return { numTicket: ticket, fecRecepcion: ahora.toISOString() };
      },
    );

    r.get(
      '/v1/contribuyente/gem/comprobantes/envios/:numTicket',
      {
        schema: {
          summary: 'Consultar el envío de una guía (codRespuesta 98, 0 o 99)',
          tags: ['gre'],
          params: z.object({ numTicket: z.string() }),
          response: {
            200: z.object({
              codRespuesta: z.enum(['98', '0', '99']),
              error: z.object({ numError: z.string(), desError: z.string() }).optional(),
              arcCdr: z.string().optional(),
              indCdrGenerado: z.enum(['0', '1']).optional(),
            }),
            401: z.object({ msg: z.string() }),
            422: ErrorValidacion,
          },
        },
      },
      async (req, reply) => {
        if (!autenticado(req)) return reply.code(401).send({ msg: 'Token inválido o vencido' });
        const t = await deps.db
          .selectFrom('tickets')
          .selectAll()
          .where('ticket', '=', req.params.numTicket)
          .where('tipo', '=', '09')
          .executeTakeFirst();
        if (!t) return reply.code(422).send(error422('0127'));
        const ahora = deps.ahora();
        if (t.estado === '98' && ahora.toISOString() < t.listo_en)
          return { codRespuesta: '98' as const };

        const aceptado = t.codigo === '0';
        // Excepciones (0100-1999) no generan CDR; los rechazos (2000-3999) sí.
        const conCdr = aceptado || Number(t.codigo) >= 2000;
        let cdr = t.cdr;
        if (t.estado === '98') {
          const { fecha, hora } = enLima(ahora);
          const [ruc = '', , serie = '', numero = '0'] = t.nombre.split('-');
          if (conCdr) {
            const xml = generarCdr({
              nombre: t.nombre,
              serieNumero: `${serie}-${numero}`,
              rucEmisor: ruc,
              codigo: t.codigo,
              descripcion: aceptado
                ? `La Guia de Remision Remitente numero ${serie}-${numero}, ha sido aceptada`
                : mensajeError(t.codigo),
              observaciones: [],
              fecha,
              hora,
              id: t.ticket,
            });
            cdr = Buffer.from(empaquetarCdr(t.nombre, xml)).toString('base64');
            await deps.db
              .insertInto('comprobantes')
              .values({
                id: t.nombre,
                ruc,
                tipo: '09',
                serie,
                numero: Number(numero),
                fecha_emision: /<cbc:IssueDate>([^<]+)</.exec(t.xml)?.[1] ?? '',
                hash: createHash('sha256').update(t.xml).digest('hex'),
                estado: aceptado ? 'aceptado' : 'rechazado',
                codigo: t.codigo,
                mensaje: aceptado ? 'Guía de remisión aceptada' : mensajeError(t.codigo),
                observaciones: '[]',
                canal: 'gre',
                xml: t.xml,
                cdr,
                recibido_en: t.creado_en,
              })
              .onConflict((oc) => oc.doNothing())
              .execute();
          }
          await deps.db
            .updateTable('tickets')
            .set({ estado: aceptado ? '0' : '99', cdr })
            .where('ticket', '=', t.ticket)
            .execute();
          deps.eventos.emitir({
            tipo: aceptado || conCdr ? 'comprobante' : 'excepcion',
            servicio: 'sunat-sim',
            canal: 'gre',
            nombre: t.nombre,
            estado: aceptado ? 'aceptado' : 'rechazado',
            codigo: t.codigo,
            mensaje: aceptado ? 'Guía de remisión aceptada' : mensajeError(t.codigo),
            observaciones: [],
            en: ahora.toISOString(),
          });
        }
        return {
          codRespuesta: aceptado ? ('0' as const) : ('99' as const),
          ...(aceptado ? {} : { error: { numError: t.codigo, desError: mensajeError(t.codigo) } }),
          ...(cdr
            ? { arcCdr: cdr, indCdrGenerado: '1' as const }
            : { indCdrGenerado: '0' as const }),
        };
      },
    );
    listo();
  };
}
