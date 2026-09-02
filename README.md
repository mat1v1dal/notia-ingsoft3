# Ingeniería del Software 3 — UCC 2026

[![CI](https://github.com/mat1v1dal/notia-ingsoft3/actions/workflows/ci.yml/badge.svg)](https://github.com/mat1v1dal/notia-ingsoft3/actions/workflows/ci.yml)

Repositorio de la práctica. Ingeniería en Sistemas, 4to año.
Docente: Ing. Ariel Schwindt.

Acá se construye, semana a semana, el sistema de entrega completo de una
aplicación: integración continua, calidad, entrega continua, releases
inmutables, infraestructura como código, seguridad y observabilidad.

## Estado

| TP | Tema | Estado |
|---|---|---|
| TP1 | Git colaborativo | ✅ `v1.0.0` |
| TP2 | Contenedores: la app del semestre | ✅ `v2.0.0` |
| TP3 | Planificación y trazabilidad | ✅ `v3.0.0` — [tablero](https://github.com/users/mat1v1dal/projects/1) |
| TP4 | CI: Pipelines as Code | ✅ `v4.0.0` |

## La app del semestre: notia

Notia observa los chats de WhatsApp que vos elegís, extrae de ahí lo que te
compromete —una fecha, un pedido, un material— y lo deja en una bandeja que
podés revisar, corregir y deshacer. Cada cambio queda registrado con el motivo
por el que se hizo: el sistema es auditable y reversible por diseño.

## Arranque en una máquina limpia

Necesitás Docker con Compose. Nada más: no hace falta Node, ni pnpm, ni
ninguna credencial de un servicio externo.

```bash
git clone https://github.com/mat1v1dal/notia-ingsoft3.git
cd notia-ingsoft3

# 1. Los secretos son lo único que no viaja en el repositorio.
cp .env.example .env

# 2. Completá las cuatro variables del bloque "Stack base" del .env.
#    Para los secretos: openssl rand -base64 32

# 3. Arriba.
docker compose up -d
```

La app queda en **http://localhost:8080** (o el puerto que pongas en
`WEB_PORT`). Entrás con el valor que le hayas puesto a `APP_PASSWORD`.

Son **dos** comandos y no uno, y eso es a propósito: el `.env` con los
secretos no está versionado, así que la primera vez hay que crearlo.

```bash
curl http://localhost:8080/salud   # → {"ok":true}
```

### Levantarlo sin compilar nada

Las imágenes están publicadas. Esta variante las **baja** del registry en vez
de construirlas — es como lo consume un entorno que no tiene el código fuente:

```bash
docker compose -f docker-compose.registry.yml up -d
```

### Los tres servicios

| Servicio | Qué es | Imagen |
|---|---|---|
| `notia-web` | La PWA compilada, servida por nginx. Proxea `/api` al backend. | `ghcr.io/mat1v1dal/notia-web` |
| `notia-api` | Hono + Drizzle. Corre las migraciones al arrancar. | `ghcr.io/mat1v1dal/notia-api` |
| `postgres` | La base. Persiste en el volumen `pgdata`. | `postgres:16-alpine` |

```
navegador → notia-web (nginx :80) ──┬─→ estáticos de la SPA
                                    └─→ /api, /login, /u → notia-api :3000 → postgres :5432
```

Los servicios se encuentran **por nombre**: `notia-api` y `postgres` los
resuelve el DNS interno de la red de Compose. No hay ninguna IP en la
configuración.

### Comandos útiles

```bash
docker compose ps --format 'table {{.Service}}\t{{.Status}}'   # estado legible
docker compose logs -f                  # logs de los tres servicios juntos
docker compose logs -f notia-api        # solo el backend
docker compose exec postgres psql -U notia -d notia   # consola de la base
docker compose down                     # baja todo, CONSERVA los datos
docker compose down -v                  # baja todo y BORRA el volumen
```

### La capa opcional: ingesta por WhatsApp

El stack base es la app completa y usable. Lo que le falta es la ingesta
automática — el worker que lee los chats y decide qué anotar. Esa capa vive
aparte porque depende de una API key de OpenAI con saldo y de una sesión de
WhatsApp que se inicia escaneando un QR:

```bash
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d
```

El motivo de la separación está en [`decisiones.md`](decisiones.md).

## Desarrollo

```bash
pnpm install
docker compose up -d postgres          # solo la base

pnpm --filter @notia/api start         # backend en :3000
pnpm --filter @notia/web dev           # Vite en :5173, proxea /api al backend

pnpm test                              # 79 tests
pnpm typecheck
```

## Estructura

```
packages/core     el dominio: items, ingesta, despacho, scheduler, agente, deshacer
packages/api      HTTP: Hono + Drizzle. Corre las migraciones al arrancar.
packages/web      la PWA: React + Vite
packages/worker   la ingesta: OpenAI + notificaciones
```

## Documentos

- [`decisiones.md`](decisiones.md) — bitácora de decisiones, acumulativa.
- [`evidencias.md`](evidencias.md) — capturas y salidas que respaldan cada TP.
- [`AGENTS.md`](AGENTS.md) — cómo trabaja un agente de IA sobre este repositorio.
