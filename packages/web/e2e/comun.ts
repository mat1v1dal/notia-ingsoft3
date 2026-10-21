/** Contraseña de QA: un secret del repositorio en CI, la del .env de QA a mano. */
export const PASSWORD = process.env.E2E_PASSWORD ?? "";

/**
 * Un texto que ninguna otra corrida va a usar: lleva la hora y un sufijo al
 * azar. Así cada prueba encuentra SU dato y no uno que dejó otra.
 */
export function unico(prefijo: string): string {
  return `${prefijo} e2e ${new Date().toISOString()} ${Math.random().toString(36).slice(2, 7)}`;
}
