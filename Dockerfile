# syntax=docker/dockerfile:1.7
# Una sola imagen multi-stage; cada app es un target (ver docs/adr/0002).
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --offline --frozen-lockfile --ignore-scripts
RUN pnpm -r build
# Sin red después del install: se quitan las devDependencies desde el store ya descargado y la
# imagen lleva el workspace podado. (pnpm deploy --legacy resolvía otra vez contra el registro y
# fallaba con redes inestables; ver docs/adr/0002, enmienda.)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --offline --frozen-lockfile --ignore-scripts

# Panel: estático detrás de nginx, que además hace de proxy hacia los simuladores.
FROM nginx:1.29-alpine AS panel
COPY apps/panel/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/panel/dist /usr/share/nginx/html

FROM node:22-alpine AS runtime
ARG APP=sunat-sim
ENV NODE_ENV=production NODE_NO_WARNINGS=1 APP=${APP}
RUN mkdir /data && chown node:node /data
WORKDIR /repo
COPY --from=build --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/packages ./packages
COPY --from=build --chown=node:node /repo/apps ./apps
COPY --from=build --chown=node:node /repo/package.json ./
USER node
# exec: node queda como PID 1 y recibe SIGTERM (cierre ordenado y flush de telemetría).
CMD ["sh", "-c", "exec node apps/$APP/dist/index.js"]
