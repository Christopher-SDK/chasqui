# Observabilidad

```bash
docker compose --profile observabilidad up -d
```

| Herramienta | URL                    | Para qué                                                     |
| ----------- | ---------------------- | ------------------------------------------------------------ |
| Grafana     | http://localhost:3000  | Dashboard «Chasqui · ecosistema» (acceso anónimo de lectura) |
| Jaeger      | http://localhost:16686 | Trazas: una compra en la tienda cruza los cuatro servicios   |
| Prometheus  | http://localhost:9090  | Métricas crudas y consultas PromQL                           |

## Métricas

| Métrica (Prometheus)              | Etiquetas                              |
| --------------------------------- | -------------------------------------- |
| `chasqui_http_duracion_seconds_*` | `servicio`, `metodo`, `ruta`, `estado` |
| `chasqui_comprobantes_total`      | `estado`, `canal`                      |
| `chasqui_pagos_eventos_total`     | `evento`                               |
| `chasqui_fallas_inyectadas_total` | `servicio`, `falla`                    |

## Ver una traza

1. Activa un perfil de caos en el panel (por ejemplo `red-inestable`).
2. Compra algo en la tienda demo (http://localhost:7600).
3. En el panel, abre el comprobante y sigue «Ver traza en Jaeger»: verás la petición a
   identidad-sim, el cobro en pagos-sim, el envío a sunat-sim y la latencia o el error inyectado.

Fuera de Docker, define `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` antes de arrancar un
servicio. Sin esa variable, la telemetría queda apagada (decisión 0010).
