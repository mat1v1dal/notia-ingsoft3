import type { Db } from "@notia/core";
import { chats, inbox, itemChanges, items } from "@notia/core/schema";
import { makeTestDb } from "@notia/core/testing";
import { eq } from "drizzle-orm";
import { beforeEach, expect, test } from "vitest";
import { createApp } from "./app.js";

/**
 * Tests de la capa HTTP, sin red: Hono expone `app.request`, que arma la
 * Request y devuelve la Response igual que si viniera del socket.
 *
 * Lo que se verifica acá son las fronteras: quién entra y quién no. Es
 * donde un bug duele más, porque del otro lado está WhatsApp y el navegador.
 */

const GRUPO = "120363000000000000@g.us";
const CONFIG = { webhookToken: "token-del-webhook", password: "la-clave", secret: "secreto-de-firma" };
const COOKIE = { cookie: `notia_sesion=${CONFIG.secret}` };
const JSON_ = { "content-type": "application/json" };

const mensaje = {
  event: "messages.upsert",
  data: {
    key: { remoteJid: GRUPO, fromMe: false, id: "3EB0AAA" },
    pushName: "Ana",
    message: { conversation: "el TP3 se corre al viernes" },
    messageTimestamp: 1_754_838_180,
  },
};

let db: Db;
let app: ReturnType<typeof createApp>;

beforeEach(async () => {
  db = await makeTestDb();
  await db.insert(chats).values({ jid: GRUPO, nombre: "Bases de Datos II", tracked: true });
  app = createApp({ db, ...CONFIG });
});

// ── webhook ─────────────────────────────────────────────────────────────────

test("el webhook sin la apikey correcta se rechaza y no persiste nada", async () => {
  const res = await app.request("/webhook/whatsapp", {
    method: "POST",
    headers: { ...JSON_, apikey: "otra" },
    body: JSON.stringify(mensaje),
  });

  expect(res.status).toBe(401);
  expect(await db.select().from(inbox)).toHaveLength(0);
});

test("el webhook con apikey encola el mensaje de un chat observado", async () => {
  const res = await app.request("/webhook/whatsapp", {
    method: "POST",
    headers: { ...JSON_, apikey: CONFIG.webhookToken },
    body: JSON.stringify(mensaje),
  });

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true, resultado: "encolado" });
  const [fila] = await db.select().from(inbox);
  expect(fila?.body).toBe("el TP3 se corre al viernes");
});

test("un cuerpo que no es JSON se descarta con 200: Evolution no debe reintentar basura", async () => {
  const res = await app.request("/webhook/whatsapp", {
    method: "POST",
    headers: { ...JSON_, apikey: CONFIG.webhookToken },
    body: "esto no es json",
  });

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true, resultado: "descartado" });
});

// ── sesión ──────────────────────────────────────────────────────────────────

test.each([
  { caso: "incorrecta", body: { password: "otra" } },
  { caso: "vacía", body: { password: "" } },
  { caso: "ausente", body: {} },
])("la contraseña $caso no abre sesión", async ({ body }) => {
  const res = await app.request("/login", { method: "POST", headers: JSON_, body: JSON.stringify(body) });

  expect(res.status).toBe(401);
  expect(res.headers.get("set-cookie")).toBeNull();
});

test("la contraseña correcta deja una cookie de sesión httpOnly", async () => {
  const res = await app.request("/login", {
    method: "POST",
    headers: JSON_,
    body: JSON.stringify({ password: CONFIG.password }),
  });

  expect(res.status).toBe(200);
  expect(res.headers.get("set-cookie")).toMatch(/^notia_sesion=.*HttpOnly/);
});

test("sin cookie, la API no muestra nada", async () => {
  const res = await app.request("/api/items");

  expect(res.status).toBe(401);
});

// ── items ───────────────────────────────────────────────────────────────────

test("crear un item desde la web lo deja abierto y queda en el log sin chat de origen", async () => {
  const res = await app.request("/api/items", {
    method: "POST",
    headers: { ...JSON_, ...COOKIE },
    body: JSON.stringify({ content: "  comprar cartulina  " }),
  });

  expect(res.status).toBe(201);
  const item = (await res.json()) as { content: string; source: string };
  expect(item.content).toBe("comprar cartulina");
  expect(item.source).toBe("web");

  const [cambio] = await db.select().from(itemChanges);
  expect(cambio?.accion).toBe("crear");
  expect(cambio?.jid).toBeNull();
});

test("la lista muestra sólo lo abierto, salvo que se pida todo", async () => {
  await db.insert(items).values([
    { content: "abierto", source: "web" },
    { content: "cerrado", source: "web", doneAt: new Date() },
  ]);

  const abiertos = (await (await app.request("/api/items", { headers: COOKIE })).json()) as { content: string }[];
  const todos = (await (await app.request("/api/items?estado=todos", { headers: COOKIE })).json()) as unknown[];

  expect(abiertos.map((i) => i.content)).toEqual(["abierto"]);
  expect(todos).toHaveLength(2);
});

test("cerrar un item que no existe responde 404 sin tocar el log", async () => {
  const res = await app.request("/api/items/999/cerrar", { method: "POST", headers: COOKIE });

  expect(res.status).toBe(404);
  expect(await db.select().from(itemChanges)).toHaveLength(0);
});

// ── deshacer ────────────────────────────────────────────────────────────────

test("el link de deshacer con un token inválido se rechaza y no cambia nada", async () => {
  const [item] = await db.insert(items).values({ content: "creado por error", source: "web" }).returning();
  const [cambio] = await db
    .insert(itemChanges)
    .values({ itemId: item!.id, accion: "crear", antes: null, despues: item, jid: GRUPO, motivo: null })
    .returning();

  const res = await app.request(`/u/${cambio!.id}/token-falso`);

  expect(res.status).toBe(403);
  const [sigue] = await db.select().from(items).where(eq(items.id, item!.id));
  expect(sigue?.doneAt).toBeNull();
});

test("deshacer una creación cierra el item en vez de borrarlo, y marca el cambio como deshecho", async () => {
  // Arrange: el token sale del log, igual que en el link que llega por WhatsApp.
  const [item] = await db.insert(items).values({ content: "creado por error", source: "web" }).returning();
  await db
    .insert(itemChanges)
    .values({ itemId: item!.id, accion: "crear", antes: null, despues: item, jid: GRUPO, motivo: null });
  const [entrada] = (await (await app.request("/api/log", { headers: COOKIE })).json()) as { id: number; undo_token: string }[];

  // Act: sin cookie, como un tap desde el teléfono.
  const res = await app.request(`/u/${entrada!.id}/${entrada!.undo_token}`);

  // Assert
  expect(res.status).toBe(302);
  expect(res.headers.get("location")).toBe(`/#/item/${item!.id}?deshecho=1`);
  const [cerrado] = await db.select().from(items).where(eq(items.id, item!.id));
  expect(cerrado?.doneAt).not.toBeNull();
  const [cambio] = await db.select().from(itemChanges);
  expect(cambio?.undoneAt).not.toBeNull();
});
