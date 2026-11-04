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

## Siguiente: Fase 3 — chaos-engine + chaos-control
