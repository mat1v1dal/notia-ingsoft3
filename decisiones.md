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
