# 0007 · Caos determinista por petición

- Estado: aceptada · 2026-11-04

## Contexto

Un motor de caos que sortea con `Math.random()` produce pruebas intermitentes: imposible de
reproducir en CI. Un PRNG con semilla, consumido en secuencia, tampoco basta: con peticiones
concurrentes el orden de llegada cambia entre corridas y con él cada sorteo.

## Decisión

- Cada decisión es `sha256(semilla, índice de regla, clave)` normalizado a [0, 1). La **clave** es,
  en este orden: la cabecera `X-Chasqui-Clave`, la `Idempotency-Key`, o `método + ruta + n.º de
orden` de esa ruta. Con clave explícita la decisión no depende del orden de llegada.
- La latencia en rango también se deriva de la clave (`milisegundos()`), no del reloj.
- El estado (perfil o reglas + semilla) vive en **chaos-control** y llega a cada simulador por SSE
  (`/api/v1/caos/flujo`). Si chaos-control no está, el simulador funciona sin caos y reintenta.
- La cabecera `X-Chasqui-Chaos` aplica un perfil (o `falla:<tipo>`, o `ninguno`) solo a esa
  petición: útil para pruebas puntuales sin tocar el estado global.
- Las fallas de transporte las ejecuta el motor (hooks de Fastify); las de negocio (rechazo,
  duplicado, ticket eterno) las aplica el simulador leyendo `req.caos`.

## Consecuencias

- Una prueba de resiliencia en CI fija la semilla y manda claves explícitas: la secuencia de fallas
  es idéntica en cada corrida (prueba «misma semilla, misma secuencia» en chaos-control).
- El rate limiting depende del reloj (ventana de 1 s); en pruebas se inyecta el reloj.

## Enmienda (2026-11-04)

La clave incluye el número de intento: `<X-Chasqui-Clave o Idempotency-Key>#<n>`. Antes, todos los
reintentos con la misma Idempotency-Key recibían la misma decisión, y una falla transitoria se
volvía permanente. Las pruebas del SDK lo detectaron. Sigue siendo reproducible: el intento n de una
clave decide siempre igual.
