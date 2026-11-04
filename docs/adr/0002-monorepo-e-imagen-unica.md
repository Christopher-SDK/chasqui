# 0002 · Monorepo pnpm, TypeScript 6 y una sola imagen Docker

- Estado: aceptada · 2026-11-03

## Contexto

Chasqui tiene 6 apps y 5 paquetes que comparten tooling. Hay que poder levantarlo todo con `docker compose up`.

## Decisión

- **pnpm 10.34** fijado en `packageManager`. pnpm 12 no arranca con el Corepack de Node 23 (falla con `MODULE_NOT_FOUND` en `bin/pnpm.cjs`).
- **TypeScript 6.0**. TypeScript 7 (el compilador nativo) todavía no es compatible con `typescript-eslint` (peer `<6.1`).
- **Node 22 LTS** en `.nvmrc`, CI y Docker; `engines >=22.12`.
- Dos tsconfig por paquete: `tsconfig.json` (typecheck de `src` + `test`, sin emitir) y `tsconfig.build.json` (emite `src` a `dist`). La condición de exportación `source` hace que Vitest y `tsc` resuelvan los paquetes del workspace desde el código fuente, sin compilar antes.
- **Un solo Dockerfile multi-stage** parametrizado con `ARG APP`, con `pnpm deploy --prod` por app. Cada servicio del compose es el mismo build con otro argumento.

## Consecuencias

- Un solo `pnpm fetch` cacheado sirve para todas las imágenes.
- Hay que volver a evaluar TypeScript 7 cuando `typescript-eslint` lo soporte.

## Enmienda (2026-11-04)

`pnpm deploy --legacy` resolvía otra vez los rangos de versión contra el registro y, con una red
inestable, el build se colgaba o fallaba a medias. Ahora, tras `pnpm -r build`, se ejecuta
`pnpm install --prod --offline` (desde el store ya descargado) y la imagen copia el workspace
podado; cada target arranca `apps/$APP/dist/index.js`. La etapa de build es la misma para todas las
apps, así que se construye una sola vez. Costo: cada imagen lleva las dependencias de producción de
todo el workspace.
