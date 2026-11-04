import { readFileSync } from 'node:fs';
import { mensajeError } from '@chasqui/catalogos';
import type { FastifyPluginCallback, FastifyReply } from 'fastify';
import { XMLParser } from 'fast-xml-parser';
import { recibir, type Dependencias } from './recepcion.js';
import { consultarTicket, recibirResumen } from './tickets.js';

/**
 * Endpoint SOAP 1.1 compatible con billService (WSDL en ../wsdl). Autenticación WS-Security
 * UsernameToken: usuario = RUC + usuario SOL, como en el ambiente beta (<RUC>MODDATOS / moddatos).
 * Las excepciones (0100-1999) se devuelven como SOAP Fault «soap-env:Client.<código>», que es lo
 * que interpretan los clientes existentes (Greenter: BaseSunat::getErrorFromFault).
 */

const ENV = 'http://schemas.xmlsoap.org/soap/envelope/';
const SER = 'http://service.sunat.gob.pe';
const WSDL = new URL('../wsdl/', import.meta.url);
const parser = new XMLParser({
  removeNSPrefix: true,
  ignoreAttributes: true,
  parseTagValue: false,
});

type Cuerpo = Record<string, Record<string, unknown> | undefined>;

interface Sobre {
  Envelope?: {
    Header?: { Security?: { UsernameToken?: { Username?: unknown; Password?: unknown } } };
    Body?: Cuerpo;
  };
}

class FaultSoap extends Error {
  constructor(
    readonly codigo: string,
    readonly detalle?: string,
  ) {
    super(detalle ?? mensajeError(codigo));
  }
}

const texto = (v: unknown): string =>
  typeof v === 'string'
    ? v.trim()
    : typeof v === 'object' && v && '#text' in v
      ? String(v['#text']).trim()
      : '';

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function respuesta(reply: FastifyReply, cuerpo: string, codigo = 200) {
  return reply
    .code(codigo)
    .type('text/xml; charset=utf-8')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><soap-env:Envelope xmlns:soap-env="${ENV}"><soap-env:Header/><soap-env:Body>${cuerpo}</soap-env:Body></soap-env:Envelope>`,
    );
}

/** Devuelve el RUC del usuario autenticado o lanza 0101/0102. */
function autenticar(sobre: Sobre): string {
  const token = sobre.Envelope?.Header?.Security?.UsernameToken;
  if (!token) throw new FaultSoap('0101');
  const usuario = texto(token.Username).toUpperCase();
  const clave = texto(token.Password);
  const m = /^(\d{11})MODDATOS$/.exec(usuario);
  if (!m || clave.toLowerCase() !== 'moddatos') throw new FaultSoap('0102');
  return m[1] ?? '';
}

function archivo(op: Record<string, unknown>, ruc: string) {
  const nombre = texto(op.fileName);
  const contenido = texto(op.contentFile);
  if (!nombre) throw new FaultSoap('0151', 'No se envió fileName');
  if (!contenido) throw new FaultSoap('0155', 'No se envió contentFile');
  if (!nombre.startsWith(ruc)) throw new FaultSoap('0154');
  return { nombre, zip: Buffer.from(contenido, 'base64') };
}

export function rutasSoap(deps: Dependencias): FastifyPluginCallback {
  return (app, _opciones, listo) => {
    app.addContentTypeParser(
      ['text/xml', 'application/soap+xml'],
      { parseAs: 'string' },
      (_req, body, done) => {
        done(null, body);
      },
    );

    for (const ruta of ['/billService', '/ol-ti-itcpfegem-beta/billService']) {
      app.get(ruta, { schema: { hide: true } }, (req, reply) => {
        const base = `${req.protocol}://${req.headers.host ?? 'localhost'}`;
        const pedido = Object.keys(req.query as object)[0]?.toLowerCase();
        const archivoWsdl =
          pedido === 'ns1.wsdl'
            ? 'billService.ns1.wsdl'
            : pedido === 'xsd2.xsd'
              ? 'billService.xsd2.xsd'
              : 'billService.wsdl';
        const contenido = readFileSync(new URL(archivoWsdl, WSDL), 'utf8')
          .replaceAll('{{BASE}}', base)
          .replace('location="billService.ns1.wsdl"', `location="${base}/billService?ns1.wsdl"`)
          .replace(
            'schemaLocation="billService.xsd2.xsd"',
            `schemaLocation="${base}/billService?xsd2.xsd"`,
          );
        return reply.type('text/xml; charset=utf-8').send(contenido);
      });

      app.post(ruta, { schema: { hide: true } }, async (req, reply) => {
        try {
          let sobre: Sobre;
          try {
            sobre = parser.parse(String(req.body)) as Sobre;
          } catch {
            throw new FaultSoap('0306', 'El mensaje SOAP no es un XML válido');
          }
          const cuerpo = sobre.Envelope?.Body ?? {};
          const ruc = autenticar(sobre);
          if (cuerpo.sendBill) {
            const { nombre, zip } = archivo(cuerpo.sendBill, ruc);
            const r = await recibir(deps, nombre, zip, 'soap');
            if (r.tipo === 'excepcion') throw new FaultSoap(r.codigo, r.mensaje);
            return await respuesta(
              reply,
              `<br:sendBillResponse xmlns:br="${SER}"><applicationResponse>${Buffer.from(r.cdrZip).toString('base64')}</applicationResponse></br:sendBillResponse>`,
            );
          }
          if (cuerpo.sendSummary) {
            const { nombre, zip } = archivo(cuerpo.sendSummary, ruc);
            const r = await recibirResumen(deps, nombre, zip, 'soap');
            if (r.tipo === 'excepcion') throw new FaultSoap(r.codigo, r.mensaje);
            return await respuesta(
              reply,
              `<br:sendSummaryResponse xmlns:br="${SER}"><ticket>${r.ticket}</ticket></br:sendSummaryResponse>`,
            );
          }
          if (cuerpo.getStatus) {
            const r = await consultarTicket(deps, texto(cuerpo.getStatus.ticket));
            if (r.tipo === 'excepcion') throw new FaultSoap(r.codigo, r.mensaje);
            const contenido = r.cdrZip
              ? `<content>${Buffer.from(r.cdrZip).toString('base64')}</content>`
              : '';
            return await respuesta(
              reply,
              `<br:getStatusResponse xmlns:br="${SER}"><status>${contenido}<statusCode>${r.estado}</statusCode></status></br:getStatusResponse>`,
            );
          }
          throw new FaultSoap(
            '0200',
            'Operación no soportada: use sendBill, sendSummary o getStatus',
          );
        } catch (e) {
          if (!(e instanceof FaultSoap)) throw e;
          return await respuesta(
            reply,
            `<soap-env:Fault><faultcode>soap-env:Client.${e.codigo}</faultcode><faultstring>${escapar(e.message)}</faultstring></soap-env:Fault>`,
            500,
          );
        }
      });
    }
    listo();
  };
}
