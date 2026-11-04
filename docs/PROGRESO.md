# Progreso de Chasqui

## Fase 0 — base del monorepo ✅

- pnpm workspaces · TypeScript 6 strict · ESLint (strictTypeChecked) · Prettier · Vitest
- Husky + lint-staged + commitlint · Dockerfile multi-stage único + docker compose · CI verde

## Fase 1 — catalogos + ubl-core ✅

- [x] Reglas oficiales de SUNAT (paquete SFS/OSE) descargadas con SHA-256 verificado
- [x] Oráculo: el XSL oficial corre en pruebas (Python/lxml) con controles negativos
- [x] `catalogos`: 12 catálogos del Anexo 8 + 1 998 códigos de error, generados del oficial
- [x] `ubl-core`: decimal exacto, cálculo, XML UBL 2.1 (01/03/07/08), firma XML-DSig, ZIP
- [x] Validador portado: 84 códigos en el orden oficial, por tipo de comprobante
- [x] Prueba diferencial: 478 dirigidas + 512 aleatorias + 200 válidas → idénticas al XSL oficial
- [x] Cobertura: 97.7 % sentencias · 90.6 % ramas (umbral 90 % en la CI)
- [x] Mutation testing (Stryker): 84.34 % (umbral 80 %)
- [x] CI en verde: calidad + conformidad, docker compose y mutation (incremental)

## Fase 2 — sunat-sim + panel adelantado ✅

- [x] SOAP compatible con billService (sendBill, sendSummary, getStatus) y REST con OpenAPI 3.1
- [x] CDR firmado por el simulador; duplicados, firma, plazos; consulta de estado; historial
- [x] Resumen diario y bajas con reglas oficiales (118/118 vs oráculo) y tickets asíncronos
- [x] Guía de remisión por REST con OAuth simulado (62/62 vs oráculo)
- [x] Panel en vivo en :7500 (SSE, detalle de XML y CDR, escenarios de prueba, claro/oscuro)
- [x] 94 pruebas (31 de integración por HTTP real) · mutation 82.74 %

## Fase 3 — chaos-engine + chaos-control ✅

- [x] 10 fallas (latencia, timeout, 5xx, SOAP fault, malformada, desconexión, rate limit, rechazo, duplicado, ticket eterno)
- [x] 4 perfiles; semilla reproducible por petición (ADR 0007); cabecera X-Chasqui-Chaos
- [x] chaos-control (:7400) con REST + SSE; sunat-sim suscrito; interruptores en el panel
- [x] Prueba de punta a punta: activar sunat-caida → 503/fault 0100; misma semilla, misma secuencia

## Fase 4 — pagos-sim + identidad-sim ✅

- [x] pagos-sim (:7200): transferencias P2P por celular, límites, idempotencia garantizada por la base (también con 10 peticiones concurrentes), estados y reversión
- [x] Webhooks firmados (HMAC-SHA256 con marca de tiempo) con reintentos y backoff exponencial
- [x] Cobros QR con estructura EMVCo y CRC16; imagen PNG
- [x] identidad-sim (:7300): DNI y RUC ficticios deterministas, dígito verificador módulo 11, estados de contribuyente
- [x] test-kit (generadores) y @chasqui/db (persistencia compartida)

## Fase 5 — sdk + test-kit + tienda-demo + Pact ✅

- [x] @chasqui/sdk: builders fluidos (factura, boleta, notas), clientes tipados, reintentos idempotentes, `chaos.con`, `verificarWebhook`
- [x] tienda-demo (:7600): checkout con validación de RUC, cobro QR y comprobante; pago a salvo si SUNAT cae
- [x] Contratos Pact SDK → sunat-sim, pagos-sim e identidad-sim (pacts/ versionados, verificados por cada proveedor)
- [x] @chasqui/ecosistema: los cuatro servicios en un proceso para pruebas
- [x] Corrección del caos: el número de intento entra en la clave (ADR 0007, enmienda)

## Fase 6 — panel completo + E2E ✅

- [x] Panel con pestañas Comprobantes, Pagos (cuentas, transferencias en vivo, reversión, cobro QR) e Identidad (DNI/RUC); aviso legal en todas
- [x] E2E con Playwright: Page Objects, escritorio y móvil, trazas y video (siempre en CI, al fallar en local)
- [x] Modo todo en uno (`pnpm todo-en-uno`): los cuatro servicios en un proceso, sin Docker
- [x] Revisión visual claro/oscuro/móvil: corregidos los valores por defecto del formulario (con regresión E2E) y el desborde de la tabla en móvil

## Fase 7 — observabilidad ✅

- [x] @chasqui/telemetria: @fastify/otel (entrada) + undici (salida), W3C traceparent de punta a punta, sin loaders ESM
- [x] Métricas: latencia HTTP, comprobantes por estado, eventos de pagos, fallas inyectadas
- [x] Collector → Jaeger + Prometheus; Grafana con datasources y dashboard provisionados (perfil `observabilidad`)
- [x] Panel: enlace «Ver traza en Jaeger» en comprobantes y acciones de pagos

## Fase 8 — mcp-server ✅

- [x] 11 herramientas MCP sobre el SDK (comprobantes, validación de XML, pagos, identidad, caos) con anotaciones de solo lectura
- [x] Errores de la API como resultados `isError` con código; validación de argumentos por esquema
- [x] Pruebas con cliente MCP en memoria contra el ecosistema + prueba de humo por stdio

## Fase 9 — carga, CI completa, documentación y pulido ✅

- [x] k6: tres escenarios con tasa constante, umbrales por escenario (incluido un mínimo de peticiones: k6 aprueba umbrales sin datos), reporte HTML y resumen JSON
- [x] Job nocturno: carga con k6 y mutation testing completo; CI con calidad, mutation incremental, E2E e imágenes
- [x] README en español e inglés, badges, demo de 5 minutos, colección Bruno
- [x] Imágenes Docker sin red después del install (el deploy legacy se colgaba con redes inestables)
- [x] Plazo de envío de facturas confirmado con la RS 000003-2023/SUNAT (TODO cerrado); boletas y baja siguen pendientes de fuente oficial
- [x] Guías: prueba diferencial de 62 a 117 casos; el oráculo reveló 8 reglas sin portar (2554, 2555, 4375, 3616-3619, 2558), ya portadas
- [x] Mutation de reglas-guia de 72 % a 88 % (global 84 % en la corrida completa de CI)
- [x] Panel en Docker: nginx vuelve a resolver los servicios (antes daba 502 al recrearlos)
- [x] Verificado: suite 189/189, CI verde (calidad, E2E, mutation, imágenes), k6 local p95 sunat 20 ms / pagos 6 ms / identidad 7 ms y k6 nocturno en GitHub aprobado
