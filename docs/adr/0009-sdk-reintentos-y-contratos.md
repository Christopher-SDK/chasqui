# 0009 · SDK: reintentos idempotentes y contratos Pact versionados

- Estado: aceptada
- Fecha: 2026-11-04

## Contexto

El SDK es la cara de Chasqui para quien integra. Bajo caos, un cliente ingenuo duplica cobros o
se rinde ante el primer 503. Además, el SDK y los simuladores deben evolucionar sin romperse.

## Decisión

1. **Reintentos solo donde es seguro**: lecturas y escrituras con Idempotency-Key. La clave se
   genera una vez por operación y se reutiliza en cada reintento (backoff exponencial, 5xx, 429,
   error de red o respuesta truncada). Los errores 4xx nunca se reintentan.
2. **Un rechazo de SUNAT no es una excepción**: `sunat.enviar` devuelve `estado: 'rechazado'` con
   su código; solo las excepciones 0100-1999 lanzan `ErrorChasqui`.
3. **Contratos Pact sin broker**: el SDK (consumidor) escribe `pacts/chasqui-sdk-<proveedor>.json`,
   que se versionan; cada simulador los verifica en sus pruebas. Un cambio que rompe el contrato
   falla en la CI del proveedor en el mismo PR.
4. **Caos y reintentos**: la clave de decisión del caos incluye el número de intento (enmienda a
   la 0007); si no, un reintento con la misma Idempotency-Key fallaría siempre.

## Consecuencias

- La prueba «con 60 % de 503, una sola transferencia» garantiza la combinación de 1 y 4.
- `@chasqui/ecosistema` levanta los cuatro servicios en proceso para pruebas del SDK, de la
  tienda y de los contratos.
