import { expect, test } from "vitest";
import { etiquetaDeEnlace } from "./enlace.js";

// Un test por camino que la función declara: sin url, url vacía, url válida
// con y sin `www.`, url rota, y el recorte cuando el texto es largo.

test.each([
  { url: null, porQue: "no hay link" },
  { url: "", porQue: "está vacío" },
  { url: "   ", porQue: "son sólo espacios" },
])("no muestra nada cuando $porQue", ({ url }) => {
  expect(etiquetaDeEnlace(url)).toBeNull();
});

test("de una URL válida se muestra sólo el dominio", () => {
  expect(etiquetaDeEnlace("https://campus.ucc.edu.ar/mod/assign/view.php?id=123")).toBe(
    "campus.ucc.edu.ar",
  );
});

test("el www. no aporta nada y se saca", () => {
  expect(etiquetaDeEnlace("https://www.ejemplo.com/paper")).toBe("ejemplo.com");
});

test("una URL rota no rompe: se muestra el texto crudo", () => {
  expect(etiquetaDeEnlace("ver ejemplo.com/paper")).toBe("ver ejemplo.com/paper");
});

test("un texto más largo que el máximo se recorta con puntos suspensivos", () => {
  const largo = "x".repeat(50);

  const etiqueta = etiquetaDeEnlace(largo, 40);

  expect(etiqueta).toHaveLength(40);
  expect(etiqueta!.endsWith("…")).toBe(true);
});

test("un texto de exactamente el máximo no se recorta", () => {
  const justo = "x".repeat(40);

  expect(etiquetaDeEnlace(justo, 40)).toBe(justo);
});
