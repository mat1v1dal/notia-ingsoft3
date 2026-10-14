import { defineConfig } from "vitest/config";

/**
 * Suite y cobertura del frontend: sólo la lógica pura de `packages/web`.
 *
 * Los componentes React (.tsx) quedan afuera de la cuenta: son unit tests sin
 * DOM, y la interfaz se verifica end-to-end contra la app desplegada (TP7).
 */
export default defineConfig({
  test: {
    name: "frontend",
    include: ["packages/web/src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "coverage/frontend",
      // Medido el 14/10/2026: 98,19 % de líneas y 93,61 % de ramas. La lógica
      // del front es chica (unas 110 líneas), así que el umbral va alto: una
      // función nueva de diez líneas sin tests ya lo baja del 95.
      thresholds: { lines: 95, branches: 90 },
      include: ["packages/web/src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.d.ts"],
    },
  },
});
