# Workflows

## `ci.yml`

Corre en **cada pull request** y en **cada push a `main`**. Tres jobs sin
dependencias entre sí, así que se despachan en paralelo:

| Job | Verifica |
|---|---|
| `Typecheck` | `pnpm typecheck` sobre los cuatro paquetes |
| `Build imagen del backend` | que `Dockerfile.api` construye |
| `Build imagen del frontend` | que `Dockerfile.web` construye |

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

`main` exige pull request **y** los tres checks en verde, con `strict: true`
—la rama tiene que estar actualizada con `main`— y sin bypass para
administradores.
