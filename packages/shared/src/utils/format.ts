import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'

// ═══════════════════════════════════════════════════════════════════
// Utilidades de formateo — Enbandeja
// ═══════════════════════════════════════════════════════════════════
// Regla 8 del CLAUDE.md: todas las fechas se guardan en UTC.
// Toda comparación de "hora local" usa toZonedTime con el timezone
// del tenant. Nunca se asume America/Santiago hardcodeado.
// ═══════════════════════════════════════════════════════════════════

/**
 * Formatea un monto en CLP (sin decimales, con punto como separador de miles).
 * Ej: 49000 → "$49.000"
 */
export function formatCLP(monto: number): string {
  return `$${monto.toLocaleString('es-CL')}`
}

/**
 * Convierte una fecha UTC a la hora local del tenant.
 * OBLIGATORIO antes de cualquier comparación de hora local.
 */
export function toLocalTime(fecha: Date, timezone: string): Date {
  return toZonedTime(fecha, timezone)
}

/**
 * Formatea una fecha en formato legible para el usuario.
 * Usa el timezone del tenant para la conversión.
 * Ej: "Lunes 14 de abril"
 */
export function formatFechaLarga(fecha: Date, timezone: string): string {
  const local = toZonedTime(fecha, timezone)
  return format(local, "EEEE d 'de' MMMM", { locale: es })
}

/**
 * Formatea una fecha corta.
 * Ej: "14/04/2026"
 */
export function formatFechaCorta(fecha: Date, timezone: string): string {
  const local = toZonedTime(fecha, timezone)
  return format(local, 'dd/MM/yyyy', { locale: es })
}

/**
 * Formatea una hora.
 * Ej: "09:00"
 */
export function formatHora(fecha: Date, timezone: string): string {
  const local = toZonedTime(fecha, timezone)
  return format(local, 'HH:mm')
}

/**
 * Formatea fecha y hora completa.
 * Ej: "14/04/2026 09:00"
 */
export function formatFechaHora(fecha: Date, timezone: string): string {
  const local = toZonedTime(fecha, timezone)
  return format(local, 'dd/MM/yyyy HH:mm', { locale: es })
}

/**
 * Verifica si la hora actual (en el timezone del tenant) ya pasó
 * la hora de corte del colegio.
 */
export function pasadoHoraCorte(horaCorte: string, timezone: string): boolean {
  const ahora = toZonedTime(new Date(), timezone)
  const partes = horaCorte.split(':').map(Number)
  const horaCorteH = partes[0] ?? 0
  const horaCorteM = partes[1] ?? 0
  const horaActual = ahora.getHours()
  const minutoActual = ahora.getMinutes()

  return horaActual > horaCorteH || (horaActual === horaCorteH && minutoActual >= horaCorteM)
}
