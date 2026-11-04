# Guía de caos: probar la resiliencia de tu sistema

> Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera.

Chasqui puede romperse a propósito para que veas cómo reacciona tu integración cuando el servicio
de recepción está lento, caído o responde mal. Todo es **reproducible**: con la misma semilla y las
mismas claves, la secuencia de fallas es idéntica en tu máquina y en CI.

## 1. Las fallas disponibles

| Falla          | Qué hace                                                   | Lo que tu sistema debería hacer                     |
| -------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `latencia`     | Demora fija (`ms: 800`) o en rango (`ms: [800, 4000]`)     | Tiempos de espera razonables, sin bloquear la UI    |
| `timeout`      | Retiene la petición y corta sin responder                  | Reintentar con backoff, sin duplicar                |
| `error5xx`     | Responde 500/502/503/504                                   | Reintentar; no marcar el comprobante como rechazado |
| `soapFault`    | Fault SOAP `Client.0100` («el sistema no puede responder») | Igual que un 5xx                                    |
| `malformada`   | Cuerpo truncado que no se puede parsear                    | Tratarlo como error transitorio, no como rechazo    |
| `desconexion`  | Corta la conexión a mitad de la respuesta                  | Reintentar de forma idempotente                     |
| `rateLimit`    | 429 con `Retry-After` al pasar de N por segundo            | Respetar `Retry-After`                              |
| `rechazo`      | Rechazo de negocio con CDR (por defecto 2335)              | Mostrar el rechazo y **no** reintentar              |
| `duplicado`    | Excepción 1033 (ya registrado)                             | Consultar el estado en vez de reenviar              |
| `ticketEterno` | El ticket queda en 98 para siempre                         | Dejar de consultar tras un tope y alertar           |

## 2. Perfiles predefinidos

| Perfil            | Escenario                                                       |
| ----------------- | --------------------------------------------------------------- |
| `cierre-de-mes`   | Latencia de 0,8 a 4 s en todo y 10 % de timeouts                |
| `sunat-caida`     | 503 en REST y fault `Client.0100` en SOAP, al 100 %             |
| `red-inestable`   | 15 % de cortes, 10 % de respuestas truncadas, 30 % con latencia |
| `pagos-saturados` | Rate limiting a 5/s, latencia y 10 % de 503 en la billetera     |

## 3. Tres formas de activarlo

**Desde el panel** (http://localhost:7500): tarjeta «Caos», un interruptor por perfil.

**Por API** (chaos-control, puerto 7400):

```bash
# Perfil con semilla fija (reproducible)
curl -X PUT localhost:7400/api/v1/caos -H 'content-type: application/json' \
  -d '{"perfil": "cierre-de-mes", "semilla": "ci-1234"}'

# Reglas propias: 30 % de 503 solo en el REST de sunat-sim
curl -X PUT localhost:7400/api/v1/caos -H 'content-type: application/json' \
  -d '{"reglas": [{"servicio": "sunat-sim", "ruta": "/api/", "porcentaje": 30,
                   "falla": {"tipo": "error5xx", "estado": 503}}]}'

# Apagar
curl -X DELETE localhost:7400/api/v1/caos
```

**Por petición**, sin tocar el estado global, con la cabecera `X-Chasqui-Chaos`:

```bash
curl -H 'X-Chasqui-Chaos: sunat-caida' ...      # aplica un perfil
curl -H 'X-Chasqui-Chaos: falla:timeout' ...    # fuerza una falla
curl -H 'X-Chasqui-Chaos: ninguno' ...          # sin caos para esta petición
```

## 4. Tutorial: ¿tu sistema reintenta bien?

1. Levanta todo: `docker compose up`.
2. Activa `red-inestable` con una semilla: `{"perfil": "red-inestable", "semilla": "mi-prueba"}`.
3. Envía 50 facturas desde tu sistema con una `Idempotency-Key` por factura.
4. Verifica en `GET /api/v1/comprobantes` que hay exactamente 50 registradas: ni una perdida (cortes
   sin reintento) ni una duplicada (reintentos sin idempotencia, que verías como 1033).
5. Repite con la misma semilla: la secuencia de fallas es la misma, así que un error se reproduce.
6. Lleva la misma prueba a CI con la semilla fija.

## 5. Garantía de reproducibilidad

La decisión de inyectar sale de `sha256(semilla, regla, clave)`. La clave es `X-Chasqui-Clave`, o
`Idempotency-Key`, o método + ruta + n.º de orden. Detalle en el
[ADR 0007](adr/0007-caos-determinista.md).
