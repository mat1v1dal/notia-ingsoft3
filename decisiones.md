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

Lo escribí después de hacerlo (*as-built*), con el enlace de cada cosa al
lado.

### Las herramientas

Mi stack no es el de la cátedra. Los dos lados son TypeScript y los dos se
testean con vitest 3.2.7, así que la tabla de la guía me queda así:

| Lo que se pide | Cómo lo hice |
|---|---|
| Dónde viven los tests | al lado del código, `algo.test.ts` |
| Parametrizado | `test.each` |
| Que la dependencia entre desde afuera | un parámetro (`fetchImpl`) con el `fetch` real como default |
| El doble | `vi.fn()` |
| Medir la cobertura | `@vitest/coverage-v8` |
| Umbral que rompe el build | `coverage.thresholds` en la config de cada lado |
| Qué entra en la cuenta | `coverage.include` y `coverage.exclude` |
| Reporte | `text` en consola, `html` y `lcov` como artefacto, `json-summary` para el Summary |

### Qué testeé y por qué

Ya tenía 79 tests sobre las reglas de `core` (items, el log de cambios, el
alcance del agente, el scheduler, la ingesta), que corren contra un Postgres
en memoria. Pero los dos módulos que salen a la red y la capa HTTP estaban
en 0 %, y ahí es donde un bug me duele más:

- `app.ts`, la capa HTTP ([`app.test.ts`](packages/api/src/app.test.ts)).
  Del otro lado están WhatsApp y el navegador, y un error en quién puede
  entrar es un webhook abierto o una API sin contraseña. Lo pruebo con
  `app.request` de Hono, sin levantar un servidor: la apikey del webhook, la
  contraseña (tres variantes en un `test.each`), la cookie, un cuerpo que no
  es JSON y el link de deshacer, que es el único camino sin cookie.
- `notifier.ts` ([`notifier.test.ts`](packages/core/src/notifier.test.ts)),
  el único módulo que escribe en WhatsApp. Lo que verifico es que el aviso
  vaya a mi chat y nunca al grupo que estoy observando. Si eso se invierte,
  la app le escribe a otra gente.
- `api.ts`, el cliente del front ([`api.test.ts`](packages/web/src/api.test.ts)):
  qué URL arma, que escape el `@` del jid en el path, y que un 401 se
  convierta en `SinSesion`, que es lo que usa la app para volver al login.
- `evolution.ts`. WhatsApp manda el texto en cinco campos distintos según
  sea un mensaje común, uno con link o el caption de un adjunto. Es una
  sola regla con cinco formas de llegar, así que va en un `test.each`.
- `agrupar` en `fecha.ts`. La ventana de «Esta semana» cierra a los siete
  días exactos, y puse un caso a cada lado del borde (`18:00:00Z` y
  `18:00:01Z`). Si alguien cambia el `<=` por `<`, el primero falla.

Con eso pasé de 79 tests a 116 ([PR #26](https://github.com/mat1v1dal/notia-ingsoft3/pull/26)),
y después a 124 con los del PR de demostración.

### El refactor para poder mockear

El notifier y el cliente de la API llamaban al `fetch` global, y no había
forma de meter un doble sin pisar el global (que además se filtra de un test
a otro). Hice lo mismo en los dos: el `fetch` entra por parámetro y el real
queda como default.

```ts
// antes                                      // después
createEvolutionNotifier(opts)                 createEvolutionNotifier(opts, fetchImpl = (url, init) => fetch(url, init))
export const api = { ... fetch(url) ... }     export function crearApi(fetchImpl) { ... }
                                              export const api = crearApi((url, init) => fetch(url, init))
```

Las vistas no se enteran, siguen importando `api`. El default va envuelto en
una flecha porque `crearApi(fetch)` a secas anda en Node pero en el
navegador tira *Illegal invocation*: `fetch` necesita que `this` sea
`window`.

En el mismo archivo tengo los dos tipos de doble. El del test que verifica
el envío es un mock, porque lo que afirmo es cómo lo llamaron
(`toHaveBeenCalledTimes`, la URL, el header `apikey`, el `number` del body).
El del test de error es un stub: devuelve un 500 y lo que miro es qué hace
mi código con eso.

### El umbral

Primero medí la suite como estaba:

| | Líneas | Ramas | Umbral |
|---|---|---|---|
| Backend (`core`, `api`, `worker`) | 93,5 % (777/831) | 82,45 % (188/228) | 90 líneas, 80 ramas |
| Frontend (la lógica de `web`) | 98,19 % (109/111) | 93,61 % (44/47) | 95 líneas, 90 ramas |

Puse umbral en las dos métricas. Líneas dice qué se ejecutó y ramas dice si
cada decisión se tomó para los dos lados: un `if` que siempre dio verdadero
tiene todas sus líneas cubiertas y la mitad de sus ramas. Y en vitest 3 una
función que ningún test llama no suma ramas, sólo líneas sin cubrir, así que
con umbral únicamente de ramas mi PR de demostración habría pasado.

Los números salen de la medición, con un margen:

- En el backend, 90 de líneas deja unas 30 líneas de margen. Un arreglo de
  cinco líneas sin test no frena el merge, un módulo nuevo sin tests sí.
- 80 de ramas queda casi al ras (6 ramas de margen), porque es la métrica
  que más cuesta subir.
- En el front la lógica tiene 111 líneas, así que cualquier función sin
  tests mueve el número varios puntos. Por eso 95 y 90.

Si mañana lo subiera diez puntos, el backend no llegaría. Lo que hoy queda
sin cubrir es el `PATCH` de items y de chats y el deshacer de una edición
(líneas 101 a 137 y 178 a 190 de `app.ts`), y para ramas faltan unas 10 en
`scheduler.ts` y otras 10 en `agent.ts`, casi todas `??` y `?.` sobre nulos
que la base nunca devuelve. Se puede, pero son tests que hay que escribir.

### Qué dejé afuera de la cuenta

Está en los `exclude` de [`vitest.backend.config.ts`](vitest.backend.config.ts)
y [`vitest.web.config.ts`](vitest.web.config.ts), con un comentario en cada
línea.

| Afuera | Por qué |
|---|---|
| `api/src/index.ts`, `worker/src/index.ts` | El arranque: leen variables de entorno y prenden el servidor o el loop. Eso se prueba levantando el stack. |
| `core/src/schema.ts`, `db.ts`, `index.ts` | Tablas, tipos y re-exports, sin lógica. |
| `core/src/testing.ts` | Es la base en memoria que usan los tests. Contarla sería medirme a mí mismo. |
| `core/src/connect.ts` | La conexión real a Postgres y las migraciones al arrancar. Se prueba con `docker compose up`. |
| `worker/src/openai-client.ts` | Pasa argumentos al SDK de OpenAI. El mapeo de la respuesta, que es lo que tiene lógica, está en `openai-mapping.ts` y ese sí cuenta. |
| `web/src/**/*.tsx` | Los componentes. Los unit tests del front son sin DOM, y la interfaz la prueba la e2e del TP7. |
| `migrations/` | Lo genera drizzle-kit. |

`app.ts` lo dejé adentro aunque sacarlo subía el backend a 96 %. Ahí está la
autenticación, y excluirla para mejorar el número habría sido hacer trampa.

### El camino sin cubrir

En el reporte del front ([artefacto `cobertura-frontend`](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38514715113))
la rama marcada estaba en `fecha.ts`, línea 94:

```ts
const porFecha = (a: T, b: T) =>
  new Date(a.dueAt ?? 0).getTime() - new Date(b.dueAt ?? 0).getTime();
```

1. La rama es el `?? 0`, la que se toma cuando `dueAt` es `null`.
2. No hay entrada que la recorra. `porFecha` sólo ordena los grupos con
   fecha, y un item con `dueAt: null` siempre cae en «Sin fecha», que no se
   ordena. El `if (!item.dueAt)` de más arriba lo manda ahí antes.
3. No agregué test porque no existe el caso. El `?? 0` está porque el tipo
   es `string | null` y el compilador obliga a tratarlo. La otra opción era
   un `!`, y prefiero el `?? 0`: si alguien un día reordena el `if`, el `!`
   se convierte en una excepción y el `?? 0` no.

### Cobertura alta no es lo mismo que calidad

Este test sube la cobertura y no verifica nada:

```ts
test("notifier", async () => {
  await createEvolutionNotifier(OPCIONES, async () => respuesta(201)).send("hola");
});
```

Recorre todo el camino feliz de `notifier.ts`. Si alguien cambia
`number: opts.destinoJid` por `number: opts.instance` y los avisos empiezan
a salir a cualquier lado, sigue en verde. El test que de verdad tengo
([`notifier.test.ts`](packages/core/src/notifier.test.ts)) afirma sobre el
body de la llamada, y ése sí se pondría en rojo.

Un 80 % de cobertura quiere decir que el 80 % de las líneas corrieron bajo
algún test, pero no cuántas tienen un assert que las controle. Para saberlo
hay que invertir una regla y ver si algo falla, que es el criterio del
enunciado, o usar mutation testing.

### El PR bloqueado y el que queda abierto

La secuencia completa está en el [PR #28](https://github.com/mat1v1dal/notia-ingsoft3/pull/28).
`ItemFila` hacía `new URL(item.url)` al dibujar cada fila. El agente copia
la URL de un mensaje de WhatsApp, y si lo que llegaba no era una URL válida
la excepción vaciaba la lista entera. El arreglo fue una función nueva,
`etiquetaDeEnlace`, con seis caminos.

1. La subí sin tests. Compilaba y pasaban los 116 tests, y el check
   `Tests y cobertura del frontend` quedó en rojo igual
   ([corrida](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38514922263)):

   ```
   Tests  22 passed (22)
   All files  |   85.15 |    93.75 |   78.94 |   85.15 |
    enlace.ts |       0 |      100 |     100 |       0 | 10-30
   ERROR: Coverage for lines (85.15%) does not meet global threshold (95%)
   ```

   Frenó por líneas, 85,15 contra 95. Las ramas quedaron en 93,75 %, que es
   lo de vitest 3: la función que nadie llama no suma ramas.

2. Agregué un test por camino en [`enlace.test.ts`](packages/web/src/enlace.test.ts)
   (sin link, vacío, válido, con `www.`, roto, y el recorte justo en el
   borde). Son ocho porque el primer caso tiene tres entradas en un
   `test.each`. La [corrida](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38515101084)
   dio 98,43 % de líneas y 94,91 % de ramas.

3. Merge.

El que queda abierto y en rojo hasta la defensa es el [PR #30](https://github.com/mat1v1dal/notia-ingsoft3/pull/30).
Lo abrí desde `main` después del merge del #28, con otra función sin tests
(`normalizarConsulta`, en `busqueda.ts`). [Su corrida](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38518588089)
frena por líneas, 94,02 contra 95, y el PR está `BLOCKED`.

### En qué se diferencia del freno del TP4

El gate del TP4 frenaba cuando algo no andaba: no tipaba o la imagen no
construía. El del #28 compilaba y pasaba todos los tests, y lo frenó un
número que puse yo. Es la primera vez que lo que bloquea es un criterio y
no un error.

Ninguno de los tres controles de `main` puede ver si el código hace lo que
se pidió. El test verifica lo que pensé que había que verificar, la
cobertura dice que el test pasó por ahí y el typecheck que los tipos
cierran. Si `etiquetaDeEnlace` tuviera que mostrar la ruta en vez del
dominio, los tres darían verde. Eso lo detecta una revisión. Parte de esa
revisión la puede hacer hoy un agente de IA (leer el PR contra el issue,
marcar un assert que no controla nada o un borde que falta). Lo que no
puede hacer es decidir si el comportamiento es el que quiere el usuario,
porque eso no está escrito en el repo.

### Por qué los tests no corren adentro del Dockerfile

La guía mete la suite en una etapa intermedia de la imagen y la corre con
`docker run`. En mi caso no tenía sentido: el backend no compila (corre
TypeScript con `tsx`) y las herramientas de test están en las
`devDependencies` de la raíz del monorepo. Hubiera agregado una etapa, un
`target`, un `docker run` y un volumen para terminar corriendo el mismo
`pnpm cov:backend`. Lo que la guía busca, que haya una sola receta para local
y CI, se cumple igual: la receta está en `package.json` y el pipeline la
llama. Está explicado también en [`.github/workflows/README.md`](.github/workflows/README.md).

### Problemas

Cuando el #28 se puso en rojo, el PR figuraba `UNSTABLE` y no `BLOCKED`. Los
dos checks nuevos todavía no estaban en los *required status checks* de
`main`, así que el rojo se veía pero no frenaba. Los agregué por API como en
el TP4, pero recién después de mergear el #26: si un check es obligatorio y
ningún workflow lo reporta, el PR se queda esperando para siempre. La
diferencia se ve comparando los dos PRs de demostración: el #28, rojo antes
del cambio, decía `UNSTABLE`, y el #30, rojo después, dice `BLOCKED`.

Las dos configs de vitest heredaban el nombre del `package.json` raíz y
vitest no arrancaba (*Project name "notia" is not unique*). Le puse un
`name` a cada una.

`crearApi(fetch)` andaba en los tests y fallaba en Chrome con *Illegal
invocation*. De ahí la flecha del default.

`res.json()` devuelve `unknown` en los tests de Hono, así que cada respuesta
lleva un cast. Lo dejé así porque es correcto: hasta que alguien la valida,
la respuesta no tiene tipo.

### Uso de IA

Trabajé con Claude Code. Escribió los tests nuevos (`notifier.test.ts`,
`api.test.ts`, `app.test.ts`, `enlace.test.ts` y los `test.each` de
`evolution.test.ts` y `fecha.test.ts`), los dos refactors para inyectar
`fetch`, las configs de vitest, los jobs de `ci.yml`, el script del Summary,
`etiquetaDeEnlace` y la primera versión de esta sección. También propuso
qué módulos testear y los umbrales, a partir de la medición. Yo hice los
merges y agregué los checks obligatorios en `main`.

Lo que queda sin cubrir lo dice el reporte: en `app.ts`, el `PATCH` de items
y de chats y el deshacer de una edición; en `api.ts`, `crear` y `editar`; en
`core`, ramas sobre nulos en `scheduler.ts` y `agent.ts`.

Lo verificamos corriéndolo:

- La suite y el typecheck en local en cada paso (116 y después 124 tests).
- La cobertura en local y en CI. [La corrida del PR #27](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38514715113)
  dejó los artefactos `cobertura-backend` y `cobertura-frontend`.
- Que el umbral frena: en local, forzando 99 % por línea de comando (sale
  con `exit 1` y el `ERROR: Coverage…`), y en CI con el #28.
- El script del Summary en sus tres salidas: la tabla, el archivo que no
  existe y cero archivos medidos.

---

## TP6 — CD: environments, aprobaciones y despliegue

Lo escribí después de hacerlo (*as-built*), con el enlace de cada cosa al
lado.

### Enlaces de este TP

| Qué | Dónde |
|---|---|
| Paquete del backend, público | https://github.com/users/mat1v1dal/packages/container/package/notia-api |
| Paquete del frontend, público | https://github.com/users/mat1v1dal/packages/container/package/notia-web |
| Cadena 1: corrida de un PR con todo en verde y «Entrar al registry» salteado | https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38643492664/job/116124921426 |
| Cadena 2: corrida de `main` donde «Construir y publicar» es el último paso | https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/38655686748/job/116199586127 |
| QA | http://201.32.128.192:8081 |
| PROD | http://201.32.128.192:8082 |
| El rechazo, con su motivo | https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/39550421779 |
| QA verde, esperando aprobación, aprobado, PROD verde | https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/39553490668 |
| Qué commit está en cada entorno y desde cuándo | https://github.com/mat1v1dal/notia-ingsoft3/deployments |

Las imágenes se bajan sin credenciales:

```bash
docker logout ghcr.io
docker pull --platform linux/amd64 ghcr.io/mat1v1dal/notia-api:sha-be53a80357ddbcb28bbacdc45abfeebd71d532bd
docker pull --platform linux/amd64 ghcr.io/mat1v1dal/notia-web:sha-be53a80357ddbcb28bbacdc45abfeebd71d532bd
```

### Por qué un VPS y no Render + Neon

Despliego en un VPS que ya tenía contratado en DonWeb (Ubuntu 24.04, 2
vCPU, 2 GB de RAM). El enunciado acepta «Render+Neon, tu nube, o el fallback
local». No corro nada en mi máquina: los dos entornos están en el servidor y
los despliega el pipeline.

El VPS además me resolvía algo que Render no. Render reconstruye la app desde
el repositorio, así que lo que corre en QA no es la imagen que verificó mi
pipeline sino otro build del mismo commit. Entre un build y otro pueden
cambiar la imagen base (`node:24-alpine` se actualiza), lo que baja npm o
cualquier cosa que el Dockerfile traiga de la red. En el VPS el pipeline
despliega la imagen que publicó, por su tag `sha-<commit>`, y no hay segundo
build.

Cada entorno es un proyecto de Compose aparte (`notia-qa` y `notia-prod`),
con su red, su Postgres y su volumen (`notia-qa_pgdata` y
`notia-prod_pgdata`). El compose es uno solo, [`deploy/compose.vps.yml`](deploy/compose.vps.yml),
y lo que cambia entre entornos está en el `.env` de cada carpeta del
servidor. El pipeline copia el compose desde el repo en cada deploy, así que
lo que corre es lo que está acá.

### Por qué sólo se publica lo que pasó la verificación

Del registry sale lo que se despliega. Si se publicara una imagen con los
tests en rojo, estar en el registry dejaría de querer decir que pasó la
verificación, y cualquier deploy podría llevar código roto a QA.

Lo garantizan tres cosas que ya tenía:

1. Nada entra a `main` sin los cinco checks en verde (TP4 y TP5).
2. Sólo `main` publica. El `push:` del build y el `if:` del login piden que
   el evento sea `push` y la rama `main`. En un PR construye y no sube nada:
   es la primera corrida de la tabla, con el login salteado.
3. El build no arranca si la verificación falló. Acá hice algo distinto de
   la guía, que pone tests y build en el mismo job y depende del orden de los
   pasos. Mis tests ya corrían en su propio job desde el TP5, con su check
   obligatorio, así que puse la condición en los `needs:` del job de build:
   si el typecheck o los tests fallan, el build ni empieza.

Lo que no cubre: yo puedo hacer un `docker push` a mano desde mi máquina y
entra igual. La cadena controla lo que publica el pipeline. Para cerrar eso
habría que desplegar por digest (el hash de la imagen) en vez de por tag,
porque un tag se puede mover a otra imagen y un digest no.

### Continuous Delivery

Lo que armé es Continuous Delivery. Todo lo que entra a `main` queda listo
para producción y llega solo a QA, pero a PROD sólo con mi aprobación.
Continuous Deployment sería sacar esa aprobación y que cada merge en verde
llegue directo a PROD.

Hoy no me animaría. Al cerrar este TP no tenía tests e2e (llegaron en el
TP7), ni métricas que me avisen si un deploy empeoró algo, y el rollback es
a mano. Con esas tres cosas, en una app que uso yo solo, la aprobación
aportaría poco y la sacaría.

### La cadena de jobs y los secrets

```
Typecheck ─┬─► Build backend ──┐
Tests back ┘                   ├─► Deploy a QA ─► Deploy a PROD
Typecheck ─┬─► Build frontend ─┘   environment:     environment:
Tests front┘                       qa (sin reglas)  production (required reviewer)
```

`Deploy a QA` necesita los dos builds, porque sin imagen publicada no hay
nada que desplegar, y tiene un `if:` para que sólo corra en un push a
`main`. `Deploy a PROD` necesita a QA y no repite el `if`: como en un PR QA
no corre, PROD tampoco.

Los dos usan la misma acción, [`desplegar-en-vps`](.github/actions/desplegar-en-vps/action.yml).
QA y PROD se despliegan con el mismo código, y lo que cambia es el
environment que la llama (y con él la clave, la carpeta y el puerto).

Se despliega `github.sha`, el commit de esa corrida. Una corrida puede
quedar horas esperando la aprobación, y mientras tanto `main` se puede
mover. Lo que apruebo es ese sha, y ese es el que sube.

Hay un `VPS_SSH_KEY` en cada environment, y son dos claves distintas. Las
dos entran como `notia-deploy`, un usuario del servidor sin root que está en
el grupo `docker`. La de PROD está en el environment `production`, así que
ningún job la puede leer sin que yo apruebe. Si estuviera como secret del
repo, cualquier job podría desplegar a PROD sin pasar por la aprobación.

Los secretos de la app (contraseña de la base, de la app, firma de la sesión
y token del webhook) no pasan por GitHub. Están en el `.env` de cada
entorno en el servidor, con permisos `600`, y el pipeline sólo cambia una
línea de ese archivo, `NOTIA_TAG`.

La huella del servidor (host key) está fija en la acción, para que el runner
no se conecte a cualquiera que conteste en esa IP.

### Qué miro antes de aprobar

1. Que QA esté en verde con el commit de esa corrida. El smoke lo verifica,
   pero además abro http://201.32.128.192:8081 y miro la versión en la
   barra.
2. Qué trae el PR. Si toca el compose, el `.env` o las migraciones, lo miro
   con más tiempo, porque un cambio en la base no se deshace con un rollback.
3. Que no haya una corrida más vieja esperando. Si apruebo una vieja después
   de una nueva, PROD vuelve para atrás. La vieja la rechazo.

Lo que no puedo ver al aprobar: si el cambio empeora algo que ninguna prueba
mira (el rendimiento, un flujo que el smoke no toca), ni cómo se comporta con
los datos de PROD, que no son los de QA. Para eso me faltaban métricas, que
llegaron en el TP9.

El rechazo está en la [primera corrida](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/39550421779).
Ese merge sólo agregaba el job de PROD y no cambiaba nada que se pudiera ver,
así que lo rechacé con este comentario: «este merge sólo agrega el job de
PROD, todavía no trae ningún cambio para el usuario. Espero el indicador de
versión (#35) para que el primer deploy a PROD sea algo que se pueda
comprobar en la pantalla». El job de PROD quedó en *failure*.

En la [siguiente](https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/39553490668)
ya estaba el indicador de versión (#35). QA pasó al primer intento, aprobé, y
PROD quedó con el commit `be53a80`, que se ve en la barra de la app.

### La misma imagen del front en los dos entornos

El `nginx.conf` del TP2 tenía escrito `http://notia-api:3000`. Ahora es una
plantilla, [`default.conf.template`](packages/web/default.conf.template),
que la imagen de nginx completa al arrancar con las variables de entorno.

| Llega por variable | Queda adentro de la imagen |
|---|---|
| `BACKEND_URL`, dónde está la API | los archivos de la SPA |
| `DNS_RESOLVER`, quién resuelve ese nombre | la plantilla de nginx |
| `PORT`, dónde escucha | el código de la API |
| `DATABASE_URL` y los secretos de la API | `GIT_COMMIT`, el commit del que salió |

Los valores por defecto del Dockerfile son los de compose, así que
`docker compose up` sigue andando igual que en el TP2. En el VPS los dos
entornos usan el mismo `BACKEND_URL`, porque cada proyecto de Compose tiene
su red y su propio `notia-api`. Si mañana los muevo a otra nube, cada front
apunta a su API cambiando esa variable.

### El smoke test

[`smoke.sh`](.github/scripts/smoke.sh) reintenta hasta 20 veces, cada 10
segundos, y falla el job si no se cumplen tres cosas:

1. Que `/salud` conteste. Lo cambié para que haga un `select 1` contra la
   base, porque antes devolvía `{ok:true}` aunque la base estuviera caída.
2. Que el front sirva la página.
3. Que el commit que informa `/salud` sea el que se desplegó. Sin esto, un
   deploy que dejó corriendo la versión anterior daría verde. La guía lo
   pone como opcional en el TP6; lo agregué igual porque es la única forma
   de saber desde afuera qué versión está corriendo.

Los reintentos son por los segundos que tarda el contenedor nuevo en estar
sano. El VPS no se duerme como Render, y en las corridas reales pasó al
primer intento.

El smoke no prueba que se pueda entrar con la contraseña, que las vistas
anden, ni que una migración haya dejado bien los datos. Eso lo cubre la e2e
del TP7.

### Las condiciones de mi servidor

No hay free tier, pero tiene sus límites:

- No hay cold start: los contenedores no se duermen.
- Son 2 GB de RAM que comparto con otro proyecto que ya corría en el
  servidor. Por eso cada servicio tiene `mem_limit` y Postgres está
  configurado chico (`shared_buffers=64MB`). Con los dos entornos arriba
  quedan unos 1,1 GB libres.
- No hay minutos de build: el servidor no construye, baja imágenes.
- El VPS vence el 29/10/2026 y hay que renovarlo para que las URLs sigan
  vivas.
- No hay HTTPS. Los puertos 80 y 443 los usa el Caddy del otro proyecto, así
  que los entornos van por IP y puerto. Eso me obligó a cambiar la cookie de
  sesión, que era `Secure` siempre: sobre http el navegador la descartaba y no
  se podía entrar. Ahora es `Secure` sólo cuando la conexión es https.

### Cómo comprobé que cada entorno tiene su base

Inserté un item `SOY PROD — prueba de separación de bases` sólo en la base
de PROD, con `psql`, y conté en las dos:

```
== qa    soy_prod=0  total=0   volumen notia-qa_pgdata
== prod  soy_prod=1  total=1   volumen notia-prod_pgdata
```

En la defensa lo muestro entrando a cada entorno: el item está en PROD y no
en QA.

### Qué patrón usaría con usuarios reales

Blue-green. Hoy el deploy recrea los contenedores y hay unos segundos sin
servicio. Con usuarios tendría dos proyectos de Compose de PROD, *blue* y
*green*, y el Caddy que ya está en el servidor apuntando a uno. El deploy
levanta el que está inactivo, le corre el smoke y recién ahí cambio el Caddy.
Para volver atrás alcanza con cambiarlo de nuevo, sin bajar imágenes.

Canary no me sirve hoy. Manda una parte del tráfico a la versión nueva y
decide mirando métricas, y yo no tengo ni métricas por versión ni tráfico
suficiente: la app la uso yo. Para hacerlo en serio necesitaría tasa de
errores y latencia por versión, y un balanceador que reparta por porcentaje.
Rolling tampoco, porque necesita varias réplicas y tengo una por entorno.

Con feature flags separaría el deploy del release. El indicador de versión
podría haber entrado apagado y prenderse sin desplegar. En notia los usaría
en el agente de WhatsApp, para probar un cambio en cómo extrae las fechas en
un solo chat antes de prenderlo en todos.

### El rollback, medido

Como despliego imágenes, volver atrás es desplegar el commit anterior, que ya
está en el registry. [`deploy/rollback.sh`](deploy/rollback.sh) cambia
`NOTIA_TAG`, hace `pull` y `up -d`, y cronometra hasta que `/salud`, desde
afuera, informa el commit pedido.

Lo probé sobre PROD, al deploy anterior (`a04616c`) y de vuelta a `be53a80`:

```
corriendo antes: be53a80…   inicio: 03:34:52   fin: 03:35:02   rollback de prod: 10 s
corriendo antes: a04616c…   inicio: 03:35:02   fin: 03:35:12   vuelta:           10 s
```

Tarda 10 segundos porque no hay que construir nada: baja una imagen que ya
existe y recrea dos contenedores. Si un deploy aprobado sale mal:

1. Miro en *Deployments* qué commit estaba antes en `production`.
2. Corro `deploy/rollback.sh prod <ese sha> <clave de PROD>`.
3. Abro PROD y controlo la versión en la barra.

Este camino no pasa por la aprobación. Es para emergencias y usa la clave de
PROD, que tengo sólo yo. La alternativa con aprobación es volver a correr el
job `Deploy a PROD` de la corrida anterior, que la pide de nuevo y sólo
funciona dentro de los 30 días.

El rollback no deshace los datos. Si el deploy malo corrió una migración que
borró o cambió una columna, volver la imagen no la recupera. Para eso
necesitaría migraciones reversibles o un backup antes de cada deploy.

La métrica DORA que mide esto es el tiempo de recuperación (*time to restore
service*).

### Si el VPS desaparece

Casi todo sigue igual: el CI, las imágenes en GHCR, los environments con la
aprobación, el smoke y el compose. Lo único atado a este servidor es la
acción de deploy (host, puerto y host key) y los `.env` de cada entorno. En
otra máquina con Docker son esas líneas y esos dos archivos.

### Problemas

El primer push al registry falló con `permission_denied: write_package`. Los
paquetes los había creado a mano en el TP2 con mi token, y no estaban
vinculados al repositorio. El `GITHUB_TOKEN` de una corrida sólo puede
escribir en paquetes que tengan acceso al repo. Lo arreglé en la
configuración de cada paquete (*Manage Actions access*, rol *Write*) y volví
a correr los dos jobs.

El SSH del servidor escucha en el puerto 5078 y el 22 estaba cerrado en el
firewall del proveedor. Lo abrí sin necesidad al principio. El pipeline usa
el 5078, con la huella fija, y el 22 se vuelve a cerrar.

El primer smoke falló con el deploy hecho: el job entró, bajó las imágenes y
QA quedó corriendo, pero desde afuera no se llegaba porque el 8081 estaba
cerrado en el firewall. Lo abrí, volví a correr el job y pasó al primer
intento. Es justo lo que el smoke tiene que atrapar: el deploy terminó y el
entorno no respondía.

El primer rechazo lo hice sin escribir el comentario. Volví a correr el job
(*Re-run failed jobs*), quedó esperando otra vez y lo rechacé con el motivo.
En la corrida se ven los dos.

Creé el tag `v6.0.0` sobre el commit que estaba en PROD antes de que entrara
esta sección, y la corrección se hace navegando el tag. Lo borré a los pocos
minutos y lo volví a crear sobre el commit de la documentación, una vez que
llegó a PROD.

### Uso de IA

Trabajé con Claude Code. Escribió los cambios del workflow (publicar, deploy
a QA y a PROD, la acción compartida), el compose del VPS, la plantilla de
nginx, el `/salud` con el commit, el smoke, el script de rollback, el
indicador de versión y la primera versión de esta sección. También configuró
el servidor por SSH: el usuario `notia-deploy`, una clave por entorno y los
`.env`.

La idea de usar el VPS en vez de Render fue mía. El rechazo y las
aprobaciones los hice yo desde GitHub; el texto del rechazo me lo propuso el
asistente.

Lo verificamos corriéndolo:

- La plantilla de nginx en Docker: la misma imagen genera
  `listen 80 / notia-api:3000` sin variables y otra configuración con ellas.
- El smoke contra el stack local: pasa con el commit correcto y falla con
  otro.
- La cadena del registry en las dos corridas de la tabla, y el
  `docker pull` sin credenciales.
- QA y PROD desplegados por el pipeline y consultados desde afuera: `/salud`
  responde con la base viva y el commit `be53a80` en los dos.
- La separación de las bases, con el item en una sola.
- El rollback, ida y vuelta, cronometrado.

No llegué a probar qué pasa con dos corridas esperando aprobación al mismo
tiempo (el `concurrency` evita dos deploys a la vez, pero no ordena las
aprobaciones), y blue-green está pensado pero no implementado.

---

## TP7 — Contenedores en el pipeline: integración y e2e como gate

Lo escribí después de hacerlo (*as-built*), con el enlace de cada cosa al
lado.

### Enlaces del TP7

| Qué | Dónde |
|---|---|
| Paquete del backend, con sus etiquetas `sha-…` | https://github.com/users/mat1v1dal/packages/container/package/notia-api |
| Paquete del frontend, con sus etiquetas `sha-…` | https://github.com/users/mat1v1dal/packages/container/package/notia-web |
| El commit que rompió la app | https://github.com/mat1v1dal/notia-ingsoft3/pull/41 |
| La corrida con integración verde, e2e roja y PROD sin arrancar | https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/39650049056 |
| Su reporte de integración, en verde | https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/39650049056/artifacts/12369720125 |
| Su reporte de e2e, en rojo, con captura y traza | https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/39650049056/artifacts/12370086025 |
| El arreglo | https://github.com/mat1v1dal/notia-ingsoft3/pull/42 |
| La corrida completa en verde hasta PROD, con la aprobación | https://github.com/mat1v1dal/notia-ingsoft3/actions/runs/39670758826 |
| QA | http://201.32.128.192:8081 |
| PROD | http://201.32.128.192:8082 |

### Los entornos ejecutan la imagen

Esta parte ya estaba resuelta desde el TP6, y fue una de las razones para
usar el VPS. Render reconstruye desde el repo; el VPS baja del registry la
imagen `sha-<commit>` y la ejecuta. Lo que corre en QA y en PROD es la misma
imagen que construyó y verificó el pipeline.

Mi ejemplo de por qué importa construir una sola vez: la imagen del backend
instala las dependencias durante el build y después corre TypeScript con
`tsx`. Si cada entorno construyera la suya, un `pnpm install` de un día y
otro de otro día podrían terminar distintos aunque el lockfile sea el mismo,
porque `node:24-alpine` se actualiza. QA y PROD correrían cosas distintas con
el mismo código, y con una sola imagen eso no puede pasar.

Desde afuera se comprueba de tres formas:

- `/salud` de cada entorno dice qué commit corre, y la barra de la app lo
  muestra.
- El log del deploy de cada corrida tiene el `pull` de
  `ghcr.io/mat1v1dal/notia-api:sha-<commit>` y el `docker compose ps` con esa
  imagen.
- *Deployments* dice qué commit está en cada entorno, y esa etiqueta existe
  en los dos paquetes.

En la defensa lo puedo mostrar en el servidor:

```bash
ssh notia-vps 'docker ps --format "{{.Names}}\t{{.Image}}" | grep notia'
```

El smoke sólo dice que el entorno contesta y con qué versión. Si se rompe el
botón de anotar sigue en verde, y eso es lo que muestra la corrida roja de
la tabla.

### Las etiquetas

`sha-<commit>` en el registry identifica qué imagen es. Hay una por commit y
la pone sólo el pipeline. `v7.0.0` en git marca qué commit estaba en PROD al
cerrar el TP, o sea cuál de todas esas imágenes es la entrega.

No publico `latest`, porque es una etiqueta que hoy apunta a una imagen y
mañana a otra. Un entorno que despliega `latest` no sabe qué está
corriendo, y un rollback a `latest` no vuelve a ningún lado.

Del tag a la imagen:

```bash
echo "sha-$(git rev-list -n1 v7.0.0)"   # la etiqueta en los dos paquetes
```

### Las dos suites

Las dos corren contra QA desplegado, sin mocks de la API, sin base en
memoria y sin `page.route`. Están en `packages/web/e2e/`.

La de integración (`api.spec.ts`) usa Playwright sin navegador y le habla a
la API por HTTP, con el Postgres de QA:

1. Crea un item, lo encuentra entre los abiertos, lo cierra y comprueba que
   ya no está.
2. Manda un item con el texto vacío, recibe un `400` y comprueba que no se
   creó nada.
3. Busca un item cerrado. La elegí porque la búsqueda es lo que me deja
   encontrar algo que ya pasó, y si se rompe pierdo esa memoria.

La e2e (`flujos.e2e.spec.ts`) usa un Chromium real:

1. Anoto algo, aparece, lo marco hecho y desaparece, también después de
   recargar.
2. Con una contraseña equivocada aparece «Esa contraseña no es.», no hay
   sesión y la API responde `401`.
3. Lo que anoté sigue ahí al recargar y lo encuentro buscando. Es lo que
   hago todos los días con la app: anotar y confiar en que va a estar. Si
   eso deja de andar, el que se queja soy yo.

notia no borra items, los cierra, y eso es a propósito desde el TP2 porque
cerrar se puede deshacer. Por eso cada prueba limpia cerrando lo que creó y
comprobando que ya no figura entre los abiertos. Cada una usa un texto con la
hora y un sufijo al azar, así no se mezclan los datos de dos corridas.

En la integración no hay nada de pantalla, eso es del navegador. En la e2e no
puse los bordes de la API (el texto vacío, buscar cerrados), porque por HTTP
son más rápidos y más precisos. Y ninguna repite lo que ya cubren los 137
unit tests, como la agrupación por fecha o la autenticación del webhook.
Muchos unit, pocas de integración y menos e2e.

Cómo leo el resultado de las dos juntas:

| Integración | E2E | Qué está roto |
|---|---|---|
| verde | verde | nada |
| verde | roja | el front: la API y la base andan |
| roja | roja | la API o la base |
| roja | verde | una regla de la API que la pantalla no usa |

En el #41 cambié el texto del botón de «Anotar» a «Agregar». Compilaba,
pasaban los 137 unit tests (ninguno mira ese texto) y la integración no lo
podía ver porque no usa navegador. La e2e no encontró el botón y PROD no
arrancó. Integración verde con e2e roja apuntaba al front, y era el front.

La integración ya había encontrado un bug antes, la primera vez que la corrí
contra QA: la API aceptaba items con el texto vacío. La pantalla no los
manda, así que ningún test del front lo podía ver. Ahora la API devuelve
`400`.

Mi integración es la amplia, contra la API ya desplegada, y no una API
levantada dentro del job. Así prueba la API con la base, la red y la
configuración reales de QA, que es lo que va a encontrar un usuario. A
cambio, si falla puede ser la red, tarda más, y comparte los datos con todas
las corridas. Por eso cada prueba crea y limpia lo suyo.

### Cold start y tests flaky

El VPS no se duerme, así que no tengo el cold start de Render. Lo que sí pasa
es que un contenedor recién recreado tarda unos segundos en estar sano: el
smoke espera eso antes de que corran las suites, y los timeouts son largos
(60 segundos por prueba y 15 por `expect`). Ninguna prueba se saltea si el
entorno no responde.

Un test flaky es uno que a veces pasa y a veces falla con el mismo código,
porque depende de un tiempo, del orden o de un dato que dejó otra prueba. En
CI hay un reintento, y si una prueba pasa en el segundo Playwright la marca
como *flaky* en el reporte, así que se ve. Corren de a una (un solo worker)
porque comparten QA.

### La cadena de jobs

```
… → Deploy a QA → Integración contra QA → E2E contra QA → Deploy a PROD
                                                          (required reviewer)
```

`integracion` necesita `deploy-qa`, `e2e` necesita `integracion` y
`deploy-prod` necesita `e2e`. En ese tramo no hay `continue-on-error`, ni
`|| true`, ni `if: always()`. Los reportes se suben aunque la prueba falle,
porque el `!cancelled()` está en el paso que sube el reporte y no en los jobs.
PROD recibe la misma imagen que QA: los dos deploys usan el sha de la corrida
y los dos smokes confirman el mismo commit.

### La misma imagen del front en QA y PROD

Viene del TP6: la plantilla de nginx lee `BACKEND_URL`, `DNS_RESOLVER` y
`PORT` al arrancar, y adentro de la imagen quedan los archivos de la SPA y la
plantilla. En el VPS cada entorno es un proyecto de Compose con su propia
red, así que `notia-api` resuelve a la API de ese entorno.

### Problemas

El PR de Dependabot que subía `hono` tocaba `pnpm-lock.yaml`, igual que el PR
de Playwright, y quedó en conflicto. No lo resolví a mano: le pedí a
Dependabot que rehiciera su rama sobre `main` comentando `@dependabot rebase`.

Cuando la e2e falla tarda mucho: cada click espera el botón hasta el timeout
de un minuto y después reintenta. La corrida roja tardó unos cuatro minutos
más que la verde. Prefiero eso a bajar los timeouts y que una demora de QA
parezca una rotura.

Dos merges seguidos: al mergear el #44 mientras la corrida del #40 todavía
estaba en curso, el workflow canceló la del #40. Es el `concurrency` que puse
en el TP4 con `cancel-in-progress: true`, que deja sólo la última corrida de
cada rama. Para el código está bien (la nueva incluye lo anterior), pero
también puede cancelar una corrida que está esperando mi aprobación. Desde
ahí no mergeo nada mientras haya una corrida esperando para PROD.

### Uso de IA

Trabajé con Claude Code. Escribió las dos suites, la configuración de
Playwright, los jobs del workflow, la validación del texto vacío en la API
con su test, la rotura y el arreglo del botón, y la primera versión de esta
sección. También propuso qué flujos probar. Yo hice los merges y aprobé los
deploys a PROD.

Cada prueba afirma sobre el dato que ella misma creó (su texto único) o sobre
el mensaje de error. No están cubiertos editar un item, el deshacer por link,
ni las vistas de chats y de log.

Las dos suites las corrimos primero a mano contra QA: la e2e pasó 3 de 3 y
la integración 2 de 3, porque QA todavía no tenía el arreglo del texto vacío.
Después están las corridas de la tabla: verde, roja por la rotura y verde
hasta PROD.

---

## TP8 — Infraestructura como Código

### El riel y los providers

Usé el plan C con el provider Docker, sobre el mismo VPS de QA y PROD. El
entorno `preprod` (Postgres, API y web, con las imágenes `sha-<commit>` del
registry) está declarado en [`infra/`](infra/), y se crea con
`terraform apply` y se borra con `terraform destroy`. No usé Render ni Neon
porque mis entornos no están ahí desde el TP6, y armar preprod en otra nube
habría sido declarar algo distinto de lo que despliego.

| Provider | Versión fijada |
|---|---|
| `kreuzwerker/docker` | `3.6.2` |
| `hashicorp/random` | `3.7.2` |
| Terraform | `>= 1.9` (lo probé con 1.17.0) |

El provider de Docker se conecta al daemon del VPS por SSH, como
`notia-deploy`. La clave no está en el código: la ruta se pasa por una
variable en un `.tfvars` que git ignora. Los secretos de preprod (la base, la
app, la firma de la sesión y el webhook) los genera `random_password` y
quedan sólo en el estado, que tampoco se sube porque tiene la contraseña de
la base en texto plano.

`DATABASE_URL` se arma con el nombre del contenedor de Postgres y la
contraseña generada, y el `BACKEND_URL` del front sale del nombre del
contenedor de la API. No hay nada copiado a mano.

A QA y PROD no los importé ni los toqué. Preprod tiene su red, su volumen y
su puerto (8083), y antes y después de cada `destroy` y `apply` los dos
seguían con el mismo commit.

Cómo crearlo está en [`infra/README.md`](infra/README.md).

### Problemas

Después de un `apply` limpio, el segundo `plan` quería recrear los tres
contenedores. El daemon del VPS tiene opciones de log por defecto
(`max-size: 10m`, `max-file: 3`) que Docker aplica aunque no se pidan. El
estado las leía, mi código no las tenía, y un cambio en `log_opts` obliga a
recrear el contenedor. Las declaré igual que el daemon y apareció lo mismo
con `memory_swap`, que Docker pone en el doble de la memoria. Con las dos
declaradas, el segundo `plan` dice «No changes». Lo que saqué de esto es que
el código tiene que decir también lo que el proveedor pone por defecto; si
no, el plan no puede distinguir un cambio de un valor por defecto.

Homebrew no instalaba Terraform en mi Mac porque pedía actualizar las
herramientas de línea de comandos de Xcode. Bajé el binario de HashiCorp y
comprobé el checksum contra el `SHA256SUMS` publicado.

Preprod responde desde adentro del servidor, pero para verlo desde afuera
hay que abrir el 8083 en el firewall del proveedor, como pasó con el 8081 y
el 8082.

### Uso de IA

Trabajé con Claude Code. Escribió `infra/` y la primera versión de esta
sección, y encontró por qué el plan no era idempotente. Lo verificamos
corriéndolo: `apply` desde cero, un segundo `plan` con «No changes»,
`destroy` sin que quede ningún contenedor ni el volumen, `apply` de nuevo con
`/salud` respondiendo con la base, y QA y PROD iguales antes y después. En la
defensa lo creo en vivo.

---

## TP9 — DevSecOps, observabilidad y feedback

### Qué quedó activo

| Qué | Dónde se ve |
|---|---|
| Dependabot: alertas, actualizaciones de seguridad y `dependabot.yml` (npm, actions, docker) | *Security → Dependabot* y [`.github/dependabot.yml`](.github/dependabot.yml) |
| CodeQL con la configuración por defecto | *Security → Code scanning*, JavaScript/TypeScript y Actions, sin hallazgos |
| Push protection | *Settings → Advanced Security* |
| Monitor externo sobre `/salud` de PROD | UptimeRobot, cada 5 minutos |
| Sentry en el back y en el front de PROD | proyectos `notia-api` y `notia-web` |
| La tarjeta que salió de un dato | [issue #45](https://github.com/mat1v1dal/notia-ingsoft3/issues/45), en el tablero del TP3 |

### El PR de Dependabot que mergeé

El [#37](https://github.com/mat1v1dal/notia-ingsoft3/pull/37) sube `hono`
de 4.13.1 a 4.13.11. Lo mergeé por dos razones. Trae un arreglo de seguridad
(GHSA-5r4p-p66f-jhc7) en `serveStatic`, que decodificaba dos veces la ruta y
permitía saltear middlewares, y mi API usa `serveStatic` cuando sirve la PWA
ella misma. Además es un *patch* dentro de la misma versión, y el pipeline lo
probó entero antes de llegar a `main`: los tests de la capa HTTP, la
integración contra QA y la e2e.

Quedó en conflicto con el `pnpm-lock.yaml` de otros PRs y le pedí a
Dependabot que rehiciera la rama (`@dependabot rebase`).

### El monitor y la caída

UptimeRobot consulta `http://201.32.128.192:8082/salud` cada 5 minutos. Como
ese endpoint consulta la base, el monitor ve la caída si se cae el front, la
API o Postgres.

Bajé el front de PROD (`docker compose stop notia-web`) a las 21:50:35 del
21/10 y lo volví a levantar a las 21:57:22.

Al principio el monitor estaba mirando otra cosa. Lo había creado con
`http://201.32.128.192`, que es el puerto 80, de otro proyecto del mismo
servidor, y ése estaba vivo. PROD llevaba dos minutos caído y el monitor
seguía en *Up*. Lo corregí a `http://201.32.128.192:8082/salud` y lo vio en
el primer chequeo:

```
21:52:47  timeout detectado desde Falkenstein
21:53:19  confirmado desde Frankfurt
21:53:50  confirmado desde Núremberg, se abre el incidente
21:53:52  mail de DOWN enviado
```

Desde que el monitor apuntó bien, el aviso tardó 65 segundos, porque antes
de avisar confirma la caída desde otras dos regiones. Contado desde que bajé
el contenedor fueron 3 minutos y 17 segundos, y esa diferencia fue mi error
de configuración. Con un chequeo cada 5 minutos, que es lo que da el plan
gratis, en el peor caso PROD puede estar casi 5 minutos caído sin aviso. Con
un intervalo de 1 minuto se achicaría.

Si no hubiera provocado la caída, el monitor habría seguido en verde
vigilando algo que no era mi producción.

### Sentry

El DSN del back está sólo en el `.env` de PROD en el servidor, así que QA y
los tests no mandan nada. El del front está en el código, porque el DSN de un
front sólo sirve para enviar datos y no es un secreto.

El error es `Falla de prueba del TP9`, el issue `NOTIA-API-1`, con el pedido
que lo generó (`GET /api/falla`). Venía de un endpoint temporal que ya saqué.
El primer DSN del back que cargué no correspondía a ningún proyecto (en
Sentry sólo estaba creado el del front), así que esos primeros errores se
perdieron. Cuando creé `notia-api` llegó al primer intento.

Esto es lo que mostró la tabla de transacciones del back:

| Transacción | TPM | P50 | P95 | Failure rate |
|---|---|---|---|---|
| `GET /salud` | 0,0264 | 9,20 ms | 14,44 ms | 0 |
| `GET /api/items` | 0,0201 | 3,21 ms | 6,59 ms | 0,14 |
| `GET /api/log` | 0,0153 | 4,48 ms | 7,29 ms | 0,14 |
| `GET /api/chats` | <0,01 | 3,20 ms | 4,82 ms | 0,25 |
| `POST /api/items/:id/cerrar` | <0,01 | 17,28 ms | 21,79 ms | 0 |
| `GET /api/falla` | <0,01 | 3,76 ms | 15,51 ms | 1 |
| `POST /login` | <0,01 | 2,93 ms | 12,60 ms | 0,25 |
| `POST /api/items` | <0,01 | 9,84 ms | 13,18 ms | 0 |

La más pedida es `GET /salud`, pero la piden el healthcheck de Docker y el
monitor, no una persona. La que más uso yo es `GET /api/items`, que carga la
bandeja.

La más lenta en P95 es `POST /api/items/:id/cerrar`, con 21,79 ms. Tiene
sentido: es la única que abre una transacción, bloquea la fila, la actualiza
y escribe el cambio en el log. Las lecturas no pasan de 7 ms, salvo
`/salud`, que tarda unos 9 ms porque consulta la base cada vez.

El *failure rate* de las lecturas no son errores de la app. Son los `401` de
pedidos sin sesión: la e2e de la contraseña equivocada pide `/api/items` sin
cookie a propósito, y el navegador hace algún pedido antes de entrar. Sentry
los cuenta como fallas, pero para la app es la respuesta correcta.

La tarjeta [#45](https://github.com/mat1v1dal/notia-ingsoft3/issues/45) salió
del error. El endpoint de prueba seguía en PROD y cualquiera con sesión podía
llenar el panel y gastar la cuota de errores del plan gratis. La cerró el
mismo PR que lo saca.

### Problemas

Sentry ofrecía instalar un plugin para el asistente, pero pedía un instalador
interactivo y reiniciar la sesión. Creé los proyectos a mano desde la web.

Agregar `@sentry/node` rompió el typecheck en mi máquina: `drizzle-orm`
quedó en dos variantes (con y sin `@opentelemetry/api`) y los tipos de una no
aceptaban los de la otra. El lockfile estaba bien, eran enlaces viejos en
`node_modules`, y se arregló con `pnpm install --frozen-lockfile`.

### Uso de IA

Trabajé con Claude Code. Activó Dependabot, CodeQL y las alertas por la API
de GitHub, escribió el `dependabot.yml`, la integración de Sentry en el back
y el front, el endpoint de prueba y su retiro, creó la tarjeta del tablero,
bajó y levantó PROD para la caída, y escribió la primera versión de esta
sección. Las cuentas de Sentry y UptimeRobot las creé yo, y también aprobé
los deploys a PROD.

Lo verificamos corriéndolo: la API arranca con Sentry cargado (probado en
local con la imagen real), PROD respondió `500` en `/api/falla` y el error
apareció en Sentry, el monitor registró la caída, y los tests confirman que
el endpoint de prueba ya no existe.
