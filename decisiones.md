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

---

## TP3 — Planificación y trazabilidad

Proyecto: **https://github.com/users/mat1v1dal/projects/1** (público)

### La duración del sprint, y por qué

**Una semana.**

El calendario de la materia ya impone un ritmo semanal: cada clase presenta un
práctico y se espera que esté cerrado para la siguiente. Un sprint de dos
semanas abarcaría dos prácticos, así que la revisión de fin de sprint caería en
la mitad del trabajo de uno de ellos y no serviría para decidir nada.

El criterio general: **el sprint tiene que terminar cuando hay algo que
mostrar.** Acá eso pasa cada semana. En un equipo con releases quincenales, dos
semanas sería lo correcto por la misma razón, no por costumbre.

### El límite de trabajo en progreso, y por qué

**Dos.**

La regla de arranque de la guía es «cantidad de personas más uno», y trabajando
solo eso da dos. El «más uno» no es holgura arbitraria: es la válvula para
cuando algo queda esperando —una revisión, una corrida de CI, una respuesta— y
necesitás avanzar en otra cosa sin abandonar lo primero.

Poner tres sería mentirme: con una sola persona, tres cosas «en progreso»
significa que dos están detenidas y el tablero deja de reflejar la realidad. Un
límite que nunca se alcanza no limita nada — y ésa es justamente la señal de
que está demasiado alto.

Y el límite se alcanzó de verdad durante el práctico: mientras la tarea #19
estaba en curso, *In Progress* tenía dos items —la historia #18 y esa tarea— o
sea, exactamente el tope. Al cerrarse #19 el tablero bajó a uno. Un límite que
se roza es un límite que sirve.

### Diagnóstico de la historia mal escrita

La historia del ejercicio es:

> *Como desarrollador quiero crear la tabla usuarios para guardar los datos.*

**Por qué está mal**: es una **tarea disfrazada de historia**. El beneficiario
es el propio desarrollador, así que no describe valor para nadie; y «crear la
tabla usuarios» es un **paso de implementación**, no un resultado observable. No
se puede verificar que esté bien hecha sin mirar el esquema de la base — y una
historia se verifica por lo que el usuario puede hacer, no por cómo está
construida por dentro. Además arrastra la solución al enunciado: fija que la
respuesta es una tabla, cuando eso es una decisión técnica que debería quedar
abierta.

**Cómo la reescribiría**:

> *Como visitante quiero registrarme con mi email y contraseña para poder
> guardar mis notas y recuperarlas desde otro dispositivo.*
>
> Criterios de aceptación:
> - No se puede registrar dos veces el mismo email
> - Una contraseña de menos de 8 caracteres es rechazada con un mensaje claro
> - Después de registrarme, entro con esas credenciales y veo mis notas

Ahora el beneficiario es alguien real, el valor está explícito, y los tres
criterios se comprueban desde afuera sin saber si hay una tabla, dos o un
documento. La tabla de usuarios sigue haciendo falta — pero es una **tarea**
hija de esta historia, que es exactamente el lugar donde va.

### Por qué el bug no cuelga de la jerarquía

El bug #21 está **al costado**, no colgando de la historia.

La jerarquía cuenta **lo que planificaste construir**: la épica es el objetivo,
la historia el valor a entregar, las tareas los pasos. Un bug es un defecto de
algo **ya entregado** — no era parte del plan, así que no pertenece al árbol.
Colgarlo de la historia que lo originó tendría además un efecto feo: esa
historia ya está cerrada, y su barra de progreso pasaría a mentir.

El matiz que importa es **cuándo** aparece el defecto. Si lo encuentro mientras
la historia está en curso, no es un bug: es que la historia todavía no cumple
sus criterios de aceptación, y se arregla adentro. Una historia con defectos no
está terminada. El bug que entrego es del otro caso: algo que ya funcionaba y
se rompió.

### La trazabilidad, y por qué importa

La cadena quedó cerrada de punta a punta:

```
tarea  #19  Escribir el workflow de build y tests          [CLOSED]
  ↑ cerrada por PR #22, commit 6a7c595
  └─ historia #18  CI: build y tests automáticos en cada PR
       └─ épica  #17  EPIC: Pipeline DevOps completo para mi app
```

El PR llevaba `Closes #19` en el cuerpo, así que al mergearse **cerró el issue
solo**. Nadie tuvo que acordarse de ir a mover una tarjeta, y eso es el punto:
un tablero que hay que actualizar a mano deja de reflejar la realidad apenas
alguien se olvida una vez.

Lo que esto compra en serio: dentro de seis meses, parado en cualquier línea de
`ci.yml`, se puede subir del commit al PR, del PR a la tarea, de la tarea a la
historia y de ahí a la épica — y recuperar **por qué** ese archivo existe. Es
la diferencia entre un repositorio que se puede mantener y uno que hay que
adivinar.

### Sobre el contenido de la jerarquía

La historia #18 —*que cada PR ejecute build y tests*— describe exactamente el
pipeline que construí en el TP4. No es un ejemplo inventado para llenar el
tablero: la tarea #19 se cerró documentando el workflow que existe, y sus
criterios de aceptación se pueden verificar hoy contra el repositorio.

Dos de los cuatro criterios ya se cumplen (el workflow corre en cada PR, y el
badge está en el README). Los otros dos —que un test que falla bloquee el
merge, y el reporte de tests como artefacto— **todavía no**: el pipeline hoy
verifica tipos y builds, pero no corre tests. Por eso la historia queda
**abierta** y la tarea #20 en *Todo*: son trabajo del TP5.

Que la historia esté a medio cumplir no es un descuido — es lo que hace que el
tablero diga la verdad.

### Problemas encontrados

**El sprint no se puede crear por API.** Verifiqué que la API GraphQL de GitHub
no expone ninguna mutation para iteraciones: `createProjectV2Field` con
`dataType: ITERATION` crea el campo pero con `duration: 0` y sin iteraciones, y
no hay forma de completarlas. La configuración del sprint es sí o sí por la
interfaz web. Lo mismo el límite de trabajo en progreso y la automatización del
tablero, que son propiedades de la **vista** y no del proyecto.

Es una limitación real de la plataforma y conviene saberla: todo lo demás del
TP —labels, issues, jerarquía de sub-issues, estados del tablero, el PR que
cierra el issue— sí se scriptea, y quedó scripteado.

**`gh` no tenía el flag de sub-issues.** La versión instalada es la 2.83 y
`--add-sub-issue` llegó en la 2.94. En vez de actualizar `gh` a mitad de una
entrega, armé la jerarquía con la API REST
(`POST /repos/{owner}/{repo}/issues/{n}/sub_issues`), que además pide el **id**
del issue y no su número — un detalle que cuesta un rato descubrir.

### Declaración de uso de IA

Usé **Claude Code** como asistente. Fue asistida la creación de los labels, los
cinco issues, la jerarquía de sub-issues por API, el proyecto y los estados del
tablero, el PR de trazabilidad, y la redacción de esta sección.

No fueron asistidas las dos decisiones que el práctico pide justificar: la
duración del sprint y el número del límite de trabajo en progreso. Tampoco el
diagnóstico de la historia mal escrita ni su reescritura.

**Cómo lo verifiqué.** Todo lo de esta sección se comprobó contra la API, no
por captura:

- **La jerarquía es navegable**, consultada por GraphQL: desde la tarea #19 se
  llega a `parent` #18 y a `parent.parent` #17. Son sub-issues reales, no
  task-lists.
- **El issue se cerró solo**: consulté el `ClosedEvent` de #19 y su `closer` es
  el PR #22 con `merged: true`, y de ahí al commit `6a7c595`.
- **El tablero tiene dos items en progreso**, que es el límite declarado.
- **El proyecto es público**, condición que el enunciado marca como no opcional.

- **La automatización «cerrar → Done» funciona**, y no hubo que configurarla:
  los proyectos nuevos la traen activa. Al mergearse el PR #22, el issue #19 se
  cerró solo y su tarjeta pasó de *In Progress* a *Done* sin que nadie la
  tocara. Lo comprobé listando el tablero después del merge.

Lo que **no** puedo declarar como verificado por mí: la configuración del
sprint y el límite de trabajo en progreso como propiedad de la vista se cargan
por la interfaz web, porque la API no los expone. Se ven en el proyecto
público.

---

## TP4 — CI: Pipelines as Code

### Estructura del pipeline

Tres jobs, sin dependencias entre sí, así que **corren en paralelo**:

| Job | Qué hace |
|---|---|
| `Typecheck` | `pnpm typecheck` sobre los cuatro paquetes |
| `Build imagen del backend` | construye con `Dockerfile.api` |
| `Build imagen del frontend` | construye con `Dockerfile.web` |

Corren en paralelo porque **no dependen uno del otro**: ninguno consume la
salida del anterior. Poner `needs:` entre ellos haría que el tiempo total
fuera la suma en vez del máximo, sin ganar nada. Los dos builds arrancaron a
las 18:05:54 exactamente, y eso está en `evidencias.md`.

Lo que **no** comparten dos jobs es todo: cada uno corre en una máquina
virtual limpia, con su propio checkout y su propio filesystem. Si el frontend
necesitara un artefacto del backend, habría que publicarlo con
`actions/upload-artifact` y bajarlo del otro lado. Lo único que comparten acá
es el cache, y por eso cada uno usa su propio `scope`.

### Por qué construye con mi Dockerfile en vez de compilar por su cuenta

Porque **el artefacto que se despliega tiene que ser el mismo que se
verifica**. Si el pipeline tuviera su propia receta —`npm ci && npm run
build`— estaría verificando algo distinto de lo que después se despliega, y
las dos definiciones se separarían con el tiempo sin que nadie se entere. El
día que fallara producción, el pipeline seguiría en verde.

Construir con el Dockerfile del TP2 hace que el pipeline verifique
exactamente la misma definición de build que el TP6 va a desplegar.

### Qué cachea, y qué pasa si desaparece

Cache de **capas de Docker**, con backend `type=gha` (el cache de GitHub
Actions), y un `scope` distinto por imagen para que el build de una no
invalide el de la otra. El job de typecheck además cachea el store de pnpm.

Se reutilizan las capas cuyas instrucciones y archivos de entrada no
cambiaron: en la práctica, la instalación de dependencias, que es la más cara.
Se rehacen desde el primer `COPY` cuyo contenido cambió y todas las que le
siguen — por eso los Dockerfiles copian los `package.json` y corren
`pnpm install` **antes** de copiar el código: si sólo cambió el código, la
capa de dependencias sobrevive.

Si el cache desaparece **no se rompe nada**: la corrida siguiente reconstruye
todo desde cero y tarda más. El cache es una optimización, nunca una
dependencia — un pipeline que no puede correr sin su cache está roto.

En la segunda corrida el log muestra **14 líneas `CACHED`**.

### El pipeline como gate

`main` exige ahora **dos** condiciones para aceptar un merge:

1. Que el cambio venga por pull request (TP1, sigue vigente).
2. Que los tres checks estén en verde.

Y sigue con `enforce_admins`, así que las dos me alcanzan también a mí.

**`strict: true`** significa que la rama tiene que estar **actualizada con
`main`** antes de mergear. Sin eso podría pasar lo siguiente: dos PRs verdes
por separado, cada uno probado contra un `main` viejo, que al integrarse se
rompen entre sí. Es el *semantic conflict*: no hay conflicto de texto, pero el
resultado no funciona. `strict` obliga a re-verificar contra el `main` actual.

### El bug que encontró el propio gate

Al romper el build a propósito me encontré con que **el pipeline pasaba en
verde igual**. El PR #14 importaba un módulo inexistente y los tres checks
daban `SUCCESS`.

La causa es la misma decisión de diseño que documenté en el TP2: el backend no
compila. Los `tsconfig` tienen `noEmit: true` y el código corre con `tsx`, así
que el Dockerfile sólo instala dependencias y copia archivos — **la imagen se
construye igual aunque el código esté roto**. El pipeline estaba verificando
el empaquetado, no el código.

Agregué el job `Typecheck`, que para este proyecto es el equivalente de
compilar. Con él, la secuencia funcionó como corresponde:

```
Typecheck: FAILURE  →  mergeStateStatus: BLOCKED
   ↓ fix
Typecheck: SUCCESS  →  mergeStateStatus: CLEAN  →  merge
```

Es la lección más útil del práctico: **un gate verde no significa nada si no
sabés qué está verificando.** El mío daba verde sobre código que no compilaba,
y sólo lo descubrí porque lo rompí a propósito. Un pipeline que nunca falló no
se sabe si funciona — igual que la protección de rama del TP1.

### Estrategia de branching, ahora con criterio

El TP1 me dio GitHub Flow como regla de la materia. Con el pipeline encima la
mantengo, y ahora puedo justificarla: ramas cortas que salen de `main` y
vuelven por PR, con `main` siempre desplegable.

La alternativa clásica es GitFlow, con ramas `develop` y `release` de larga
vida. No lo elijo porque su razón de ser es coordinar **entregas por lotes en
fechas fijas**, y acá cada merge a `main` puede ir a producción. Ramas de
larga vida además multiplican los conflictos —el TP1 me mostró por qué— y
retrasan la integración, que es exactamente lo que la integración continua
busca evitar.

### Problemas encontrados

**El gate verde sobre código roto**, arriba. Es el hallazgo del TP.

**El primer intento de romper el build no rompió nada.** Antes de entender la
causa asumí que un import inexistente haría fallar cualquier build. Verificar
la demostración del gate —en vez de darla por hecha— fue lo que expuso el
problema real.

### Declaración de uso de IA

Usé **Claude Code** como asistente. Fue asistida la escritura de
`.github/workflows/ci.yml`, la configuración de los required status checks por
API, y la redacción de esta sección y la del TP4 en `evidencias.md`.

No fue asistida la decisión de agregar el job de typecheck: surgió de ver que
el pipeline pasaba en verde sobre código roto, y de entender por qué.

**Cómo lo verifiqué.** Todo lo de esta sección se ejecutó:

- **El paralelismo**, contra los timestamps de los dos jobs: mismo segundo de
  arranque.
- **El cache**, contando las líneas `CACHED` del log de la segunda corrida: 14.
- **El gate**, con la secuencia completa: `Typecheck: FAILURE` →
  `mergeStateStatus: BLOCKED` → fix → `SUCCESS` → `CLEAN` → merge.
- **Los checks requeridos**, leyendo la protección de vuelta desde la API.

Lo que **no** puedo declarar como verificado: el pipeline todavía no corre los
tests. `pnpm test` existe y pasa 79/79 en local, pero incorporarlo al workflow
es el TP5 y no está dado. El pipeline de hoy verifica que el código tipa y que
las imágenes construyen — más de lo que había, menos de lo que va a haber.

---

## TP5 — Calidad automatizada: tests, cobertura y el umbral que frena un merge

Escrito *as-built*, con cada decisión al lado del enlace que la prueba.

### Las herramientas, fila por fila

El stack no es el de la cátedra (.NET + vitest): acá los dos lados son
TypeScript y los dos se testean con **vitest 3.2.7**.

| Lo que se pide | Acá |
|---|---|
| Dónde viven los tests | al lado del código: `algo.test.ts` |
| Parametrizado | `test.each` |
| Que la dependencia entre desde afuera | parámetro de la función (`fetchImpl`), con el real como default |
| Fabricar el doble | `vi.fn()` |
| Medir la cobertura | `@vitest/coverage-v8` |
| Umbral que rompe el build | `coverage.thresholds` en la config de cada lado |
| Qué entra en la cuenta | `coverage.include` / `coverage.exclude` |
| Reporte legible | `text` en consola, `html` y `lcov` como artefacto, `json-summary` para el Summary |

### Qué elegí testear y por qué eso

La suite ya tenía 79 tests sobre las reglas de negocio de `core` (items,
log de cambios, alcance del agente, scheduler, ingesta) contra una Postgres
real en memoria. Lo que **no** tenía era nada en las fronteras: los dos
módulos que salen a la red y la capa HTTP estaban en **0 %**.

Elegí ir ahí porque es donde un bug duele más:

- **`app.ts`, la capa HTTP** ([`app.test.ts`](packages/api/src/app.test.ts)):
  del otro lado están WhatsApp y el navegador. Un bug en «quién entra» es un
  webhook abierto o una API sin contraseña. Se prueba con `app.request` de
  Hono, sin socket: la apikey del webhook, la contraseña (tres variantes
  en un `test.each`), la cookie, un cuerpo que no es JSON, y el link de
  deshacer, que es el único camino **sin cookie** y por eso el más delicado.
- **`notifier.ts`** ([`notifier.test.ts`](packages/core/src/notifier.test.ts)):
  es el único módulo que *escribe* en WhatsApp. El assert que importa es
  que el destino sea **el chat propio** y nunca el grupo observado: si eso
  se invierte, el sistema le contesta a otra gente.
- **`api.ts`, el cliente del front** ([`api.test.ts`](packages/web/src/api.test.ts)):
  qué URL arma, cómo escapa un `@` en el path, y que un 401 se convierta en
  `SinSesion`, que es lo que la app usa para caer al login en vez de dejar
  pantallas a medias.
- **Las fuentes del texto en `evolution.ts`**: WhatsApp manda el texto en
  cinco campos distintos según sea un mensaje plano, uno con link o el
  caption de un adjunto. Es *una* regla con cinco formas de llegar: un
  `test.each`.
- **Los bordes de `agrupar` en `fecha.ts`**: la ventana de «Esta semana»
  cierra a los siete días exactos. Un caso a cada lado del borde
  (`18:00:00Z` → Esta semana, `18:00:01Z` → Después): si alguien cambia el
  `<=` por `<`, el primero se pone en rojo.

De 79 tests a 116 ([PR #26](https://github.com/mat1v1dal/notia-ingsoft3/pull/26)),
y después a 124 con los del PR de demostración.

### El refactor para poder mockear

Ni el notifier ni el cliente de la API se podían testear: los dos llamaban
al **`fetch` global**. No había por dónde meter un doble sin parchear el
global, que es frágil y se filtra entre tests.

El cambio fue el mismo de los dos lados: **la dependencia entra por
parámetro**, con el `fetch` real como default.

```ts
// antes                                      // después
createEvolutionNotifier(opts)                 createEvolutionNotifier(opts, fetchImpl = (url, init) => fetch(url, init))
export const api = { ... fetch(url) ... }     export function crearApi(fetchImpl) { ... }
                                              export const api = crearApi((url, init) => fetch(url, init))
```

Las vistas no cambian: siguen importando `api`. El default va envuelto en
una flecha y no como `crearApi(fetch)` a secas porque en el navegador
`fetch` llamado sin `window` como `this` tira *Illegal invocation*.

**Mock y stub, en mis tests.** El doble de `fetch` del test del notifier es
un **mock**: el assert es sobre *cómo lo llamaron* (`toHaveBeenCalledTimes`,
la URL, el header `apikey`, el `number` del body). El doble del test de
error es un **stub**: sólo devuelve un 500 y lo que se verifica es la
reacción del código, no la llamada.

### El umbral: el número, la métrica y por qué

Medido con la suite de hoy, antes de elegir:

| | Líneas | Ramas | Umbral elegido |
|---|---|---|---|
| Backend (`core` + `api` + `worker`) | 93,5 % (777/831) | **82,45 %** (188/228) | **90 líneas / 80 ramas** |
| Frontend (`web`, lógica pura) | 98,19 % (109/111) | **93,61 %** (44/47) | **95 líneas / 90 ramas** |

Va sobre **las dos métricas**, por dos motivos. El primero es que miden
cosas distintas: líneas dice *qué se ejecutó*, ramas dice *qué decisiones se
tomaron en los dos sentidos*. Un `if` cuya condición siempre fue verdadera
tiene el 100 % de sus líneas cubiertas y la mitad de sus ramas. El segundo
es de vitest 3: una función que ningún test llama **no suma ramas**, sólo
líneas sin cubrir. Con umbral únicamente de ramas, la demostración de abajo
no se habría puesto roja.

**Por qué esos números.** No están copiados: salen de la medición, con un
margen que yo decido.

- Backend, líneas 90: 3,5 puntos por debajo de lo medido, unas 30 líneas
  de margen. Suficiente para que un fix de cinco líneas no frene el merge
  por sí solo, insuficiente para que entre un módulo nuevo sin tests.
- Backend, ramas 80: casi al ras (2,45 puntos, 6 ramas). Es la métrica que
  más cuesta subir y la que más dice; la dejo tirante a propósito.
- Frontend, 95 / 90: la lógica es chica (111 líneas), así que cualquier
  función nueva sin tests mueve el número varios puntos. El umbral alto es
  lo que hace que una función de veinte líneas sin tests frene (abajo).

**Qué pasaría si mañana lo subo diez puntos.** Backend a 100 de líneas es
imposible sin tests sobre el `PATCH /api/items/:id`, el `PATCH` de chats y
el deshacer de una *edición* (líneas 101-137 y 178-190 de `app.ts`), que
son lo que hoy queda sin cubrir. Ramas a 90 pide cubrir las 10 ramas de
`scheduler.ts` y las 10 de `agent.ts` que faltan, casi todas `??` y `?.`
sobre nulos que la base no produce. Es trabajo, no magia, y el reporte dice
exactamente cuál.

### Qué dejé afuera de la cuenta, y por qué

Todo está en los `exclude` de [`vitest.backend.config.ts`](vitest.backend.config.ts)
y [`vitest.web.config.ts`](vitest.web.config.ts), comentado ahí mismo.

| Afuera | Por qué |
|---|---|
| `api/src/index.ts`, `worker/src/index.ts` | El arranque: leen variables de entorno y encienden el servidor o el loop. Se verifican levantando el stack (TP2), no con unit tests. |
| `core/src/schema.ts`, `db.ts`, `index.ts` | Definición de datos, tipos y re-exports. No hay lógica que pueda fallar. |
| `core/src/testing.ts` | Es infraestructura **de** los tests (la Postgres en memoria). Contarla sería medirse a uno mismo. |
| `core/src/connect.ts` | La conexión real a Postgres y el `migrate` al arrancar. Se prueba con `docker compose up`. |
| `worker/src/openai-client.ts` | Adaptador fino al SDK de OpenAI: traduce argumentos. Lo que tiene lógica —el mapeo de la respuesta— está en `openai-mapping.ts` y **sí** se mide. |
| `web/src/**/*.tsx` | Componentes React. Los unit tests del front son sin DOM, y la interfaz se verifica end-to-end contra la app desplegada en el TP7. |
| `migrations/` | Generado por drizzle-kit. |

Lo que **no** dejé afuera y podría haber tentado: `app.ts`. Es la capa
HTTP, y sacarla habría subido el número del backend a 96 %. Pero es donde
está la autenticación; excluirla sería mentirse.

### El ejercicio del camino sin cubrir

Abrí el reporte del frontend
([`coverage/frontend/index.html`, artefacto `cobertura-frontend`](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38514715113))
y elegí la rama de código marcada en `fecha.ts`, línea 94:

```ts
const porFecha = (a: T, b: T) =>
  new Date(a.dueAt ?? 0).getTime() - new Date(b.dueAt ?? 0).getTime();
```

1. **Qué línea es.** El `?? 0`: la rama que se recorre cuando `dueAt` es
   `null`.
2. **Qué entrada la recorrería.** Ninguna. `porFecha` sólo ordena los
   cubos que no son «Sin fecha», y un item con `dueAt: null` va siempre a
   ese cubo, que no se ordena. Para llegar a ese `?? 0` habría que meter
   un item sin fecha en el cubo «Hoy», y el `if (!item.dueAt)` de arriba
   lo impide.
3. **Qué decidí.** No agregué el test, porque no existe la entrada. El
   `?? 0` está porque el tipo dice `string | null` y el compilador exige
   tratarlo; la alternativa es un `!` que le promete al compilador algo
   que el código ya garantiza. Lo dejo: prefiero un `?? 0` inerte a un
   `!` que, si alguien reordena el `if`, pasa a ser una excepción.

### Por qué cobertura alta no garantiza calidad: mi ejemplo

Este test suma cobertura y no verifica nada:

```ts
test("notifier", async () => {
  await createEvolutionNotifier(OPCIONES, async () => respuesta(201)).send("hola");
});
```

Ejecuta el 100 % de las líneas del camino feliz de `notifier.ts`. Si mañana
alguien cambia `number: opts.destinoJid` por `number: opts.instance` —y el
aviso empieza a salir a cualquier lado—, sigue verde. El test real
([`notifier.test.ts`](packages/core/src/notifier.test.ts)) tiene el assert
sobre el body de la llamada, y es *eso* lo que se pondría en rojo.

Cobertura mide *qué se ejecutó*, no *qué se comprobó*. Un 80 % de
cobertura quiere decir que el 80 % de las líneas corrieron bajo algún test;
cuántas de ésas tienen un assert que las vigile, no lo dice. La manera de
comprobarlo es invertir una regla y ver si algo se pone en rojo —el criterio
del enunciado—, o automatizarlo con *mutation testing*.

### El Pull Request bloqueado, y el que queda abierto

**La secuencia completa: [PR #28](https://github.com/mat1v1dal/notia-ingsoft3/pull/28).**

`ItemFila` llamaba a `new URL(item.url)` en el render. El agente copia la
URL de un mensaje de WhatsApp, y si lo que llega no es una URL válida, la
excepción subía por React y vaciaba la lista entera. Es un bug real, y el
fix es una función nueva, `etiquetaDeEnlace`, con seis caminos adentro.

1. **Primer push: la función, sin tests.** Compila, y los 116 tests pasan.
   El check **`Tests y cobertura del frontend`** se pone en rojo igual.
   [Corrida roja](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38514922263),
   y el log lo dice con todas las letras:

   ```
   Tests  22 passed (22)
   All files  |   85.15 |    93.75 |   78.94 |   85.15 |
    enlace.ts |       0 |      100 |     100 |       0 | 10-30
   ERROR: Coverage for lines (85.15%) does not meet global threshold (95%)
   ```

   Frenó por **líneas**: 85,15 contra 95. Las ramas **no se movieron**
   (93,75 %): es el comportamiento de vitest 3 que anticipa la guía, una
   función que nadie llama no suma ramas. Con umbral sólo de ramas, este
   PR habría pasado.

2. **Los tests que faltaban**
   ([`enlace.test.ts`](packages/web/src/enlace.test.ts)): uno por camino
   que la función declara —sin link, vacío, válido, con `www.`, roto, y el
   recorte en su borde exacto—. Ocho tests, porque tres entradas del
   primer caso van en un `test.each`.
   [Corrida verde](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38515101084):
   98,43 % de líneas, 94,91 % de ramas.

3. Merge.

**El freno vigente, en rojo: [PR #30](https://github.com/mat1v1dal/notia-ingsoft3/pull/30).**
Abierto desde `main` después del merge del #28, con otra función sin tests
(`normalizarConsulta`, en `busqueda.ts`), y queda así hasta la defensa.
[Su corrida](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38518588089)
frena por líneas, 94,02 % contra 95, y el estado de merge es `BLOCKED`:
el check es obligatorio, así que el botón de merge está apagado.

### Por qué este freno es distinto del del TP4, y qué deja pasar igual

El gate del TP4 frena cuando **la máquina dice que algo no anda**: no tipa,
la imagen no construye. El de esta semana frena por **un criterio que
escribí yo**: el código del PR #28 compilaba y pasaba todos los tests, y
quedó bloqueado por un número que elegí dos secciones más arriba. Es la
primera vez en el semestre que lo que frena no es un error sino una
política.

Lo que ninguno de los tres guardianes de `main` detecta: que el código haga
**lo que se pidió**. Un test verifica lo que el autor creyó que había que
verificar; la cobertura, que ese test pasó por ahí; el typecheck, que los
tipos cierran. Si `etiquetaDeEnlace` tuviera que mostrar el path y no el
dominio, los tres estarían verdes. Eso lo ve una revisión de código —y
hoy una parte la puede hacer un agente de IA: leer el PR contra el issue,
señalar un assert que no verifica nada, un caso de borde que falta. Lo que
queda afuera aunque lo use: **decidir si el comportamiento es el correcto**
para el usuario, porque eso no está escrito en ningún lado del repo.

### Por qué los tests no corren adentro del Dockerfile

La guía pone la suite en una etapa intermedia de la imagen, y el pipeline
la construye con `target` y la corre con `docker run`. Lo evalué y lo
descarté: el backend no compila (corre TypeScript con `tsx`) y el toolchain
de tests vive en las `devDependencies` de la raíz del monorepo, no en
ninguna imagen. Meterlo habría sido agregar una etapa, un `target`, un
`docker run` y un volumen montado para terminar ejecutando el mismo
`pnpm cov:backend`. El principio que la guía defiende —**una sola receta,
la misma en local y en CI**— se cumple igual: la receta está en
`package.json`, y el pipeline la invoca sin saber qué hay adentro. Está
contado también en [`.github/workflows/README.md`](.github/workflows/README.md).

### Problemas encontrados

**Un check en rojo que no es *required* no frena nada.** Cuando el PR #28
se puso rojo, su estado de merge era `UNSTABLE`, no `BLOCKED`: los dos
checks nuevos todavía no estaban en la lista de *required status checks* de
`main`, que seguía exigiendo sólo los tres del TP4. El rojo era visible y
no bloqueaba. Se resolvió agregando los dos nombres a la protección por API
(como en el TP4), recién **después** de que el PR #26 entrara: un check
*required* que ningún workflow reporta deja el PR esperando para siempre.
La diferencia se ve en los dos PRs de demostración: el #28, rojo antes del
cambio, decía `UNSTABLE`; el #30, rojo después, dice `BLOCKED`.

**`projects` de vitest exige nombres únicos.** Las dos configs heredaban el
`name` del `package.json` de la raíz y vitest se negaba a arrancar:
*Project name "notia" is not unique*. Un `name` por config.

**`fetch` suelto en el navegador.** `crearApi(fetch)` funciona en Node y
tira *Illegal invocation* en Chrome, porque `fetch` necesita `window` como
`this`. De ahí la flecha en el default.

**`res.json()` es `unknown` en Hono.** Los tests de `app.ts` necesitan un
cast por respuesta para que el typecheck cierre. Es correcto que sea
`unknown`: la respuesta es texto hasta que alguien la valida.

### Declaración de uso de IA

Usé **Claude Code** como asistente. Fue asistida la escritura de los tests
nuevos (`notifier.test.ts`, `api.test.ts`, `app.test.ts`, `enlace.test.ts`,
los `test.each` de `evolution.test.ts` y `fecha.test.ts`), los dos refactors
para inyectar `fetch`, las dos configs de vitest, los jobs nuevos de
`ci.yml`, el script del Summary, `etiquetaDeEnlace`, y la redacción de esta
sección.

No fue asistida la elección de **qué** testear (las fronteras, por el
razonamiento de arriba) ni los números del umbral, que salen de la medición.

**Qué verifica cada assert, y qué no está cubierto.** Lo escribí test por
test al lado de cada uno, y en la sección de qué elegí testear. Lo que queda
sin cubrir lo dice el reporte: en `app.ts`, el `PATCH` de items y de chats y
el deshacer de una edición; en `api.ts`, `crear` y `editar`; en `core`, las
ramas de nulos de `scheduler.ts` y `agent.ts`.

**Cómo lo verifiqué.** Todo lo de esta sección se ejecutó:

- La suite y el typecheck, en local, en cada paso: 116 y después 124 tests
  en verde, typecheck limpio.
- La cobertura, en local y en CI, con los números de arriba; en CI,
  [la corrida del PR #27](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38514715113)
  dejó los artefactos `cobertura-backend` y `cobertura-frontend`.
- Que el umbral **frena de verdad**, dos veces: en local, forzando un umbral
  de 99 % por línea de comando (`exit 1` con el `ERROR: Coverage…`), y en CI
  con el PR #28.
- El script del Summary, en sus tres salidas: tabla, archivo inexistente,
  cero archivos medidos.

Lo que **no** puedo declarar como verificado: la tabla del Summary en la
página del run la vi en local (es lo que imprime el script), pero la página
de la corrida no se puede leer sin sesión desde fuera. Queda para abrirla a
mano antes de la defensa.
