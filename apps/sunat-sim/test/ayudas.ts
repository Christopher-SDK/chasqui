import {
  calcular,
  emitir,
  empaquetar,
  firmar,
  generarBaja,
  generarResumen,
  generarXml,
  lineaResumen,
  nombreArchivo,
  nombreBaja,
  nombreResumen,
  type Factura,
} from '@chasqui/ubl-core';
import { abrirDb } from '../src/db.js';
import { construirServidor } from '../src/servidor.js';

// Datos ficticios: el RUC 20000000001 no pertenece a ningún contribuyente real.
export const factura = (correlativo = 1, fechaEmision = '2026-11-03'): Factura => ({
  tipo: '01',
  serie: 'F001',
  correlativo,
  fechaEmision,
  horaEmision: '10:00:00',
  moneda: 'PEN',
  emisor: {
    ruc: '20000000001',
    razonSocial: 'COMERCIAL CHASQUI DEMO S.A.C.',
    direccion: {
      ubigeo: '150101',
      departamento: 'LIMA',
      provincia: 'LIMA',
      distrito: 'LIMA',
      linea: 'AV. FICTICIA 123',
    },
  },
  cliente: { tipoDocumento: '6', numeroDocumento: '20000000002', nombre: 'CLIENTE DEMO S.A.' },
  items: [
    {
      descripcion: 'Producto',
      cantidad: 2,
      unidad: 'NIU',
      valorUnitario: '50.00',
      afectacion: '10',
    },
  ],
});

/** Emite con una alteración del XML ANTES de firmar (el documento queda bien firmado). */
export function emitirAlterado(c: Factura, alterar: (xml: string) => string) {
  const nombre = nombreArchivo(c);
  return {
    nombreZip: `${nombre}.zip`,
    zip: empaquetar(nombre, firmar(alterar(generarXml(calcular(c))))),
  };
}

export { emitir };

/** Servidor real escuchando en un puerto libre, con reloj controlable. */
export async function levantar(inicio = '2026-11-03T15:00:00Z') {
  let t = new Date(inicio);
  const app = await construirServidor({ db: abrirDb(':memory:'), ahora: () => t, registro: false });
  await app.listen({ port: 0, host: '127.0.0.1' });
  const dir = app.server.address();
  const base = `http://127.0.0.1:${typeof dir === 'object' && dir ? String(dir.port) : '0'}`;
  return {
    app,
    base,
    avanzar: (ms: number) => {
      t = new Date(t.getTime() + ms);
    },
    enviarRest: (nombreArchivo: string, zip: Uint8Array) =>
      fetch(`${base}/api/v1/comprobantes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nombreArchivo, contenido: Buffer.from(zip).toString('base64') }),
      }),
    soap: (
      cuerpo: string,
      usuario = '20000000001MODDATOS',
      clave = 'moddatos',
      conSeguridad = true,
    ) =>
      fetch(`${base}/billService`, {
        method: 'POST',
        headers: { 'content-type': 'text/xml; charset=utf-8', soapaction: 'urn:sendBill' },
        body: sobre(cuerpo, conSeguridad ? usuario : null, clave),
      }),
  };
}

export function sobre(cuerpo: string, usuario: string | null, clave = 'moddatos') {
  const seguridad = usuario
    ? `<soapenv:Header><wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><wsse:UsernameToken><wsse:Username>${usuario}</wsse:Username><wsse:Password>${clave}</wsse:Password></wsse:UsernameToken></wsse:Security></soapenv:Header>`
    : '<soapenv:Header/>';
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.sunat.gob.pe">${seguridad}<soapenv:Body>${cuerpo}</soapenv:Body></soapenv:Envelope>`;
}

export const sendBill = (nombre: string, zip: Uint8Array) =>
  `<ser:sendBill><fileName>${nombre}</fileName><contentFile>${Buffer.from(zip).toString('base64')}</contentFile></ser:sendBill>`;

/** Comunicación de baja firmada (generador de ubl-core). */
export function baja(serie: string, numero: number, fecha = '2026-11-03', correlativo = 1) {
  const b = {
    emisor: factura().emisor,
    correlativo,
    fechaComunicacion: fecha,
    fechaReferencia: fecha,
    lineas: [{ tipo: '01' as const, serie, numero, motivo: 'Error en la operación' }],
  };
  const nombre = nombreBaja(b);
  return { nombreZip: `${nombre}.zip`, zip: empaquetar(nombre, firmar(generarBaja(b))) };
}

/** Resumen diario de boletas firmado: la primera se adiciona y la segunda se anula. */
export function resumenBoletas(fecha = '2026-11-03') {
  const boleta = (n: number) =>
    calcular({
      ...factura(n, fecha),
      tipo: '03' as const,
      serie: 'B001',
      cliente: {
        tipoDocumento: '1' as const,
        numeroDocumento: '00000001',
        nombre: 'CLIENTE FICTICIO',
      },
    });
  const r = {
    emisor: factura().emisor,
    correlativo: 1,
    fechaResumen: fecha,
    fechaReferencia: fecha,
    moneda: 'PEN' as const,
    lineas: [lineaResumen(boleta(1), '1'), lineaResumen(boleta(2), '3')],
  };
  const nombre = nombreResumen(r);
  return { nombreZip: `${nombre}.zip`, zip: empaquetar(nombre, firmar(generarResumen(r))) };
}

export const sendSummary = (nombre: string, zip: Uint8Array) =>
  `<ser:sendSummary><fileName>${nombre}</fileName><contentFile>${Buffer.from(zip).toString('base64')}</contentFile></ser:sendSummary>`;
