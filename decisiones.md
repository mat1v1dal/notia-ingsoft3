# Decisiones

Bitácora de la cursada. Cada TP agrega su sección abajo; lo anterior no se
reescribe.

---

## TP1 — Git colaborativo

### Por qué Git no pudo resolver el conflicto solo

El conflicto está en el [PR #3](../../pull/3). Dos ramas salieron del mismo
commit de `main` y las dos reescribieron **el mismo párrafo** del README, el
que habla de la app del semestre:

- `docs/readme-como-clonar` agregó que todavía no hay nada para levantar.
- `docs/readme-nombrar-la-app` puso el nombre de la app.

Cuando la primera se mergeó, la segunda quedó apoyada sobre una base que ya no
existía.

Git hace el merge comparando **tres versiones** del archivo: la del ancestro
común y la de cada rama. Cuando una región cambió de un solo lado, la aplica
sin preguntar. Cuando la misma región cambió de los dos lados y de forma
distinta, no tiene criterio para elegir: no sabe que "el nombre de la app" y
"todavía no hay nada para levantar" son datos que conviven, ni que uno no
reemplaza al otro. Ve texto.

Poner una heurística ahí sería peor que parar: elegiría mal en silencio, que
es el tipo de error que después nadie encuentra. Parar y pedir una decisión
humana es lo correcto.

Lo resolví **quedándome con los dos lados**, porque eran complementarios. Esa
lectura requiere entender qué dice cada frase, y por eso la hace una persona.

**Qué habría tenido que pasar para que nunca apareciera.** Tres cosas, en
orden de lo que de verdad se usa:

1. Que las ramas fueran **cortas y se integraran seguido**. El conflicto nace
   de que dos ramas viven en paralelo sobre la misma región; cuanto menos
   tiempo pasan abiertas, menos probable es. Es la razón práctica detrás de
   integración continua, antes que cualquier herramienta.
2. Que cada rama tocara **una región distinta**. Acá las dos fueron al mismo
   párrafo de tres líneas.
3. Que la segunda rama **se sincronizara con `main`** antes de pedir el merge.
   No evita el conflicto: lo mueve. Se resuelve en la máquina de quien lo
   generó, con el contexto fresco, en vez de aparecer en el PR.

Lo que **no** lo habría evitado es otra forma de integrar. Un rebase o un
squash tendrían exactamente el mismo conflicto: el problema no es cómo se
integra, es que dos personas escribieron sobre lo mismo.

### Las protecciones sobre `main`

`main` quedó con **pull request obligatorio**, **cero aprobaciones
requeridas** y **sin bypass para administradores**.

Las cero aprobaciones no relajan la regla: GitHub no permite que el autor de
un PR apruebe su propio PR (la opción aparece deshabilitada y la API devuelve
`422 — Can not approve your own pull request`). En un TP individual, exigir una
aprobación sería exigir algo que nadie puede dar. En un equipo real acá iría
1 o más, y es lo primero que cambiaría al sumar un segundo colaborador.

El *sin bypass* es la parte que importa. Soy el dueño del repositorio, así que
sin eso la protección sería decorativa: GitHub me dejaría saltearla. Está
verificado por la vía directa —intenté pushear a `main` y me rechazó— y la
salida está en [`evidencias.md`](evidencias.md).

Las configuré **por API** (`gh api --method PUT .../branches/main/protection`)
en vez de por la web. Misma regla, pero queda escrita y es reproducible: si
mañana tengo que recrear el repositorio, es un comando y no seis clics que hay
que recordar. Es también el primer paso hacia lo que la materia llama
*configuración como código*.

### La estrategia de ramas

Ramas por **unidad de cambio**, no por trabajo práctico: `feat/` para lo que
agrega capacidad, `fix/` para lo que corrige, `docs/` para documentación,
`chore/` para mantenimiento. Commits en formato convencional.

El motivo es que los TPs de esta materia no son entregas sueltas: son capas
sobre el mismo artefacto. Una rama `tp2` no dice qué cambia; `docs/entrega-tp1`
sí. El número del práctico queda registrado donde se lo busca: en el tag y en
la release.

### Por qué el repositorio arranca vacío de aplicación

El enunciado pide el repositorio con su `.gitignore` y nada más, porque **la
app se elige en el TP2**. Lo respeté literalmente: hoy acá hay flujo de trabajo
y documentación, y ni una línea de código de aplicación.

La app ya está decidida —[notia](https://github.com/mat1v1dal/notia), un
asistente propio con frontend, backend y base de datos— y el README la nombra,
pero el código entra la semana que viene, con el TP2. Adelantarlo habría
comprimido dos prácticos en un día, y el historial de Git lo mostraría.

### Sobre el uso de IA en este repositorio

Además de declararlo abajo, dejé las condiciones escritas como spec en
[`openspec/specs/flujo-de-trabajo/spec.md`](openspec/specs/flujo-de-trabajo/spec.md)
y [`AGENTS.md`](AGENTS.md): declarado, verificado ejecutando, defendible y sin
fabricar evidencia.

No es un requisito del TP1. Lo hice porque la regla de la materia —*si no lo
podés explicar, no lo aprobás*— pide exactamente lo que obliga a escribir un
documento de diseño: el porqué de cada decisión y las alternativas que
quedaron afuera. Las alternativas descartadas son lo que se pregunta en una
defensa, y son lo primero que se pierde si no se anotan en el momento.

### Problemas encontrados

**El primer conflicto que fabriqué no fue un conflicto.** Armé dos ramas sobre
el mismo bloque del README y GitHub las mergeó sin chistar: una había
*agregado* texto después del bloque y la otra había *modificado* el bloque.
Regiones adyacentes, no superpuestas — y eso Git lo resuelve solo. Tuve que
rehacerlo pisando literalmente los mismos renglones.

El aprendizaje es que "tocar el mismo archivo" no alcanza para provocar un
conflicto: la unidad es la región, y la región es más chica de lo que uno
intuye. También explica por qué en un proyecto real los conflictos aparecen
menos de lo que uno teme, y por qué cuando aparecen suelen ser en los archivos
que todos tocan.

**Empecé con la estructura equivocada.** Mi primer intento metió el TP1 y buena
parte del TP2 —contenerización, compose— en un solo día y un solo repositorio.
Funcionaba, pero contradecía cómo está diseñada la cursada: un TP por semana,
con el historial como evidencia de cuándo se trabajó. Lo rehice desde cero en
este repositorio, respetando el orden de los prácticos. El intento anterior
sigue accesible en [mat1v1dal/notia](https://github.com/mat1v1dal/notia).

### Declaración de uso de IA

Usé **Claude Code** como asistente en este práctico. Fue asistida la redacción
de este archivo, de `evidencias.md`, del `README.md` y de los documentos de
`openspec/` y `AGENTS.md`, además de la ejecución de la secuencia de Git
—crear el repositorio, configurar las protecciones por API, abrir los pull
requests y fabricar el conflicto—.

No fue asistida la decisión de qué app usar en el semestre, ni la de rehacer el
repositorio para respetar el ritmo de un TP por semana.

**Cómo lo verifiqué.** No di nada por bueno por leerlo:

- **La protección rechaza de verdad.** No me alcanzó con que la API devolviera
  `enforce_admins: true`: intenté el push contra `main` y guardé el rechazo del
  servidor. Están las dos cosas en `evidencias.md`.
- **El conflicto es un conflicto.** El primer intento GitHub lo auto-mergeó.
  Verifiqué el segundo por el estado que reporta GitHub
  (`mergeable: CONFLICTING`) antes de darlo por bueno, y por los marcadores en
  el archivo al traer `main` a la rama.
- **El historial dice lo que digo que dice.** Los enlaces a PRs de este
  documento apuntan a PRs reales de este repositorio.

Lo que **no** puedo declarar como verificado: nada de este TP quedó sin
verificar. No hay código ejecutable todavía, así que la verificación es sobre
configuración e historial, y las dos se comprobaron contra el servidor.

---

## TP2 — Contenedores: la app del semestre

### Qué app elegí y por qué

**notia**: un asistente propio que observa los chats de WhatsApp que uno elige,
extrae lo que compromete —una fecha, un pedido, un material— y lo deja en una
bandeja revisable y reversible. Frontend en React, backend en Hono sobre Node,
base Postgres.

Contra los cinco criterios de `elegir-app.md`, en orden:

**1. Que pueda ejecutarla hoy.** Sí, y no es una afirmación de fe: el sistema
levanta con `docker compose up -d` y las salidas están en `evidencias.md`. Es
el criterio que la guía marca como el más omitido y el más caro; lo verifiqué
antes de comprometerme, no después.

**2. Que conozca los comandos de compilación y ejecución.** `pnpm install`,
`pnpm --filter @notia/web build` para la SPA, y el backend arranca con
`tsx src/index.ts`. El backend **no tiene paso de compilación**: los
`tsconfig` llevan `noEmit: true` y el código corre en TypeScript vía tsx. Es
una decisión deliberada del proyecto —no hay un artefacto compilado que pueda
quedar desincronizado de lo que testeamos— y condicionó cómo escribí el
Dockerfile (ver más abajo).

**3. Que la conexión a la base se configure por variable de entorno.** Sí, y es
el punto más fuerte de la elección. `packages/api/src/index.ts` tiene una
función `requerido()` que lee `DATABASE_URL` del entorno y **falla ruidosamente
si falta**, en vez de arrancar con un valor por defecto que después nadie
entiende de dónde salió. No hay una sola cadena de conexión escrita en el
código. Es exactamente lo que el TP6 va a necesitar cuando la misma aplicación
tenga que apuntar a una base de QA y a otra de producción.

**4. Que tenga lógica para testear.** El TP5 pide 8 tests de backend y 4 de
frontend. Hoy hay **79 tests en 9 archivos**, y las reglas que ejercitan son
del tipo que la guía pide: la ventana de silencio del despachador, el dedup de
la ingesta, la reapertura de items, el cálculo de vencimientos según la zona
horaria del usuario, el digest que no se manda dos veces el mismo día.

Los tests de dominio levantan una **PGlite en memoria con las mismas
migraciones que corren en producción**, así que no hay mocks de la base: se
ejercita Postgres de verdad. Esa propiedad es la que los hace valer.

**Punto flojo, declarado**: los 7 tests de frontend son de una utilidad de
fechas, no de comportamiento de interfaz. Para el TP5 hacen falta 2 o 3 tests
de componente —un formulario que no deja enviar con datos inválidos, un botón
que se deshabilita según el estado—. Está identificado y es trabajo del TP5,
no una sorpresa que me voy a encontrar en septiembre.

**5. Que la entienda para modificarla.** Es un proyecto propio.

**Sobre las dos consideraciones adicionales.** El tamaño es el adecuado: tres
vistas y un puñado de endpoints. La de dependencias exóticas es donde la app
tenía un problema real, y lo resolví — es la decisión central de este TP, abajo.

### Procedencia del código

notia existía antes de la materia, en
[`mat1v1dal/notia`](https://github.com/mat1v1dal/notia). Lo traje **sin el
historial previo**: un solo commit que incorpora el código.

Es una decisión, no una omisión. El repositorio de la materia registra el
trabajo de la materia, y la cursada evalúa el historial como evidencia de
proceso. Arrastrar los commits del proyecto anterior mezclaría dos historias
con propósitos distintos y haría ilegible justamente lo que se quiere leer.
El repositorio de origen queda público y enlazado: quien quiera ver cómo se
construyó la app puede hacerlo, y quien quiera ver cómo trabajé en la materia
mira este historial.

### El criterio de diseño: qué entra al arranque

El escenario del TP2 fija la vara: *"cualquier persona que clone el repo
levanta el sistema completo con un solo comando"*. Y `elegir-app.md` agrega el
criterio con el que se elige qué depende de qué: *"si el servicio deja de estar
disponible o vence el período gratuito, el TP queda comprometido"*.

Apliqué ese criterio al despliegue de notia y partí el sistema en dos niveles
según **de qué depende cada servicio para arrancar**:

| Nivel | Archivo | Servicios |
|---|---|---|
| Base | `docker-compose.yml` | `notia-web`, `notia-api`, `postgres` |
| Completo | `+ docker-compose.full.yml` | `notia-worker`, `evolution-api`, `caddy` |

La regla que gobierna la partición: **todo servicio cuyo arranque dependa de
una credencial de terceros, de un servicio pago o de una sesión que un humano
tenga que iniciar a mano, vive en el nivel completo.** El nivel base tiene que
poder levantarlo cualquiera, en cualquier máquina con Docker.

El worker de ingesta usa OpenAI y un gateway de WhatsApp, así que por esa regla
va al nivel completo. Es la misma separación que hace cualquier sistema con una
integración externa: el núcleo no se cae porque un proveedor cambie sus
condiciones.

Sin la capa opcional se pierde la ingesta automática, no la aplicación: se
siguen creando, buscando, cerrando y reabriendo items desde el navegador.

**Alternativas que descarté.** Dejar todo junto y documentar que hace falta la
API key: no resuelve nada, el sistema sigue sin levantar. Stubear OpenAI y
Evolution con un mock en el compose: un mock en el arranque es una mentira
operativa —quien levanta el sistema cree que la ingesta funciona—. Usar
perfiles de Compose en un solo archivo: los perfiles activan o desactivan
servicios, pero no permiten que un servicio de un perfil **modifique** a otro
del archivo base, y la capa de WhatsApp necesita agregarle un volumen a
`postgres`. Caddy sí quedó bajo perfil `produccion`, porque es un agregado
puro que no modifica a nadie.

### Decisiones de contenerización

**Imágenes base.** `node:24-alpine` para construir, `nginx:1.29-alpine` para
servir el frontend, `postgres:16-alpine` para la base. Alpine en los tres casos
por tamaño. Las versiones están fijadas: un `latest` en una imagen base hace
que el build de mañana no sea el de hoy, que es lo contrario de lo que un
sistema de entrega debería garantizar.

**Estructura multi-stage del frontend**, la clásica: una etapa con Node compila
la SPA, la etapa final es nginx con los estáticos. La imagen que se despliega
no tiene Node ni código fuente. **92,1 MB.**

**Estructura multi-stage del backend**, y acá me aparté del molde. Como el
backend no compila (criterio 2), un multi-stage "clásico" de compilar-y-copiar
no aplicaba. Lo que sí sobra en la imagen final es el **toolchain**: typescript,
vitest, vite y drizzle-kit. Así que las tres etapas son `deps` (todas las
dependencias, incluidas las de desarrollo) → `prod-deps` (mismo lockfile, sin
devDependencies) → `runtime`.

Se paga: la etapa `deps` pesa **553 MB** y la imagen final **343 MB**. Un 38%
menos, y lo que se descarta es exactamente lo que no se usa en producción.

Consecuencia que acepto: la imagen de la API lleva el código fuente TypeScript.
Para este proyecto no es un problema —el repositorio es público—, pero en uno
cerrado sería un argumento para introducir el paso de compilación.

**Los dos `.dockerignore`.** El contexto de build es la raíz del monorepo, no
una carpeta por imagen: pnpm necesita el lockfile y **todos** los
`package.json` para resolver el workspace con `--frozen-lockfile`. Un
`.dockerignore` en la raíz habría sido uno solo para las dos imágenes, así que
usé los ignores por Dockerfile que soporta BuildKit:
`Dockerfile.api.dockerignore` y `Dockerfile.web.dockerignore`. Son dos, cada
uno para su imagen, y cada uno excluye lo que a la otra sí le importa: el de la
API deja afuera el código del frontend, y el del frontend deja afuera el del
backend y el del worker.

Detalle que me costó un build roto: el ignore de la API no puede excluir
`packages/web` entero, porque el Dockerfile copia `packages/web/package.json`
para que pnpm resuelva el workspace. Excluye su código, no su manifiesto.

**Qué persiste y qué no.** Persiste la base, en el volumen nombrado `pgdata`.
No persiste nada más: los contenedores de la API y del frontend son
descartables por diseño —no guardan estado— y por eso se pueden recrear,
escalar o reemplazar por una imagen nueva sin ceremonia. Es la propiedad que el
TP7 va a explotar.

El volumen es **nombrado** y no un bind mount contra una carpeta del host: lo
administra Docker, no depende de la ruta desde la que alguien clonó el
repositorio, y sobrevive a `docker compose down`. Se borra sólo con
`down -v`, y la diferencia está probada en `evidencias.md`.

**`depends_on` con healthcheck.** `depends_on` a secas sólo espera a que el
contenedor **arranque**. Postgres tarda varios segundos más en aceptar
conexiones, y en ese hueco `migrate()` falla. Por eso el healthcheck
(`pg_isready`) y la condición `service_healthy`: la API no arranca hasta que la
base contesta de verdad.

### Publicación en el registry

Las dos imágenes se publican en **ghcr.io**, públicas, con tag `v0.1.0`.
Elegí ghcr sobre Docker Hub porque la autenticación sale del mismo token de
GitHub que ya uso para el repositorio —una credencial menos que administrar— y
porque en el TP4 el pipeline va a correr en GitHub Actions, donde publicar a
ghcr es el camino con menos fricción.

El tag es `v0.1.0` y no `v2.0.0`: la versión de la **imagen** es la del
producto y sigue su propio ciclo; `v2.0.0` es el tag del **repositorio** que
marca el cierre del TP2. Son dos numeraciones distintas sobre cosas distintas,
y mezclarlas es un error que se paga en el TP7.

`docker-compose.registry.yml` es la variante que **baja** las imágenes en vez
de construirlas: es como consume el sistema un entorno que no tiene el código
fuente. Se usa **sola** (con `-f`), no compuesta sobre el archivo base — si se
compusieran, la clave `build` seguiría presente y volvería a construir
localmente, que es justo lo que este archivo evita. Está anotado en el propio
archivo.

### Problemas encontrados

**El ignore de la API rompió el build.** Excluí `packages/web` entero para que
el código del frontend no invalidara el cache de la imagen del backend, y
`pnpm install --frozen-lockfile` falló: necesita el `package.json` de todos los
paquetes del workspace, aunque después no instale nada de ellos. Lo diagnostiqué
leyendo el error del build y lo resolví excluyendo el código pero no el
manifiesto.

**La sesión sobrevive a `down -v`, y está bien.** Probando la persistencia me
llamó la atención que después de borrar el volumen la cookie vieja siguiera
siendo válida. No es un bug: la sesión se firma con `APP_SECRET` y no se guarda
en la base, así que borrar la base no la invalida. Lo anoto porque es
exactamente el tipo de cosa que conviene tener entendida y no descubrir en la
defensa.

### Declaración de uso de IA

Usé **Claude Code** como asistente. Fue asistida la escritura de los dos
Dockerfiles, los dos `.dockerignore`, los tres archivos de Compose, el
`nginx.conf`, el `.env.example` y el README, además de la redacción de esta
sección y de la del TP2 en `evidencias.md`.

No fue asistido el código de la aplicación —`packages/core`, `api`, `web` y
`worker`, incluidos los 79 tests— que es anterior a la materia. Tampoco lo
fueron las dos decisiones de fondo: elegir notia como app del semestre, y
partir el despliegue en dos niveles para sacar las dependencias de terceros del
camino crítico.

**Cómo lo verifiqué.** Nada de esto se dio por bueno por leerlo:

- **El stack levanta desde cero.** `docker compose down -v` y `up -d`, con las
  salidas guardadas en `evidencias.md`.
- **El sistema responde end-to-end**, a través de nginx: la SPA, el proxy al
  backend, la ruta protegida devolviendo 401 sin sesión, y el fallback del
  router del cliente.
- **La persistencia está probada en las dos direcciones**, y no por inspección
  del compose: creé un item real, corrí `down`, levanté y verifiqué que seguía;
  después `down -v`, levanté y verifiqué que la base estaba vacía.
- **La suite pasa entera en este repositorio**, no en el de origen: `pnpm test`
  → 79/79 y `pnpm typecheck` limpio después de traer el código.
- **La variante de registry se probó de verdad**: se publicaron las imágenes
  y se levantó el sistema con `docker-compose.registry.yml` después de borrar
  las imágenes locales, para forzar que las bajara del registry.
- **El build roto del `.dockerignore` lo encontró el build**, no la lectura del
  archivo.

Lo que **no** puedo declarar como verificado: no levanté el nivel completo
(`docker-compose.full.yml`) end-to-end, porque depende de una sesión de
WhatsApp viva y de consumo real contra OpenAI. De ése sólo validé la sintaxis
con `docker compose config`. Es coherente con la decisión del TP: la capa que
no se puede verificar en cualquier máquina es justamente la que saqué del
camino crítico.
