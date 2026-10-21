#!/usr/bin/env bash
# Vuelve un entorno a un commit anterior y cronometra cuánto tarda.
#
#   deploy/rollback.sh <qa|prod> <sha> <clave-ssh>
#
# Es el mismo mecanismo que el deploy del pipeline: fijar NOTIA_TAG al commit
# y hacer pull + up. Por eso alcanza con el sha: la imagen de ese commit ya
# está en el registry, no hay que construir nada. El cronómetro corre desde
# el comando hasta que /salud, DESDE AFUERA, informa el commit pedido.
#
# Lo que NO deshace: los datos. Si el deploy malo corrió una migración que
# borró o cambió una columna, volver la imagen no la restaura.
set -euo pipefail
ENTORNO=$1; SHA=$2; CLAVE=$3
case $ENTORNO in qa) PUERTO=8081 ;; prod) PUERTO=8082 ;; *) echo "entorno: qa | prod"; exit 2 ;; esac
VPS=notia-deploy@201.32.128.192
URL=http://201.32.128.192:$PUERTO

antes=$(curl -fsS --max-time 10 "$URL/salud" | sed -n 's/.*"commit":"\([0-9a-f]*\)".*/\1/p')
echo "corriendo antes: ${antes:-desconocido}"
echo "inicio: $(date '+%H:%M:%S')"
INICIO=$(date +%s)

ssh -p 5078 -i "$CLAVE" -o IdentitiesOnly=yes "$VPS" "
  cd /srv/notia/$ENTORNO &&
  sed -i 's/^NOTIA_TAG=.*/NOTIA_TAG=sha-$SHA/' .env &&
  docker compose pull -q &&
  docker compose up -d
" >/dev/null

until [ "$(curl -fsS --max-time 5 "$URL/salud" 2>/dev/null | sed -n 's/.*"commit":"\([0-9a-f]*\)".*/\1/p')" = "$SHA" ]; do
  sleep 1
done

echo "fin:    $(date '+%H:%M:%S')"
echo "corriendo ahora: $SHA"
echo "rollback de $ENTORNO: $(( $(date +%s) - INICIO )) s"
