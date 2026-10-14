# Workflows

## `ci.yml`

Corre en **cada pull request** y en **cada push a `main`**. Cinco jobs sin
dependencias entre sí, así que se despachan en paralelo:

| Job | Verifica |
|---|---|
| `Typecheck` | `pnpm typecheck` sobre los cuatro paquetes |
| `Tests y cobertura del backend` | `pnpm cov:backend`: la suite de core, api y worker, y que la cobertura llegue al umbral |
| `Tests y cobertura del frontend` | `pnpm cov:frontend`: la suite de web, y que la cobertura llegue al umbral |
| `Build imagen del backend` | que `Dockerfile.api` construye |
| `Build imagen del frontend` | que `Dockerfile.web` construye |

### Los jobs de tests

Corren **la misma receta que en local**: los scripts `cov:backend` y
`cov:frontend` del `package.json`. El pipeline no sabe cómo se testea la
app; se lo pide al repositorio.

Cada uno hace tres cosas:

1. Corre vitest con `--coverage`. Los `thresholds` de la config de ese lado
   (`vitest.backend.config.ts`, `vitest.web.config.ts`) se evalúan al final,
   y si no se cumplen vitest sale con error **aunque todos los tests hayan
   pasado**. Ese error es lo que pone el check en rojo.
2. Escribe una tabla con líneas, ramas y funciones en el Summary del run
   (`.github/scripts/resumen-cobertura.mjs` sobre el `coverage-summary.json`).
   El script falla si el archivo no está o si se midieron cero archivos, que
   es el caso silencioso de un `include` mal escrito.
3. Sube el reporte HTML como artefacto (`cobertura-backend`,
   `cobertura-frontend`).

Los pasos 2 y 3 llevan `if: ${{ !cancelled() }}`: corren aunque el 1 haya
fallado, porque cuando el umbral frena es justo cuando hay que mirar el
número.

### Por qué no corren adentro del Dockerfile

La guía de la cátedra pone los tests en una etapa intermedia de la imagen.
Acá no: el backend no compila (corre TypeScript con `tsx`) y el toolchain de
tests vive en las `devDependencies` de la raíz del monorepo, no en la imagen.
Meterlos en el Dockerfile habría sido agregar una etapa, un `target`, un
`docker run` y un volumen para terminar ejecutando el mismo `pnpm cov:*`. El
principio que importa se cumple igual: una sola receta, en `package.json`.

### Por qué construye con los Dockerfiles del repo

El artefacto que se verifica tiene que ser **el mismo** que se despliega. Si el
pipeline tuviera su propia receta de build, las dos definiciones se separarían
con el tiempo y el día que fallara producción el pipeline seguiría en verde.

### Por qué hace falta el job de typecheck

El backend corre TypeScript directo con `tsx` y los `tsconfig` tienen
`noEmit: true`: no hay compilación. El Dockerfile sólo instala dependencias y
copia archivos, así que **la imagen se construye igual aunque el código esté
roto**. Sin el typecheck, el pipeline verificaría el empaquetado y no el
código — y eso ya pasó: un PR con un import a un módulo inexistente daba verde.

### Cache

Capas de Docker contra el cache de Actions (`type=gha`), con un `scope` por
imagen para que el build de una no invalide el de la otra. El job de typecheck
cachea además el store de pnpm.

Si el cache desaparece no se rompe nada: la corrida siguiente reconstruye todo
y tarda más. Un pipeline que no puede correr sin su cache está roto.

### El gate

`main` exige pull request **y** los cinco checks en verde, con `strict: true`
—la rama tiene que estar actualizada con `main`— y sin bypass para
administradores.

Desde el TP5 el gate puede ponerse en rojo **por cobertura**, no sólo por
compilación: un PR cuyo código compila y cuyos tests pasan queda bloqueado
igual si la cobertura cae por debajo del umbral.
