import { createHash } from 'node:crypto';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { FuenteCaos, registrarCaos } from '@chasqui/chaos-engine';
import { contribuyenteFicticio, dniValido, personaFicticia, rucValido } from '@chasqui/test-kit';
import Fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';

export const AVISO =
  'Simulador para pruebas. No afiliado a SUNAT, RENIEC ni a ninguna entidad. Todos los datos son ficticios.';

const Error = z.object({ codigo: z.string(), mensaje: z.string() });

/** 3 % de los documentos válidos «no existen»: el cliente debe manejar el 404. */
const existe = (numero: string) =>
  createHash('sha256').update(`existe|${numero}`).digest().readUInt32BE(0) % 100 >= 3;

/**
 * identidad-sim: consulta de DNI y RUC sobre un dataset ficticio y determinista (el mismo número
 * devuelve siempre los mismos datos). No contiene ni consulta datos reales.
 */
export async function construirServidor(o: { registro?: boolean; caos?: FuenteCaos } = {}) {
  const app = Fastify({
    logger: o.registro ?? process.env.NODE_ENV !== 'test',
    forceCloseConnections: true,
  }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: { title: 'Chasqui · identidad-sim', version: '0.1.0', description: AVISO },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });
  const caos = o.caos ?? new FuenteCaos(process.env.CHAOS_CONTROL_URL).iniciar();
  registrarCaos(app, { servicio: 'identidad-sim', estado: caos.estado });
  app.addHook('onClose', () => {
    caos.detener();
  });
  app.addHook('onSend', async (_req, reply) => {
    reply.header('x-chasqui-aviso', 'simulador-no-oficial');
    reply.header('access-control-allow-origin', '*');
  });
  app.get('/salud', { schema: { hide: true } }, () => ({
    estado: 'ok',
    servicio: 'identidad-sim',
    aviso: AVISO,
  }));

  const r = app.withTypeProvider<ZodTypeProvider>();
  r.get(
    '/api/v1/dni/:numero',
    {
      schema: {
        summary: 'Consulta de DNI (persona ficticia)',
        tags: ['identidad'],
        params: z.object({ numero: z.string() }),
        response: {
          200: z.object({
            dni: z.string(),
            nombres: z.string(),
            apellidoPaterno: z.string(),
            apellidoMaterno: z.string(),
          }),
          400: Error,
          404: Error,
        },
      },
    },
    async (req, reply) => {
      const { numero } = req.params;
      if (!dniValido(numero))
        return reply
          .code(400)
          .send({ codigo: 'DNI_INVALIDO', mensaje: 'El DNI debe tener 8 dígitos' });
      if (!existe(numero))
        return reply
          .code(404)
          .send({ codigo: 'NO_ENCONTRADO', mensaje: 'DNI no registrado en el dataset ficticio' });
      return personaFicticia(numero);
    },
  );

  r.get(
    '/api/v1/ruc/:numero',
    {
      schema: {
        summary: 'Consulta de RUC: razón social, estado y condición del contribuyente (ficticios)',
        tags: ['identidad'],
        params: z.object({ numero: z.string() }),
        response: {
          200: z.object({
            ruc: z.string(),
            razonSocial: z.string(),
            estado: z.enum(['ACTIVO', 'BAJA DE OFICIO', 'BAJA DEFINITIVA', 'SUSPENSION TEMPORAL']),
            condicion: z.enum(['HABIDO', 'NO HABIDO']),
            ubigeo: z.string(),
            direccion: z.string(),
          }),
          400: Error,
          404: Error,
        },
      },
    },
    async (req, reply) => {
      const { numero } = req.params;
      if (!rucValido(numero))
        return reply
          .code(400)
          .send({ codigo: 'RUC_INVALIDO', mensaje: 'Formato o dígito verificador incorrecto' });
      if (!existe(numero))
        return reply
          .code(404)
          .send({ codigo: 'NO_ENCONTRADO', mensaje: 'RUC no registrado en el dataset ficticio' });
      return contribuyenteFicticio(numero);
    },
  );
  return app;
}
