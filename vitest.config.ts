import { defineConfig } from "vitest/config";

/**
 * `pnpm test` corre las dos suites juntas. La cobertura, en cambio, se mide
 * por lado con `--config`: cada uno tiene su propio umbral (ver
 * vitest.backend.config.ts y vitest.web.config.ts).
 */
export default defineConfig({
  test: {
    projects: ["./vitest.backend.config.ts", "./vitest.web.config.ts"],
  },
});
