#!/usr/bin/env bash
# Smoke test post-deploy. Uso: smoke.sh <URL_API> <URL_FRONT> <SHA esperado> [intentos] [espera]
#
# Reintenta porque el contrato del free tier lo exige: el deploy hook
# responde al instante y el proveedor construye en background; y un servicio
# dormido tarda hasta un minuto en despertar. Un curl seco daría falsos rojos.
#
# Verifica tres cosas, y la tercera es la que distingue este smoke de uno
# decorativo: que /salud conteste con la base viva, que el front sirva, y que
# el commit que /salud informa sea EL QUE SE DESPLEGÓ. Sin eso, el smoke da
# verde contra la versión anterior mientras la nueva todavía se construye.
set -u
URL_API=$1; URL_FRONT=$2; SHA=$3; INTENTOS=${4:-30}; ESPERA=${5:-20}

for i in $(seq 1 "$INTENTOS"); do
  # --max-time va acá, que es donde puede colgarse: un servicio despertando
  # acepta la conexión y no contesta.
  salud=$(curl -fsS --max-time 10 "$URL_API/salud" 2>/dev/null) || salud=""
  commit=$(printf '%s' "$salud" | sed -n 's/.*"commit":"\([0-9a-f]*\)".*/\1/p')
  front=$(curl -s -o /dev/null --max-time 10 -w '%{http_code}' "$URL_FRONT/" 2>/dev/null) || front="000"

  if [ -n "$salud" ] && [ "$front" = "200" ] && [ "$commit" = "$SHA" ]; then
    echo "✅ responde: API + base + front, corriendo $SHA (intento $i)"
    exit 0
  fi
  echo "intento $i/$INTENTOS: salud='${salud:-sin respuesta}' front=$front (esperado $SHA)"
  sleep "$ESPERA"
done

echo "❌ no respondió a tiempo con el commit $SHA"
exit 1
