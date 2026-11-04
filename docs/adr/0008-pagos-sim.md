# 0008 · pagos-sim: dinero en céntimos, idempotencia en la base y webhooks con cola persistente

- Estado: aceptada
- Fecha: 2026-11-04

## Contexto

pagos-sim debe ser un buen banco de pruebas para integraciones de pago: reintentos del cliente,
peticiones concurrentes duplicadas, pagos que tardan en confirmarse y webhooks que fallan.

## Decisión

1. **Montos en céntimos enteros** (`integer`). La API acepta soles con hasta 2 decimales y
   responde texto (`"12.50"`). Sin punto flotante en los saldos.
2. **Idempotencia garantizada por la base**: `clave_idempotencia` es `UNIQUE`. Si dos peticiones
   con la misma clave compiten, la segunda recibe la violación de unicidad y responde con la
   transferencia ganadora. Misma clave y otro cuerpo (hash SHA-256): 422.
3. **Reserva al crear**: el monto sale del origen al registrar la transferencia, incluso si queda
   pendiente; así no se gasta dos veces. Entre billeteras distintas queda pendiente
   `DEMORA_INTERBILLETERA_MS` (1,5 s) y la completa un trabajador.
4. **Webhooks con cola en la base** (`entregas`): sobreviven a un reinicio. Backoff 1, 2, 4, 8 y
   16 s; al sexto fallo, «fallida». Firma `t=<unix>,v1=<HMAC-SHA256>` contra replay.
5. **Reloj inyectable**: el trabajador y el caos usan `ahora()`, por eso las pruebas avanzan el
   tiempo sin esperar.

## Consecuencias

- La idempotencia funciona igual en SQLite y en Postgres (código 23505).
- ponytail: el trabajador consulta la base cada 250 ms; con mucho volumen convendría
  `LISTEN/NOTIFY` en Postgres.
