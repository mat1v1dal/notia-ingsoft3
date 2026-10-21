import * as Sentry from "@sentry/node";

/**
 * Sentry del backend: qué falla, qué tarda y qué se usa.
 *
 * Se carga ANTES que la app (`tsx --import ./src/instrument.ts`): la
 * instrumentación automática de HTTP y de Postgres tiene que estar puesta
 * antes de que esos módulos se importen.
 *
 * El DSN llega por el entorno y sólo está en PROD. Sin él, Sentry queda
 * apagado: tests, compose local y QA andan igual y no mandan nada.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? "local",
  release: process.env.GIT_COMMIT || undefined,
  // Medir todos los pedidos: con el tráfico de esta app sobra la cuota gratis.
  tracesSampleRate: 1.0,
});
