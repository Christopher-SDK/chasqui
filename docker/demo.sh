#!/bin/sh
# Arranca los simuladores y nginx; si cualquiera de los dos termina, el contenedor termina
# (la plataforma lo reinicia).
set -e
envsubst '${PORT}' < /etc/nginx/demo.conf.template > /etc/nginx/http.d/default.conf
cd /repo
pnpm --filter @chasqui/ecosistema start &
SIM=$!
nginx -g 'daemon off;' &
WEB=$!
while kill -0 "$SIM" 2>/dev/null && kill -0 "$WEB" 2>/dev/null; do sleep 5; done
exit 1
