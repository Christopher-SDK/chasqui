import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { boleta, Chasqui, ErrorChasqui, factura, type OpcionesCliente } from '@chasqui/sdk';
import { validarXml, type Emisor } from '@chasqui/ubl-core';
import { z } from 'zod';

export const AVISO =
  'Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera. Todos los datos son ficticios.';

/** Emisor ficticio por defecto (RUC con dígito verificador válido, sin contribuyente real). */
const EMISOR_DEMO: Emisor = {
  ruc: '20000000001',
  razonSocial: 'COMERCIAL CHASQUI DEMO S.A.C.',
  direccion: {
    ubigeo: '150101',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LIMA',
    linea: 'AV. FICTICIA 123',
  },
};

type Resultado = { content: { type: 'text'; text: string }[]; isError?: boolean };

/** Respuesta JSON legible para el agente; los errores de la API vuelven como isError, no como excepción. */
async function responder(fn: () => Promise<unknown>): Promise<Resultado> {
  try {
    return { content: [{ type: 'text', text: JSON.stringify(await fn(), null, 2) }] };
  } catch (e) {
    const detalle =
      e instanceof ErrorChasqui
        ? { status: e.status, codigo: e.codigo, mensaje: e.message }
        : { mensaje: e instanceof Error ? e.message : String(e) };
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: detalle }, null, 2) }],
      isError: true,
    };
  }
}

const Celular = z
  .string()
  .regex(/^9\d{8}$/)
  .describe('Celular de 9 dígitos que empieza con 9 (cuentas de prueba: 900000001 a 900000010)');
const Monto = z
  .string()
  .regex(/^\d{1,7}(\.\d{1,2})?$/)
  .describe('Soles con hasta 2 decimales, p. ej. "12.50"');

export function construirServidorMcp(opciones: OpcionesCliente = {}): McpServer {
  const chasqui = new Chasqui(opciones);
  const mcp = new McpServer(
    { name: 'chasqui', version: '0.1.0' },
    {
      instructions: `${AVISO}\n\nHerramientas para probar integraciones contra los simuladores de Chasqui: comprobantes electrónicos (sunat-sim), billetera interoperable (pagos-sim), DNI/RUC (identidad-sim) y fallas inyectables (chaos-control). Úsalas para reproducir escenarios, no para operar con datos reales.`,
    },
  );
  const lectura = { readOnlyHint: true, openWorldHint: false } as const;
  const escritura = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;

  mcp.registerTool(
    'emitir_comprobante',
    {
      title: 'Emitir comprobante',
      description:
        'Calcula, firma, empaqueta y envía una factura o boleta a sunat-sim. Devuelve estado (aceptado, observado o rechazado), código y observaciones. Valores unitarios SIN IGV.',
      inputSchema: {
        tipo: z.enum(['factura', 'boleta']),
        serie: z
          .string()
          .regex(/^[FB][A-Z0-9]{3}$/)
          .describe('F001 para facturas, B001 para boletas'),
        numero: z.number().int().min(1).max(99_999_999),
        cliente: z.object({
          documento: z
            .string()
            .describe('RUC (11 dígitos) para factura; DNI (8) u otro para boleta'),
          nombre: z.string().min(1),
        }),
        items: z
          .array(
            z.object({
              descripcion: z.string().min(1),
              cantidad: z.number().positive(),
              valorUnitario: Monto,
              afectacion: z
                .enum(['10', '20', '30'])
                .default('10')
                .describe('10 gravado, 20 exonerado, 30 inafecto (catálogo 07)'),
            }),
          )
          .min(1),
        fecha: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe('AAAA-MM-DD; por defecto, hoy en Lima'),
      },
      annotations: escritura,
    },
    (a) =>
      responder(async () => {
        const b = (a.tipo === 'factura' ? factura() : boleta())
          .serie(a.serie, a.numero)
          .emisor(EMISOR_DEMO)
          .cliente(a.cliente.documento, a.cliente.nombre);
        if (a.fecha) b.fecha(a.fecha);
        for (const i of a.items)
          b.item(i.descripcion, i.cantidad, i.valorUnitario, { afectacion: i.afectacion });
        // El CDR (ZIP en base64) no le sirve al agente y llenaría su contexto.
        return { ...(await chasqui.sunat.enviar(b.construir())), cdr: undefined };
      }),
  );

  mcp.registerTool(
    'estado_comprobante',
    {
      title: 'Estado de un comprobante',
      description:
        'Consulta el estado de un comprobante ya enviado (aceptado, observado, rechazado, anulado o no informado).',
      inputSchema: {
        ruc: z
          .string()
          .regex(/^\d{11}$/)
          .default(EMISOR_DEMO.ruc),
        tipo: z
          .enum(['01', '03', '07', '08'])
          .describe('01 factura, 03 boleta, 07 nota de crédito, 08 nota de débito'),
        serie: z.string(),
        numero: z.number().int().min(1),
      },
      annotations: lectura,
    },
    (a) => responder(() => chasqui.sunat.estado(a.ruc, a.tipo, a.serie, a.numero)),
  );

  mcp.registerTool(
    'validar_xml',
    {
      title: 'Validar XML UBL',
      description:
        'Valida localmente un XML UBL 2.1 con las reglas portadas de los XSL oficiales, sin enviarlo. Útil para depurar el XML que genera tu sistema.',
      inputSchema: {
        xml: z.string().min(1),
        nombreArchivo: z
          .string()
          .describe('RUC-TIPO-SERIE-NUMERO.xml, p. ej. 20000000001-01-F001-1.xml'),
      },
      annotations: lectura,
    },
    (a) => responder(() => Promise.resolve(validarXml(a.xml, a.nombreArchivo))),
  );

  mcp.registerTool(
    'consultar_ruc',
    {
      title: 'Consultar RUC',
      description:
        'Razón social, estado (ACTIVO, BAJA…) y condición (HABIDO, NO HABIDO) de un RUC del dataset ficticio. Valida el dígito verificador.',
      inputSchema: { ruc: z.string().regex(/^\d{11}$/) },
      annotations: lectura,
    },
    (a) => responder(() => chasqui.identidad.ruc(a.ruc)),
  );

  mcp.registerTool(
    'consultar_dni',
    {
      title: 'Consultar DNI',
      description: 'Nombres y apellidos ficticios para un DNI de 8 dígitos.',
      inputSchema: { dni: z.string().regex(/^\d{8}$/) },
      annotations: lectura,
    },
    (a) => responder(() => chasqui.identidad.dni(a.dni)),
  );

  mcp.registerTool(
    'transferir',
    {
      title: 'Transferir',
      description:
        'Transferencia entre celulares de la billetera simulada. Idempotente: repetir con la misma clave no cobra dos veces. Entre billeteras distintas queda «pendiente» unos segundos.',
      inputSchema: {
        origen: Celular,
        destino: Celular,
        monto: Monto,
        descripcion: z.string().max(140).optional(),
        claveIdempotencia: z
          .string()
          .min(8)
          .max(120)
          .optional()
          .describe('Si se omite, se genera una'),
      },
      annotations: escritura,
    },
    (a) =>
      responder(() =>
        chasqui.pagos.transferir(
          {
            origen: a.origen,
            destino: a.destino,
            monto: a.monto,
            ...(a.descripcion ? { descripcion: a.descripcion } : {}),
          },
          a.claveIdempotencia,
        ),
      ),
  );

  mcp.registerTool(
    'consultar_transferencia',
    {
      title: 'Consultar transferencia',
      description:
        'Estado actual de una transferencia (pendiente, completada, rechazada o revertida).',
      inputSchema: { id: z.string() },
      annotations: lectura,
    },
    (a) => responder(() => chasqui.pagos.transferencia(a.id)),
  );

  mcp.registerTool(
    'saldo',
    {
      title: 'Saldo',
      description: 'Saldo de una cuenta de prueba.',
      inputSchema: { celular: Celular },
      annotations: lectura,
    },
    (a) =>
      responder(async () => ({
        celular: a.celular,
        saldo: await chasqui.pagos.saldo(a.celular),
        moneda: 'PEN',
      })),
  );

  mcp.registerTool(
    'caos_estado',
    {
      title: 'Estado del caos',
      description: 'Perfil o reglas de fallas activas, semilla y lista de perfiles disponibles.',
      annotations: lectura,
    },
    () =>
      responder(async () => ({
        actual: await chasqui.chaos.estado(),
        perfiles: ['cierre-de-mes', 'sunat-caida', 'red-inestable', 'pagos-saturados'],
      })),
  );

  mcp.registerTool(
    'caos_activar',
    {
      title: 'Activar caos',
      description:
        'Activa un perfil de fallas en todos los simuladores. Con la misma semilla, la secuencia de fallas es reproducible. Recuerda desactivarlo al terminar.',
      inputSchema: {
        perfil: z.enum(['cierre-de-mes', 'sunat-caida', 'red-inestable', 'pagos-saturados']),
        semilla: z.string().min(1).optional(),
      },
      annotations: escritura,
    },
    (a) => responder(() => chasqui.chaos.activar(a.perfil, a.semilla)),
  );

  mcp.registerTool(
    'caos_desactivar',
    {
      title: 'Desactivar caos',
      description: 'Apaga todas las fallas inyectadas.',
      annotations: escritura,
    },
    () => responder(() => chasqui.chaos.desactivar()),
  );

  return mcp;
}
