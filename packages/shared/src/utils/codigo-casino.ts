// ═══════════════════════════════════════════════════════════════════
// Utilidades de Código de Casino — Enbandeja
// ═══════════════════════════════════════════════════════════════════
// Cada Colegio tiene un codigoCasino único que el apoderado ingresa
// durante el onboarding para vincularse al tenant correcto.
//
// Caracteres permitidos: A-Z + 0-9 excluyendo ambiguos (I/1, O/0, L)
// Longitud: 5 caracteres
// ═══════════════════════════════════════════════════════════════════

/**
 * Caracteres no ambiguos para códigos de casino.
 * Excluye: I (confuso con 1), O (confuso con 0), L (confuso con 1),
 * 0 (confuso con O), 1 (confuso con I/L)
 */
const CARACTERES_VALIDOS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Regex para validar formato de código de casino.
 * 5-6 caracteres alfanuméricos no ambiguos.
 */
const CODIGO_CASINO_REGEX = /^[A-Z0-9]{5,6}$/

/**
 * Genera un código de casino aleatorio de 5 caracteres.
 * Usa solo caracteres no ambiguos para evitar confusión
 * cuando el apoderado lo ingresa manualmente.
 *
 * @returns Código de 5 caracteres (ej: "HF4NK")
 */
export function generarCodigoCasino(): string {
  let codigo = ''
  for (let i = 0; i < 5; i++) {
    const indice = Math.floor(Math.random() * CARACTERES_VALIDOS.length)
    codigo += CARACTERES_VALIDOS[indice]
  }
  return codigo
}

/**
 * Valida que un string tenga el formato correcto de código de casino.
 * No verifica existencia en la base de datos, solo formato.
 *
 * @param codigo - El código a validar
 * @returns true si el formato es válido (5-6 caracteres alfanuméricos)
 */
export function validarFormatoCodigoCasino(codigo: string): boolean {
  return CODIGO_CASINO_REGEX.test(codigo)
}

/**
 * Normaliza un código de casino: trim + mayúsculas.
 * Útil para limpiar input del usuario antes de validar.
 *
 * @param codigo - El código en bruto del input
 * @returns Código normalizado
 */
export function normalizarCodigoCasino(codigo: string): string {
  return codigo.trim().toUpperCase()
}
