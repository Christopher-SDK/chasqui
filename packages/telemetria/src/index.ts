import { FastifyOtelInstrumentation } from '@fastify/otel';
import { metrics, trace, type Attributes } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import type { FastifyInstance } from 'fastify';

/**
 * Telemetría de Chasqui. Solo se activa si existe OTEL_EXPORTER_OTLP_ENDPOINT (p. ej.
 * http://otel-collector:4318): sin él, los servicios no cargan el SDK y las llamadas a la API de
 * OTel son no-ops. Trazas: @fastify/otel (entrada, con propagación W3C) + undici (fetch de salida).
 * No requiere loaders de ESM: ninguna de las dos parchea módulos. Ver docs/adr/0010.
 */

let fastifyOtel: FastifyOtelInstrumentation | undefined;
let sdk: NodeSDK | undefined;

export function iniciarTelemetria(servicio: string): void {
  if (sdk || !process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;
  fastifyOtel = new FastifyOtelInstrumentation({
    // Salud, SSE y docs no aportan a las trazas y las llenarían de ruido.
    ignorePaths: ({ url }) =>
      url === '/salud' ||
      url.includes('eventos') ||
      url.includes('flujo') ||
      url.startsWith('/docs'),
  });
  sdk = new NodeSDK({
    serviceName: servicio,
    traceExporter: new OTLPTraceExporter(),
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 5000,
      }),
    ],
    instrumentations: [fastifyOtel, new UndiciInstrumentation()],
  });
  sdk.start();
  for (const s of ['SIGTERM', 'SIGINT'] as const)
    process.once(s, () => {
      void sdk?.shutdown().finally(() => process.exit(0));
    });
}

const medidor = () => metrics.getMeter('chasqui');

/**
 * Registra el plugin de trazas y una métrica de latencia HTTP por ruta. Debe llamarse antes de
 * declarar las rutas.
 */
export async function instrumentar(app: FastifyInstance, servicio: string): Promise<void> {
  if (fastifyOtel) await app.register(fastifyOtel.plugin());
  const duracion = medidor().createHistogram('chasqui_http_duracion', {
    description: 'Duración de las peticiones HTTP',
    unit: 's',
    advice: { explicitBucketBoundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10] },
  });
  app.addHook('onResponse', async (req, reply) => {
    const ruta = req.routeOptions.url;
    if (!ruta || ruta === '/salud' || ruta.startsWith('/docs')) return;
    duracion.record(reply.elapsedTime / 1000, {
      servicio,
      metodo: req.method,
      ruta,
      estado: String(reply.statusCode),
    });
  });
  // El id de traza en la respuesta: el panel y los clientes enlazan a Jaeger con él.
  app.addHook('onSend', async (req, reply) => {
    // El span de la petición (no el activo: dentro de un hook el activo es el span del hook).
    const id = fastifyOtel ? req.opentelemetry().span?.spanContext().traceId : undefined;
    if (id && !/^0+$/.test(id)) reply.header('x-chasqui-traza', id);
  });
}

/** Contador de negocio (comprobantes por estado, transferencias, fallas inyectadas). */
export function contador(nombre: string, descripcion: string) {
  const c = medidor().createCounter(nombre, { description: descripcion });
  return (atributos: Attributes) => {
    c.add(1, atributos);
  };
}

/** Id de la traza activa, para adjuntarlo a eventos del panel (o undefined sin telemetría). */
export function trazaActual(): string | undefined {
  const id = trace.getActiveSpan()?.spanContext().traceId;
  return id && !/^0+$/.test(id) ? id : undefined;
}

/** Exporta lo pendiente y apaga el SDK (pruebas y cierre ordenado). */
export async function detenerTelemetria(): Promise<void> {
  await sdk?.shutdown();
  sdk = undefined;
  fastifyOtel = undefined;
}
