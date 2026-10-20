/**
 * Qué versión muestra la barra: los primeros siete caracteres del commit
 * que informa /salud. Es la respuesta, desde la propia pantalla, a "¿qué
 * está corriendo en este entorno?".
 *
 * Devuelve null si la respuesta no trae un commit válido (una imagen
 * construida a mano, o una API vieja): mejor no mostrar nada que mostrar
 * algo que no es una versión.
 */
export function versionCorta(salud: unknown): string | null {
  if (typeof salud !== "object" || salud === null) return null;

  const commit = (salud as Record<string, unknown>).commit;
  if (typeof commit !== "string" || !/^[0-9a-f]{7,40}$/.test(commit)) return null;

  return commit.slice(0, 7);
}
