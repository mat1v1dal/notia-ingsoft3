import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./styles.css";

/**
 * Sentry del front. El DSN va escrito acá a propósito: el de un front no es
 * un secreto (sólo sirve para ENVIAR datos, no para leerlos) y viaja igual en
 * el JavaScript que baja el navegador. `environment` dice de qué entorno vino
 * cada evento: QA, PROD o localhost se distinguen por el puerto.
 */
const SENTRY_DSN = "";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: location.port === "8082" ? "prod" : location.port === "8081" ? "qa" : location.host,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
