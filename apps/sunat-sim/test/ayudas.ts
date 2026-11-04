import {
  calcular,
  emitir,
  empaquetar,
  firmar,
  generarXml,
  nombreArchivo,
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

/** Comunicación de baja mínima (VoidedDocuments) firmada; en la fase 2 pasa a ubl-core. */
export function baja(serie: string, numero: number, fecha = '2026-11-03') {
  const nombre = `20000000001-RA-${fecha.replaceAll('-', '')}-1`;
  const xml = firmar(
    `<?xml version="1.0" encoding="UTF-8"?><VoidedDocuments xmlns="urn:sunat:names:specification:ubl:peru:schema:xsd:VoidedDocuments-1" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2" xmlns:sac="urn:sunat:names:specification:ubl:peru:schema:xsd:SunatAggregateComponents-1"><ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent/></ext:UBLExtension></ext:UBLExtensions><cbc:UBLVersionID>2.0</cbc:UBLVersionID><cbc:CustomizationID>1.0</cbc:CustomizationID><cbc:ID>RA-${fecha.replaceAll('-', '')}-1</cbc:ID><cbc:ReferenceDate>${fecha}</cbc:ReferenceDate><cbc:IssueDate>${fecha}</cbc:IssueDate><sac:VoidedDocumentsLine><cbc:LineID>1</cbc:LineID><cbc:DocumentTypeCode>01</cbc:DocumentTypeCode><sac:DocumentSerialID>${serie}</sac:DocumentSerialID><sac:DocumentNumberID>${String(numero)}</sac:DocumentNumberID><sac:VoidReasonDescription>Error en la operación</sac:VoidReasonDescription></sac:VoidedDocumentsLine></VoidedDocuments>`,
  );
  return { nombreZip: `${nombre}.zip`, zip: empaquetar(nombre, xml) };
}
