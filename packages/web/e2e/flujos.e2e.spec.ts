import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, unico } from "./comun.js";

/**
 * E2E: un Chromium real usando QA como lo usa una persona. Sin interceptar
 * la red: cada click le pega a la API de verdad, que le pega a la base.
 */

async function entrar(page: Page) {
  await page.goto("/");
  // Sin sesión la app pide la contraseña.
  await page.getByLabel("Contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByLabel("Anotar algo")).toBeVisible();
}

test("anotar algo, verlo en la lista, marcarlo hecho y que desaparezca", async ({ page }) => {
  const texto = unico("anotar");
  await entrar(page);

  await page.getByLabel("Anotar algo").fill(texto);
  await page.getByRole("button", { name: "Anotar" }).click();
  await expect(page.getByText(texto)).toBeVisible();

  // Limpieza, comprobada: lo cierra y deja de estar, también al recargar.
  await page.getByRole("button", { name: `Marcar ${texto} como hecho` }).click();
  await expect(page.getByText(texto)).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("Anotar algo")).toBeVisible();
  await expect(page.getByText(texto)).toHaveCount(0);
});

test("una contraseña equivocada muestra el error y no abre sesión", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Contraseña").fill("no-es-la-contraseña");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Esa contraseña no es.")).toBeVisible();
  await expect(page.getByLabel("Anotar algo")).toHaveCount(0);
  // Y la API tampoco quedó abierta: sin cookie, los items no se ven.
  const res = await page.request.get("/api/items");
  expect(res.status()).toBe(401);
});

test("lo que anoto sigue ahí al recargar, y lo encuentro buscando", async ({ page }) => {
  const texto = unico("recargar");
  await entrar(page);
  await page.getByLabel("Anotar algo").fill(texto);
  await page.getByRole("button", { name: "Anotar" }).click();
  await expect(page.getByText(texto)).toBeVisible();

  await page.reload();
  await expect(page.getByText(texto)).toBeVisible();

  await page.getByRole("link", { name: "Buscar" }).click();
  await page.getByLabel("Buscar en todo").fill(texto);
  await expect(page.getByText("1 resultado")).toBeVisible();

  // Limpieza desde la búsqueda: lo cierra y la fila queda marcada hecha.
  await page.getByRole("button", { name: `Marcar ${texto} como hecho` }).click();
  await expect(page.getByRole("button", { name: `Reabrir ${texto}` })).toBeVisible();
});
