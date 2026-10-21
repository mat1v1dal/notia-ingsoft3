import { expect, test, type APIRequestContext } from "@playwright/test";
import { PASSWORD, unico } from "./comun.js";

/**
 * Integración: la API de QA con su Postgres de verdad, por HTTP, sin
 * navegador y sin dobles. Si esto pasa y la e2e falla, el problema está en
 * el front; si esto falla, está en la API o en la base.
 *
 * notia no borra items: cerrarlos es su "borrado" (reversible a propósito,
 * ver decisiones.md TP2). La limpieza de cada prueba es cerrar lo que creó y
 * comprobar que ya no está entre los abiertos.
 */

type Item = { id: number; content: string; doneAt: string | null };

async function entrar(request: APIRequestContext) {
  const res = await request.post("/login", { data: { password: PASSWORD } });
  expect(res.status(), "el login de QA tiene que andar").toBe(200);
}

async function abiertos(request: APIRequestContext): Promise<Item[]> {
  const res = await request.get("/api/items");
  expect(res.ok()).toBeTruthy();
  return res.json();
}

test.beforeEach(async ({ request }) => {
  await entrar(request);
});

test("alta, verificación y cierre de un item", async ({ request }) => {
  const texto = unico("alta");

  const creado = await request.post("/api/items", { data: { content: texto } });
  expect(creado.status()).toBe(201);
  const item: Item = await creado.json();

  expect((await abiertos(request)).map((i) => i.content)).toContain(texto);

  const cerrado = await request.post(`/api/items/${item.id}/cerrar`);
  expect(cerrado.ok()).toBeTruthy();
  expect((await cerrado.json()).doneAt).not.toBeNull();

  expect((await abiertos(request)).map((i) => i.content)).not.toContain(texto);
});

test("un alta con el texto vacío se rechaza con 400 y no crea nada", async ({ request }) => {
  const antes = (await request.get("/api/items?estado=todos").then((r) => r.json())) as Item[];

  const res = await request.post("/api/items", { data: { content: "   " } });

  expect(res.status()).toBe(400);
  expect((await res.json()).error).toMatch(/vacío/);
  const despues = (await request.get("/api/items?estado=todos").then((r) => r.json())) as Item[];
  expect(despues).toHaveLength(antes.length);
});

test("la búsqueda encuentra un item cerrado, que es la memoria de lo que ya pasó", async ({ request }) => {
  const texto = unico("buscar");
  const item: Item = await (await request.post("/api/items", { data: { content: texto } })).json();
  await request.post(`/api/items/${item.id}/cerrar`);

  const res = await request.get(`/api/items?q=${encodeURIComponent(texto)}`);

  expect(res.ok()).toBeTruthy();
  const encontrados: Item[] = await res.json();
  expect(encontrados).toHaveLength(1);
  expect(encontrados[0]!.id).toBe(item.id);
  expect(encontrados[0]!.doneAt).not.toBeNull();
});
