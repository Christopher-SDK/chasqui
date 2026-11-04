import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { leerCdr } from '@chasqui/ubl-core';
import { z } from 'zod';
import { recibir, type Dependencias } from './recepcion.js';

const Observacion = z.object({ codigo: z.string(), mensaje: z.string(), fuente: z.string() });

const Resultado = z.object({
  id: z.string(),
  estado: z.enum(['aceptado', 'observado', 'rechazado']),
  codigo: z.string().describe("'0' si fue aceptado; si no, el código de rechazo (2000-3999)"),
  mensaje: z.string(),
  observaciones: z.array(Observacion),
  cdr: z.string().describe('ZIP del CDR en base64 (R-<nombre>.zip)'),
});

const Excepcion = z.object({
  codigo: z.string().describe('Excepción 0100-1999: no se emite CDR'),
  mensaje: z.string(),
});

const EstadoComprobante = z.object({
  estado: z.enum(['aceptado', 'observado', 'rechazado', 'anulado', 'no informado']),
  codigo: z.string().nullable(),
  mensaje: z.string().nullable(),
});

const Resumen = z.object({
  id: z.string(),
  ruc: z.string(),
  tipo: z.string(),
  serie: z.string(),
  numero: z.number(),
  fechaEmision: z.string(),
  estado: z.string(),
  codigo: z.string(),
  mensaje: z.string(),
  observaciones: z.array(Observacion),
  canal: z.string(),
  recibidoEn: z.string(),
});

const Detalle = Resumen.extend({ xml: z.string(), cdrXml: z.string().nullable() });

type Fila = {
  id: string;
  ruc: string;
  tipo: string;
  serie: string;
  numero: number;
  fecha_emision: string;
  estado: string;
  codigo: string;
  mensaje: string;
  observaciones: string;
  canal: string;
  recibido_en: string;
};

const resumen = (f: Fila) => ({
  id: f.id,
  ruc: f.ruc,
  tipo: f.tipo,
  serie: f.serie,
  numero: f.numero,
  fechaEmision: f.fecha_emision,
  estado: f.estado,
  codigo: f.codigo,
  mensaje: f.mensaje,
  observaciones: JSON.parse(f.observaciones) as z.infer<typeof Observacion>[],
  canal: f.canal,
  recibidoEn: f.recibido_en,
});

export function rutasRest(deps: Dependencias): FastifyPluginCallback {
  return (app, _opciones, listo) => {
    const r = app.withTypeProvider<ZodTypeProvider>();

    r.post(
      '/api/v1/comprobantes',
      {
        schema: {
          summary: 'Enviar un comprobante (equivalente REST de sendBill)',
          tags: ['comprobantes'],
          body: z.object({
            nombreArchivo: z.string().describe('RUC-TIPO-SERIE-NUMERO.zip'),
            contenido: z.string().describe('ZIP en base64 con el XML firmado'),
          }),
          response: { 200: Resultado, 400: Excepcion },
        },
      },
      async (req, reply) => {
        const res = await recibir(
          deps,
          req.body.nombreArchivo,
          Buffer.from(req.body.contenido, 'base64'),
          'rest',
          req.caos,
        );
        if (res.tipo === 'excepcion')
          return reply.code(400).send({ codigo: res.codigo, mensaje: res.mensaje });
        return {
          id: res.id,
          estado: res.estado,
          codigo: res.codigo,
          mensaje: res.mensaje,
          observaciones: res.observaciones,
          cdr: Buffer.from(res.cdrZip).toString('base64'),
        };
      },
    );

    r.get(
      '/api/v1/comprobantes',
      {
        schema: {
          summary: 'Historial de comprobantes recibidos',
          tags: ['comprobantes'],
          querystring: z.object({
            ruc: z.string().optional(),
            estado: z.string().optional(),
            limite: z.coerce.number().int().min(1).max(500).default(50),
          }),
          response: { 200: z.array(Resumen) },
        },
      },
      async (req) => {
        let q = deps.db
          .selectFrom('comprobantes')
          .selectAll()
          .orderBy('recibido_en', 'desc')
          .limit(req.query.limite);
        if (req.query.ruc) q = q.where('ruc', '=', req.query.ruc);
        if (req.query.estado) q = q.where('estado', '=', req.query.estado as never);
        return (await q.execute()).map(resumen);
      },
    );

    r.get(
      '/api/v1/comprobantes/:id',
      {
        schema: {
          summary: 'Detalle: XML recibido y CDR devuelto',
          tags: ['comprobantes'],
          params: z.object({ id: z.string() }),
          response: { 200: Detalle, 404: Excepcion },
        },
      },
      async (req, reply) => {
        const f = await deps.db
          .selectFrom('comprobantes')
          .selectAll()
          .where('id', '=', req.params.id)
          .executeTakeFirst();
        if (!f)
          return reply.code(404).send({ codigo: '404', mensaje: 'Comprobante no encontrado' });
        return {
          ...resumen(f),
          xml: f.xml,
          cdrXml: f.cdr ? leerCdr(Buffer.from(f.cdr, 'base64')).xml : null,
        };
      },
    );

    r.get(
      '/api/v1/estado/:ruc/:tipo/:serie/:numero',
      {
        schema: {
          summary: 'Consulta de estado de un comprobante',
          tags: ['consulta'],
          params: z.object({
            ruc: z.string(),
            tipo: z.string(),
            serie: z.string(),
            numero: z.coerce.number(),
          }),
          response: { 200: EstadoComprobante },
        },
      },
      async (req) => {
        const { ruc, tipo, serie, numero } = req.params;
        const f = await deps.db
          .selectFrom('comprobantes')
          .select(['estado', 'codigo', 'mensaje'])
          .where('ruc', '=', ruc)
          .where('tipo', '=', tipo)
          .where('serie', '=', serie)
          .where('numero', '=', numero)
          .executeTakeFirst();
        return f ?? { estado: 'no informado' as const, codigo: null, mensaje: null };
      },
    );
    listo();
  };
}
