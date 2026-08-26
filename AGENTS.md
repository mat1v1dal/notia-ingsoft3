# AGENTS.md

Cómo trabaja un agente de IA sobre este repositorio. **Leer antes de tocar
nada.** Las reglas de acá tienen precedencia sobre el comportamiento por
defecto de cualquier skill.

## El contexto que cambia todo

Este es el repositorio de la práctica de **Ingeniería del Software 3 (UCC
2026)**. Eso agrega dos requisitos que no tendría un proyecto cualquiera:

1. Es **público** y su historial de Git es evidencia evaluada. La cátedra lee
   *cuándo* se trabajó, no sólo qué se entregó.
2. Todo lo que hay acá adentro tiene que poder **defenderse oralmente**, sin la
   IA presente. *Si no se puede explicar, no se aprueba — aunque funcione.*

## Las cuatro reglas

**Declarar.** Lo que hiciste va a `decisiones.md`, específico: qué archivos,
qué decisiones. No una fórmula genérica.

**Verificar ejecutando.** Nada se da por bueno porque "se ve bien". Si el
cambio toca configuración o despliegue, levantalo y guardá la salida. Los
errores de configuración aparecen al ejecutar, no al leer el diff.

**Dejarlo defendible.** Cada decisión con su porqué y las alternativas que
descartaste. Las alternativas son lo que se pregunta.

**No fabricar evidencia.** No toques fechas de commits ni reescribas el
historial para sugerir un orden de trabajo que no ocurrió. Documentar después
de implementar está bien y se marca *as-built*; hacerlo pasar por anterior, no.

## Un TP por semana

Este repositorio se construye **incrementalmente**, en el orden de los
trabajos prácticos. No adelantes trabajo de un TP que todavía no se dictó: el
historial tiene que reflejar cuándo se hizo cada cosa.

| TP | Entra al repo |
|---|---|
| TP1 | El flujo de trabajo: protecciones, PRs, versionado |
| TP2 | **La app del semestre** y su contenerización |
| TP3 | Planificación y trazabilidad |
| TP4 | El pipeline de CI |

Hasta el TP2 acá no hay código de aplicación, y está bien que así sea: el
enunciado del TP1 pide el repositorio con su `.gitignore` y nada más.

## Ramas

`feat/`, `fix/`, `docs/`, `chore/` — por **unidad de cambio**. Nunca `tp2` ni
`entrega-3`: el número del práctico va en el tag y en la release, que es donde
se lo busca.

`main` está protegida sin bypass. No intentes pushear directo; no vas a poder,
y está bien que sea así.

## Antes de escribir

| Archivo | Qué te dice |
|---|---|
| `openspec/specs/flujo-de-trabajo/spec.md` | Cómo entra el código y las cuatro condiciones del uso de IA |
| `openspec/config.yaml` | Reglas por fase de SDD |
| `decisiones.md` | Qué se decidió antes y por qué |
