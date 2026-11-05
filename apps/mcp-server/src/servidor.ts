import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  boleta,
  Chasqui,
  ErrorChasqui,
  factura,
  type ConstructorComprobante,
  type OpcionesCliente,
} from '@chasqui/sdk';
import { validarXml, type Ajuste, type Emisor } from '@chasqui/ubl-core';
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

/** Zod tipa los opcionales como `T | undefined` y el modelo (exactOptionalPropertyTypes) no los
 * admite: los argumentos ya validados son JSON, así que el ida y vuelta solo quita esas claves. */
type Extra = Parameters<ConstructorComprobante['item']>[3];
const sinIndefinidos = (x: unknown): unknown => JSON.parse(JSON.stringify(x));

const Fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Tasa = z
  .string()
  .regex(/^0(\.\d{1,4})?$|^1$/)
  .describe('Tanto por uno, p. ej. "0.25"');
const AjusteZ = z
  .object({ monto: Monto.optional(), factor: Tasa.optional() })
  .refine((x) => (x.monto === undefined) !== (x.factor === undefined), 'monto o factor, no ambos');
const AFECTACIONES = [
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '20',
  '21',
  '22',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '40',
] as const;

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
                .enum(AFECTACIONES)
                .default('10')
                .describe(
                  'Catálogo 07: 10 gravado, 17 IVAP, 20 exonerado, 30 inafecto, 40 exportación; 11-16, 21, 22 y 31-37 gratuitas (valorUnitario = valor referencial)',
                ),
              descuento: AjusteZ.optional().describe(
                'Descuento del ítem que reduce la base (código 00)',
              ),
              isc: z
                .object({
                  sistema: z
                    .enum(['01', '02', '03'])
                    .describe('01 al valor, 02 específico, 03 al precio de venta al público'),
                  tasa: Tasa.optional().describe('Sistemas 01 y 03'),
                  montoFijo: Monto.optional().describe('Sistema 02, por unidad'),
                  precioSugerido: Monto.optional().describe('Sistema 03, por unidad con impuestos'),
                })
                .optional()
                .describe('Impuesto Selectivo al Consumo'),
              icbper: z
                .boolean()
                .optional()
                .describe(
                  'Bolsas de plástico: la cantidad es el número de bolsas (tarifa vigente)',
                ),
            }),
          )
          .min(1),
        tasaIgv: z.enum(['18', '10']).optional().describe('10 = régimen MYPE de la Ley 31556'),
        descuentoGlobal: AjusteZ.optional().describe('Reduce la base imponible (código 02)'),
        descuentoNoAfecto: Monto.optional().describe('No reduce la base imponible (código 03)'),
        cargo: Monto.optional().describe('Otros cargos fuera de la base (código 50)'),
        cuotas: z
          .array(z.object({ monto: Monto, fechaPago: Fecha }))
          .optional()
          .describe(
            'Solo factura: venta al crédito; con detracción, las cuotas suman el total menos la detracción',
          ),
        detraccion: z
          .object({
            codigoBien: z
              .string()
              .regex(/^\d{3}$/)
              .describe('Catálogo 54, p. ej. 020'),
            cuentaBancoNacion: z.string().min(1),
          })
          .optional()
          .describe('Solo factura: detracción (operación 1001)'),
        percepcion: z
          .enum(['51', '52', '53'])
          .optional()
          .describe('Solo factura: régimen de percepción del catálogo 53 (operación 2001)'),
        anticipos: z
          .array(
            z.object({
              tipoDocumento: z.enum(['02', '03']).describe('02 factura, 03 boleta de anticipo'),
              serieNumero: z.string().regex(/^[FB][A-Z0-9]{3}-\d{1,8}$/),
              monto: Monto.describe('Importe pagado con IGV'),
            }),
          )
          .optional()
          .describe('Solo factura: anticipos deducidos'),
        fecha: Fecha.optional().describe('AAAA-MM-DD; por defecto, hoy en Lima'),
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
        for (const { descripcion, cantidad, valorUnitario, icbper, ...extra } of a.items)
          b.item(
            descripcion,
            cantidad,
            valorUnitario,
            sinIndefinidos({ ...extra, ...(icbper ? { icbper: {} } : {}) }) as Extra,
          );
        if (a.tasaIgv) b.tasaIgv(a.tasaIgv);
        if (a.descuentoGlobal) b.descuento(sinIndefinidos(a.descuentoGlobal) as Ajuste);
        if (a.descuentoNoAfecto) b.descuentoNoAfecto(a.descuentoNoAfecto);
        if (a.cargo) b.cargo(a.cargo);
        if (a.cuotas?.length) b.formaPago(...a.cuotas);
        if (a.detraccion) b.detraccion(a.detraccion);
        if (a.percepcion) b.percepcion(a.percepcion);
        for (const anticipo of a.anticipos ?? []) b.anticipo(anticipo);
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
