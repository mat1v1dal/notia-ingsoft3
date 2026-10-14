import { expect, test, vi } from "vitest";
import { crearApi, SinSesion, type Fetch } from "./api.js";

/** Una respuesta HTTP mínima, sin red. `json` puede fallar, como cuando el cuerpo no es JSON. */
function respuesta(status: number, cuerpo?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (cuerpo === undefined) throw new SyntaxError("Unexpected token");
      return cuerpo;
    },
  } as Response;
}

/** Un doble de fetch que responde siempre lo mismo y registra cómo lo llamaron. */
function fetchQueResponde(res: Response) {
  return vi.fn<Fetch>(async () => res);
}

// ── qué pide ────────────────────────────────────────────────────────────────

test.each([
  { params: {}, url: "/api/items?" },
  { params: { q: "tp3" }, url: "/api/items?q=tp3" },
  { params: { estado: "todos" as const }, url: "/api/items?estado=todos" },
  { params: { q: "bases de datos", estado: "todos" as const }, url: "/api/items?q=bases+de+datos&estado=todos" },
])("items($params) pide $url", async ({ params, url }) => {
  const fetchDoble = fetchQueResponde(respuesta(200, []));
  const api = crearApi(fetchDoble);

  await api.items(params);

  expect(fetchDoble.mock.calls[0]![0]).toBe(url);
});

test("entrar manda la contraseña como JSON por POST", async () => {
  // Arrange
  const fetchDoble = fetchQueResponde(respuesta(200, { ok: true }));
  const api = crearApi(fetchDoble);

  // Act
  const resultado = await api.entrar("la-clave");

  // Assert: lo que importa es qué salió hacia el servidor, no sólo qué volvió.
  expect(resultado).toEqual({ ok: true });
  const [url, init] = fetchDoble.mock.calls[0]!;
  expect(url).toBe("/login");
  expect(init?.method).toBe("POST");
  expect((init?.headers as Record<string, string>)["content-type"]).toBe("application/json");
  expect(JSON.parse(init?.body as string)).toEqual({ password: "la-clave" });
});

test("observar escapa el jid en la URL: un @ no puede viajar crudo en un path", async () => {
  const fetchDoble = fetchQueResponde(respuesta(200, {}));
  const api = crearApi(fetchDoble);

  await api.observar("120363000000000000@g.us", true);

  const [url, init] = fetchDoble.mock.calls[0]!;
  expect(url).toBe("/api/chats/120363000000000000%40g.us");
  expect(JSON.parse(init?.body as string)).toEqual({ tracked: true });
});

// ── cómo reacciona ──────────────────────────────────────────────────────────

test("un 401 se convierte en SinSesion, que es lo que la app usa para caer al login", async () => {
  const api = crearApi(fetchQueResponde(respuesta(401, { error: "no autorizado" })));

  await expect(api.items()).rejects.toBeInstanceOf(SinSesion);
});

test("un error con cuerpo JSON expone el mensaje del servidor", async () => {
  const api = crearApi(fetchQueResponde(respuesta(404, { error: "no encontrado" })));

  await expect(api.cerrar(999)).rejects.toThrow("no encontrado");
});

test("un error sin cuerpo JSON no rompe al parsear: dice el status", async () => {
  const api = crearApi(fetchQueResponde(respuesta(502)));

  await expect(api.log()).rejects.toThrow("Error 502");
});
