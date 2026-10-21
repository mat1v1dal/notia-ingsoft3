import { expect, test } from "vitest";
import { versionCorta } from "./version.js";

test("de un commit completo se muestran los primeros siete caracteres", () => {
  expect(versionCorta({ ok: true, db: true, commit: "a04616cb5d3109365ce8989436225831e17aa56b" })).toBe(
    "a04616c",
  );
});

test.each([
  { caso: "una respuesta que no es un objeto", salud: "ok" },
  { caso: "una respuesta nula", salud: null },
  { caso: "un commit nulo (imagen construida a mano)", salud: { ok: true, commit: null } },
  { caso: "una API vieja, sin campo commit", salud: { ok: true } },
  { caso: "un commit que no es hexadecimal", salud: { commit: "main" } },
  { caso: "un commit demasiado corto", salud: { commit: "a04" } },
])("no muestra versión ante $caso", ({ salud }) => {
  expect(versionCorta(salud)).toBeNull();
});
