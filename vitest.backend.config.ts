import { defineConfig } from "vitest/config";

/**
 * Suite y cobertura del backend: core, api y worker.
 *
 * Va separada de la del frontend para que cada lado tenga su propio número y
 * su propio umbral: una caída en uno no se tapa con el exceso del otro.
 */
export default defineConfig({
  test: {
    name: "backend",
    include: ["packages/{core,api,worker}/src/**/*.test.ts"],
    // Cada archivo de test levanta su propia PGlite en memoria, así que los
    // tests no comparten estado y pueden correr en paralelo.
    testTimeout: 20_000,
    coverage: {
      provider: "v8",
      // json-summary es el que lee el pipeline para armar la tabla del run.
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "coverage/backend",
      // El umbral que frena el build. Medido el 14/10/2026: 93,5 % de líneas y
      // 82,45 % de ramas (ver decisiones.md, TP5). Líneas con 3 puntos de
      // margen; ramas casi al ras, porque es la métrica que más cuesta subir
      // y la que más dice: cada rama sin cubrir es un `if` que nadie probó.
      thresholds: { lines: 90, branches: 80 },
      // `include` decide QUÉ entra en la cuenta: con él, un archivo nuevo sin
      // tests baja el número aunque ningún test lo importe.
      include: ["packages/{core,api,worker}/src/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        // Arranque de los procesos: leen variables de entorno y encienden el
        // servidor o el loop. Se verifican levantando el stack, no con unit tests.
        "packages/api/src/index.ts",
        "packages/worker/src/index.ts",
        // Definición de datos y tipos: no tienen lógica que pueda fallar.
        "packages/core/src/schema.ts",
        "packages/core/src/db.ts",
        "packages/core/src/index.ts",
        // Infraestructura que sólo existe para los tests o para producción:
        // la base en memoria y la conexión real a Postgres.
        "packages/core/src/testing.ts",
        "packages/core/src/connect.ts",
        // Adaptador fino al SDK de OpenAI: traduce argumentos. Lo que importa
        // (el mapeo de la respuesta) vive en openai-mapping.ts y sí se mide.
        "packages/worker/src/openai-client.ts",
      ],
    },
  },
});
