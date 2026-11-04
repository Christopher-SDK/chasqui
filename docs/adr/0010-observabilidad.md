# 0010 · Observabilidad con OpenTelemetry sin loaders de ESM

- Estado: aceptada
- Fecha: 2026-11-04

## Contexto

Los servicios son ESM puro. La autoinstrumentación clásica de Node parchea módulos al cargarlos y
en ESM exige `--import`/`--experimental-loader` con import-in-the-middle: frágil y dependiente del
orden de carga.

## Decisión

1. **Entrada**: `@fastify/otel`, el plugin oficial de Fastify, registrado como plugin. Crea el
   span de cada petición, extrae el contexto W3C (`traceparent`) y nombra la ruta.
2. **Salida**: `@opentelemetry/instrumentation-undici`, basada en `diagnostics_channel`: instrumenta
   `fetch` sin parchear nada e inyecta `traceparent`. Así una compra en tienda-demo es una sola
   traza que cruza identidad-sim, pagos-sim y sunat-sim.
3. **Activación por entorno**: sin `OTEL_EXPORTER_OTLP_ENDPOINT` no se carga el SDK; la API de OTel
   queda en no-op y las pruebas no cambian.
4. **Transporte**: OTLP/HTTP → OpenTelemetry Collector → Jaeger (trazas) y endpoint de Prometheus
   (métricas). Grafana con datasources y dashboard provisionados. Todo bajo el perfil de compose
   `observabilidad`, para no cargar la máquina cuando no se usa.
5. **Métricas propias** con nombres en español: `chasqui_http_duracion` (histograma por servicio,
   método, ruta y estado), `chasqui_comprobantes`, `chasqui_pagos_eventos` y
   `chasqui_fallas_inyectadas`.
6. **Enlace a la traza**: cada respuesta lleva `x-chasqui-traza`; los eventos SSE llevan `traza`.
   El panel enlaza a Jaeger desde el detalle del comprobante y desde cada acción de pagos.

## Consecuencias

- No hay spans de base de datos (Kysely sobre node:sqlite no tiene instrumentación); el span del
  handler cubre ese tiempo.
- Un cliente que escribe `traceparent` a mano y usa `fetch` instrumentado verá su cabecera
  reemplazada por la del span cliente: es el comportamiento correcto de propagación.
