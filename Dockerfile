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
ARG APP=sunat-sim
RUN pnpm --filter "@chasqui/${APP}" deploy --prod --legacy /out

# Panel: estático detrás de nginx, que además hace de proxy hacia los simuladores.
FROM nginx:1.29-alpine AS panel
COPY apps/panel/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/panel/dist /usr/share/nginx/html

FROM node:22-alpine AS runtime
ENV NODE_ENV=production NODE_NO_WARNINGS=1
RUN mkdir /data && chown node:node /data
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
CMD ["node", "dist/index.js"]
