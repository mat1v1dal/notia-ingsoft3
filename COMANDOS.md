# Comandos

Todo lo que hace falta para operar este repositorio y para demostrar cada
punto de los prácticos en vivo. Ordenado por tema, no por TP.

- [Arranque](#arranque)
- [Docker y Compose](#docker-y-compose)
- [El registry](#el-registry)
- [Git y el flujo de trabajo](#git-y-el-flujo-de-trabajo)
- [Pull requests](#pull-requests)
- [Protecciones de `main`](#protecciones-de-main)
- [Tags y releases](#tags-y-releases)
- [Issues y tablero](#issues-y-tablero)
- [El pipeline](#el-pipeline)
- [Demostrar en vivo](#demostrar-en-vivo)

---

## Arranque

En una máquina limpia, con Docker instalado y nada más:

```bash
git clone https://github.com/mat1v1dal/notia-ingsoft3.git
cd notia-ingsoft3
cp .env.example .env      # completar las cuatro variables del bloque base
docker compose up -d
```

La app queda en `http://localhost:8080` (o `WEB_PORT`). Comprobar el backend:

```bash
curl http://localhost:8080/salud          # → {"ok":true}
```

Generar los secretos del `.env`:

```bash
openssl rand -base64 32
```

### Desarrollo, sin contenedores

```bash
pnpm install
docker compose up -d postgres             # sólo la base

pnpm --filter @notia/api start            # backend en :3000
pnpm --filter @notia/web dev              # Vite en :5173

pnpm test                                 # 79 tests
pnpm typecheck
```

---

## Docker y Compose

```bash
docker compose up -d                      # levanta en segundo plano
docker compose ps                         # estado de los servicios
docker compose ps --format 'table {{.Service}}\t{{.Status}}\t{{.Ports}}'
docker compose logs -f                    # logs de los tres juntos
docker compose logs -f notia-api          # sólo el backend
docker compose restart notia-api
docker compose down                       # baja todo, CONSERVA los datos
docker compose down -v                    # baja todo y BORRA el volumen
```

### Entrar a un contenedor

```bash
docker compose exec postgres psql -U notia -d notia   # consola de la base
docker compose exec notia-api sh                      # shell en el backend
docker compose exec notia-web sh                      # shell en nginx
```

### Construir

```bash
docker compose build                      # las dos imágenes
docker compose build notia-api            # sólo una
docker compose build --no-cache           # ignorando el cache, desde cero

# Construir una etapa intermedia, para comparar tamaños
docker build --target deps -f Dockerfile.api -t notia-api-deps:medicion .
```

### Inspeccionar

```bash
docker images --format '{{.Repository}}:{{.Tag}}\t{{.Size}}'
docker image inspect ghcr.io/mat1v1dal/notia-api:v0.1.0
docker history ghcr.io/mat1v1dal/notia-api:v0.1.0     # las capas, una por una
docker volume ls
docker volume inspect notia_pgdata
```

### Los tres composes

```bash
# Stack evaluable: front + back + base
docker compose up -d

# Con la capa de ingesta por WhatsApp (necesita OpenAI y escanear un QR)
docker compose -f docker-compose.yml -f docker-compose.full.yml up -d

# Bajando las imágenes del registry en vez de construirlas.
# Se usa SOLO, no compuesto sobre el base.
docker compose -f docker-compose.registry.yml up -d
```

Validar la sintaxis sin levantar nada:

```bash
docker compose config --quiet
docker compose -f docker-compose.yml -f docker-compose.full.yml config --quiet
```

---

## El registry

```bash
# Login (el token de gh sirve, con scope write:packages)
gh auth token | docker login ghcr.io -u mat1v1dal --password-stdin

docker push ghcr.io/mat1v1dal/notia-api:v0.1.0
docker push ghcr.io/mat1v1dal/notia-web:v0.1.0

docker pull ghcr.io/mat1v1dal/notia-api:v0.1.0
```

Verificar visibilidad y que un tercero puede bajarlas:

```bash
gh api /user/packages/container/notia-api -q .visibility     # → public

# Token anónimo: si devuelve 200 sin credenciales, es pública de verdad
TOKEN=$(curl -s "https://ghcr.io/token?scope=repository:mat1v1dal/notia-api:pull&service=ghcr.io" | jq -r .token)
curl -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" \
  https://ghcr.io/v2/mat1v1dal/notia-api/manifests/v0.1.0
```

> La visibilidad de un paquete **no se puede cambiar por API**: es sólo por web,
> en `github.com/users/mat1v1dal/packages/container/<nombre>/settings`.

---

## Git y el flujo de trabajo

```bash
git switch -c feat/lo-que-sea             # crear rama y pararse en ella
git switch main
git status
git log --oneline --graph --all           # el historial, visual
git log --oneline -5

git add -A
git commit -m "feat(algo): qué hace"
git push -u origin feat/lo-que-sea        # -u sólo la primera vez
git pull
```

### Ver qué hay adentro de Git

```bash
cat .git/refs/heads/main                  # una rama ES esto: un hash
cat .git/HEAD                             # a qué rama apuntás
git cat-file -p HEAD                      # el commit crudo: árbol, padre, autor
```

### Resolver un conflicto

```bash
git fetch origin
git merge origin/main                     # acá aparece el CONFLICT

grep -n -E '^(<<<<<<<|=======|>>>>>>>)' README.md   # ver los marcadores

# editar el archivo, dejar el contenido final, borrar los tres marcadores
git add README.md
git commit                                # cierra el merge
git push
```

### Deshacer

```bash
git reset --hard HEAD~1                   # borra el último commit local
git restore <archivo>                     # descarta cambios sin commitear
git revert <hash>                         # deshace un commit YA pusheado
```

---

## Pull requests

```bash
gh pr create --title "..." --body "..."
gh pr list
gh pr list --state merged
gh pr view 14
gh pr view 14 --web                        # abrir en el navegador
gh pr merge 14 --merge
gh pr checks 14                            # estado de los checks
```

Ver si un PR está bloqueado y por qué:

```bash
gh pr view 14 --json mergeable,mergeStateStatus,statusCheckRollup
```

`mergeStateStatus`: `CLEAN` se puede mergear · `BLOCKED` falta un check ·
`DIRTY` hay conflictos · `BEHIND` la rama está desactualizada (por `strict`).

---

## Protecciones de `main`

Leer la configuración actual:

```bash
gh api repos/mat1v1dal/notia-ingsoft3/branches/main/protection \
  -q '{pr: (.required_pull_request_reviews != null),
       aprobaciones: .required_pull_request_reviews.required_approving_review_count,
       sin_bypass: .enforce_admins.enabled,
       strict: .required_status_checks.strict,
       checks: .required_status_checks.contexts}'
```

Aplicarla (es reproducible, por eso se hace así y no por la web):

```bash
gh api --method PUT "repos/mat1v1dal/notia-ingsoft3/branches/main/protection" \
  --input - <<'EOF'
{
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "required_status_checks": {
    "strict": true,
    "contexts": ["Typecheck", "Build imagen del backend", "Build imagen del frontend"]
  },
  "enforce_admins": true,
  "restrictions": null
}
EOF
```

- `enforce_admins: true` = *Do not allow bypassing*. La regla alcanza al dueño.
- `required_approving_review_count: 0` porque GitHub no deja aprobar el PR propio.
- `strict: true` = la rama tiene que estar actualizada con `main` para mergear.

---

## Tags y releases

```bash
git tag -a v2.0.0 -m "TP2 cerrado"
git push origin v2.0.0
git tag -l                                 # listar

# Mover un tag ya publicado (y contarlo en decisiones.md)
git tag -f v2.0.0 -m "TP2 cerrado"
git push -f origin v2.0.0
```

```bash
gh release create v2.0.0 --title "v2.0.0 — TP2" --notes "qué incluye"
gh release list
gh release view v2.0.0
```

---

## Issues y tablero

```bash
gh issue create --title "..." --label story --body "..."
gh issue list
gh issue list --state open
gh issue view 19
gh issue close 19
```

### Jerarquía de sub-issues

`gh` sólo tiene `--add-sub-issue` desde la versión 2.94. Con una anterior, por API
— y pide el **id** del issue, no su número:

```bash
R=repos/mat1v1dal/notia-ingsoft3
ID=$(gh api $R/issues/18 -q .id)
gh api --method POST $R/issues/17/sub_issues -F sub_issue_id=$ID

gh api $R/issues/17/sub_issues -q '.[]|"#\(.number) \(.title)"'   # ver los hijos
```

Subir la jerarquía desde una tarea:

```bash
gh api graphql -f query='
query { repository(owner:"mat1v1dal", name:"notia-ingsoft3") {
  issue(number:19) { number title
    parent { number title parent { number title } } } } }'
```

### El proyecto

> Requiere scope: `gh auth refresh -h github.com -s project,read:project`

```bash
gh project list --owner mat1v1dal
gh project view 1 --owner mat1v1dal
gh project item-list 1 --owner mat1v1dal
gh project field-list 1 --owner mat1v1dal
gh project item-add 1 --owner mat1v1dal --url <url-del-issue>
```

> El **sprint** (campo Iteration) y el **límite de trabajo en progreso** no se
> pueden crear por API: la API de GitHub no expone ninguna mutation para
> iteraciones, y el límite es una propiedad de la *vista*. Los dos son por web.

---

## El pipeline

```bash
gh run list                                # últimas corridas
gh run list --branch main --limit 5
gh run view <id>                           # detalle de una corrida
gh run view <id> --log                     # el log completo
gh run watch <id>                          # seguirla en vivo
gh workflow list
```

Ver los tiempos de cada job (así se demuestra el paralelismo):

```bash
gh run view <id> --json jobs \
  -q '.jobs[]|"\(.name): \(.conclusion) (\(.startedAt[11:19]) → \(.completedAt[11:19]))"'
```

Contar capas reutilizadas del cache:

```bash
gh run view <id> --log | grep -ic CACHED
```

---

## Demostrar en vivo

Los comandos exactos para probar cada punto durante la defensa.

### El push directo a `main` es rechazado

```bash
echo "" >> .gitignore
git commit -am "test: intento de push directo"
git push                                   # → protected branch hook declined
git reset --hard HEAD~1                    # deshacer el commit local
```

### Los datos persisten a `down` pero no a `down -v`

```bash
# crear un item desde la app, y después:
docker compose down && docker compose up -d
curl -b cookies http://localhost:8080/api/items    # sigue estando

docker compose down -v && docker compose up -d
curl -b cookies http://localhost:8080/api/items    # → []
```

### El sistema responde end-to-end

```bash
curl -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:8080/
curl http://localhost:8080/salud
curl -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/items   # 401
curl -o /dev/null -w "%{http_code}\n" http://localhost:8080/buscar      # 200
```

### La imagen final es más chica que la de build

```bash
docker build --target deps -f Dockerfile.api -t notia-api-deps:medicion .
docker images --format '{{.Repository}}:{{.Tag}}\t{{.Size}}' | grep notia
```

### El registry entrega de verdad

```bash
docker compose down -v
docker rmi -f ghcr.io/mat1v1dal/notia-api:v0.1.0 ghcr.io/mat1v1dal/notia-web:v0.1.0
docker images | grep notia                 # no queda ninguna
docker compose -f docker-compose.registry.yml up -d    # las baja
docker compose -f docker-compose.registry.yml ps --format 'table {{.Service}}\t{{.Image}}'
```

### La trazabilidad cierra el círculo

```bash
gh api graphql -f query='
query { repository(owner:"mat1v1dal", name:"notia-ingsoft3") {
  issue(number:19) { number state
    timelineItems(last:10, itemTypes:[CLOSED_EVENT]) { nodes {
      ... on ClosedEvent { closer { ... on PullRequest {
        number merged commits(first:5){nodes{commit{oid messageHeadline}}} } } } } } } } }'
```

### El gate bloquea

```bash
gh pr view 14 --json mergeable,mergeStateStatus,statusCheckRollup
```
