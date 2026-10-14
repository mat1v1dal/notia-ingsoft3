/**
 * Cómo se muestra un link en la lista: el dominio, sin `www.`, y nada más.
 *
 * El agente copia la URL de un mensaje de WhatsApp, y lo que llega puede
 * no ser una URL válida (`"ver ejemplo.com/paper"`, una barra de más). Hasta
 * ahora `new URL(url)` se llamaba en el render de la fila, y una URL rota
 * tiraba una excepción que vaciaba la lista entera. Acá, lo roto se muestra
 * crudo y recortado; la fila se dibuja igual.
 */
export function etiquetaDeEnlace(url: string | null, largoMaximo = 40): string | null {
  if (!url) return null;

  const texto = url.trim();
  if (texto === "") return null;

  let host: string;
  try {
    host = new URL(texto).hostname;
  } catch {
    return recortar(texto, largoMaximo);
  }

  if (host.startsWith("www.")) host = host.slice(4);
  return recortar(host, largoMaximo);
}

function recortar(texto: string, largoMaximo: number): string {
  if (texto.length <= largoMaximo) return texto;
  return `${texto.slice(0, largoMaximo - 1)}…`;
}
