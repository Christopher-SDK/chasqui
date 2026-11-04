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

## Fase 10 — reglas oficiales completas y operaciones especiales (EN CURSO, pausada 2026-11-04)

Hecho (rama `fase-10`, sin fusionar a `main`):

- [x] Intérprete XSLT 1.0 en TypeScript (`packages/ubl-core/src/validador/xslt.ts`) que ejecuta las hojas oficiales completas: factura, boleta, NC, ND, GRE remitente, resumen y baja. Reemplaza al port manual (`reglas*.ts` y `motor.ts`, borrados)
- [x] Compilador XSL → JSON (`packages/ubl-core/scripts/compilar-reglas.mjs`, `pnpm --filter @chasqui/ubl-core reglas`); salida versionada en `src/validador/oficial/`; la CI comprueba que regenerarla no cambia nada
- [x] Parche de la librería `xpath` (`patches/xpath@0.0.36.patch`): number() de un conjunto vacío daba 0 en vez de NaN
- [x] Orden de documento precalculado: de ~900 ms a ~16 ms por comprobante
- [x] Modelo, cálculo y XML de: gratuitas (11-16, 21, 22, 31-37), ISC (sistemas 01, 02 y 03), ICBPER, IVAP, exportación, descuento por ítem (00), descuento global (02 y 03), cargos (50), detracción, percepción, anticipos, crédito con cuotas e IGV del 10 % (Ley 31556)
- [x] Catálogos 53, 54 y 59 agregados a `@chasqui/catalogos`
- [x] 18 operaciones especiales (`test/operaciones.ts`) pasan las reglas oficiales; ~2 180 casos de la prueba diferencial sin una sola diferencia con el oráculo
- [x] Pruebas unitarias del intérprete (`test/xslt.test.ts`); ubl-core 85/85, lint y tipos limpios

Reanudada el 2026-11-04 (tarde):

- [x] `pnpm test` completo: 225/225 sin cambios (los demás paquetes ya usaban bien el modelo); lint y tipos limpios
- [x] SDK: `.bolsas`, `.tasaIgv`, `.descuento`, `.descuentoNoAfecto`, `.cargo`, `.formaPago`, `.detraccion`, `.percepcion`, `.anticipo` e ítems con `descuento`/`isc`/`icbper`; las de factura fallan pronto en boletas
- [x] MCP: `emitir_comprobante` acepta todas las operaciones especiales (catálogo 07 completo)
- [x] Panel «Probar»: «Crédito con detracción» (código 0 + 3249) e «ISC, bolsas y gratuita»; E2E escritorio y móvil
- [x] Hallazgo documentado: la regla 3249 de la hoja oficial observa TODA factura al crédito (ruta relativa que nunca encuentra nodos); se reproduce a propósito
- [x] Docs: ADR 0011 (reemplaza a la 0004), `fuentes.md` §6 y §15, README ES/EN, `sdk.md`, `mcp.md`, `demo.md`
- [x] Mutation completo con `xml.ts`: 88.76 % (antes 84 %); incremental regenerado
- [x] CI: timeout de conformidad a 300 s (con cobertura tarda ~125 s); pruebas de guardas de `calcular` (ramas de ubl-core 95.8 %); imágenes Docker construidas en CI

Pendiente, en orden:

1. k6 de nuevo (el validador pasó de ~2 a ~16 ms)
2. Fusionar a `main`, CI en verde y nocturno
3. Auditoría «probador minucioso» antes de publicar en LinkedIn (clonar limpio, seguir el README, probar XML reales); preguntar al usuario antes de hacer público el repo
