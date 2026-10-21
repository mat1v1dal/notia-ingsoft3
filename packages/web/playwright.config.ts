import { defineConfig, devices } from "@playwright/test";

/**
 * Dos suites contra QA desplegado, las dos sin dobles: le pegan al sistema de
 * verdad, con su base de verdad.
 *
 *   integracion  api.spec.ts: la API por HTTP, sin navegador.
 *   e2e          *.e2e.spec.ts: un Chromium real usando la app como un usuario.
 *
 * La dirección y la contraseña llegan por el entorno; los defaults sirven
 * para correrlas a mano contra QA.
 */
const BASE = process.env.E2E_BASE_URL ?? "http://201.32.128.192:8081";

export default defineConfig({
  testDir: "./e2e",
  // QA es uno solo y lo comparten todas las pruebas: en serie, para que una
  // no vea los datos a medio crear de otra.
  workers: 1,
  fullyParallel: false,
  // El VPS no duerme, pero el contenedor recién desplegado tarda segundos en
  // estar sano: timeouts generosos, nunca saltear.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // Un reintento en CI, y queda marcado como "flaky" en el reporte: si pasó
  // al segundo intento, se ve, no se esconde.
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "integracion", testMatch: /api\.spec\.ts/ },
    { name: "e2e", testMatch: /\.e2e\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
  ],
});
