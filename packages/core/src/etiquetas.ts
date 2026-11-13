/**
 * Normaliza las etiquetas que propone el agente antes de guardarlas.
 *
 * El modelo devuelve variantes de la misma etiqueta («#Facu», «facu »,
 * «FACU»). Sin normalizar, el mismo tema queda partido en tres y la
 * búsqueda por etiqueta deja items afuera.
 */
export const MAX_ETIQUETAS = 5;
export const MAX_LARGO = 24;

export function normalizarEtiqueta(cruda: string): string | null {
  let e = cruda.trim().toLowerCase();
  while (e.startsWith("#")) {
    e = e.slice(1);
  }
  e = e.normalize("NFD").replace(/[̀-ͯ]/g, "");
  e = e.replace(/\s+/g, "-");
  e = e.replace(/[^a-z0-9ñ-]/g, "");
  e = e.replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (e.length === 0) {
    return null;
  }
  if (e.length > MAX_LARGO) {
    e = e.slice(0, MAX_LARGO);
  }
  return e;
}

export function normalizarEtiquetas(crudas: readonly string[]): string[] {
  const vistas = new Set<string>();
  const resultado: string[] = [];
  for (const cruda of crudas) {
    const e = normalizarEtiqueta(cruda);
    if (e === null) {
      continue;
    }
    if (vistas.has(e)) {
      continue;
    }
    vistas.add(e);
    resultado.push(e);
    if (resultado.length === MAX_ETIQUETAS) {
      break;
    }
  }
  return resultado;
}
