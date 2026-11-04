# 0006 · Reglas de servidor y semántica de respuestas en sunat-sim

- Estado: aceptada · 2026-11-04

## Contexto

Las reglas XSL oficiales validan el contenido del XML. Hay otras que SUNAT aplica en el servidor y
no publica como XSL: duplicados, firma, plazos y bajas. Su orden exacto no está documentado.

## Decisión

1. **Semántica de códigos** (Greenter, `BaseSunat::isExceptionCode`, y el manual de SUNAT):
   0100-1999 son excepciones (fault SOAP o HTTP 400/422, sin CDR); 2000-3999 son rechazos con
   CDR; 4000 en adelante son observaciones dentro de un CDR aceptado.
2. **Orden de sendBill**: ZIP (0151-0161) → XML legible (0306) → duplicado (1033, o 1032 si el
   previo fue rechazado o anulado) → firma (1059, 2335) → reglas XSL portadas → plazos
   (2329 si la fecha supera en más de 2 días la de envío, 2108 si pasaron más de 3 días).
3. **Tickets** (sendSummary, getStatus y la API de GRE): el veredicto se calcula al recibir y se
   entrega en la primera consulta posterior a `DEMORA_TICKET_MS` (2 s por defecto). Sin
   temporizadores: el resultado depende del reloj inyectado, así que es determinista en pruebas.
4. **Bajas**: 2105 (no registrado), 2323 (ya dado de baja), 2958 (fuera de plazo, 7 días por
   defecto). Si todo pasa, los comprobantes quedan anulados.
5. Los plazos son **configurables** (`Config` en `recepcion.ts`), porque varían por norma.

## Consecuencias

- El orden del punto 2 es una decisión de Chasqui; si un cliente depende de otro orden, se ajusta
  aquí. Los plazos y el código de un `hashZip` inválido están marcados `TODO verificar`.
