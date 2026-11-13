/**
 * Qué se manda a buscar a partir de lo que el usuario tipeó.
 *
 * La API busca con `ILIKE '%texto%'`, así que los espacios de más cuentan:
 * "bases  de datos" no encuentra "bases de datos". Acá se recortan y se
 * colapsan antes de salir. Devuelve `null` cuando no vale la pena buscar:
 * menos de dos caracteres traería media base.
 */
export function normalizarConsulta(texto: string, largoMinimo = 2): string | null {
  const limpio = texto.trim().replace(/\s+/g, " ");

  if (limpio.length < largoMinimo) return null;
  if (limpio.length > 100) return limpio.slice(0, 100);

  return limpio;
}
