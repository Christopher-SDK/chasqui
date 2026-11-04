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
- [ ] CI con oráculo + mutation en verde

## Siguiente: Fase 2 — sunat-sim (SOAP + REST, CDR, tickets, GRE)
