# Demo de 5 minutos

> Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera. Datos ficticios.

```bash
docker compose up -d && docker compose --profile observabilidad up -d
```

## 1 · El flujo feliz (1 min)

1. Abre el panel: http://localhost:7500.
2. En «Probar», pulsa **Factura válida**: aparece en vivo con código 0. Ábrela y mira el XML
   firmado y el CDR.
3. Pulsa **Rechazada**: CDR con el código 2074, el mismo que daría la regla oficial (el validador
   está portado de los XSL de SUNAT y se compara contra ellos en cada CI).

## 2 · Una compra real que cruza todos los servicios (1 min)

1. Abre la tienda: http://localhost:7600. Elige «Factura» y un RUC ficticio, p. ej. 20000000001.
2. Paga: la tienda valida el RUC en identidad-sim, cobra con un QR en pagos-sim y emite la factura
   en sunat-sim.
3. En la pestaña **Pagos** del panel ves la transferencia; en **Comprobantes**, la factura.

## 3 · Rompe cosas a propósito (2 min)

1. En la tarjeta «Caos», activa **sunat-caida**.
2. Compra de nuevo en la tienda: el pago se completa pero el comprobante queda **pendiente**. El
   dinero no se pierde y no se cobra dos veces (Idempotency-Key = id del pedido).
3. Desactiva el caos y reintenta la emisión:
   `curl -X POST localhost:7600/api/pedidos/<id>/comprobante`.
4. Activa **red-inestable** y emite varias facturas desde «Probar»: verás respuestas truncadas y
   cortes a mitad de respuesta. Con la misma semilla, la secuencia se repite igual.

## 4 · Mira por dentro (1 min)

1. Abre un comprobante en el panel y sigue **Ver traza en Jaeger**: la petición de la tienda, el
   cobro y el envío a SUNAT en una sola traza, con la latencia inyectada visible.
2. Grafana (http://localhost:3000): comprobantes por estado, latencia p95 por servicio y fallas
   inyectadas por tipo.

## Bonus · Que lo pruebe un agente de IA

Conecta el servidor MCP ([docs/mcp.md](mcp.md)) y pide:

> Activa `red-inestable` con semilla `demo`, emite 5 boletas, dime cuántas llegaron y qué fallas
> aparecieron. Luego desactiva el caos.
