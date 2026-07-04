// ═══════════════════════════════════════════════════════════════════
// puedeCancelar — Valida si un item puede cancelarse según hora de corte
// ═══════════════════════════════════════════════════════════════════
// Regla: la cancelación solo procede si la hora local del tenant
// es ANTERIOR a la hora de corte del colegio para la fecha del item.
// NUNCA hardcodea America/Santiago — usa timezone del tenant.
// ═══════════════════════════════════════════════════════════════════
import { toZonedTime } from "date-fns-tz"

interface ResultadoCancelacion {
  puede: boolean
  razon?: string
}

/**
 * Valida si un PedidoItem puede cancelarse según la hora de corte del colegio.
 *
 * @param fechaItem - Fecha del item (Date o string ISO)
 * @param horaCorte - Hora de corte del colegio en formato "HH:mm"
 * @param timezone - Timezone del tenant (ej: "America/Santiago")
 * @returns { puede, razon } — si puede cancelar y por qué no
 */
export function puedeCancelar(
  fechaItem: Date | string,
  horaCorte: string,
  timezone: string
): ResultadoCancelacion {
  const ahora = new Date()
  const ahoraLocal = toZonedTime(ahora, timezone)

  const fecha = typeof fechaItem === "string" ? new Date(fechaItem) : fechaItem
  const fechaItemLocal = toZonedTime(fecha, timezone)

  // Si la fecha del item ya pasó → no se puede cancelar
  const hoyStr = `${ahoraLocal.getFullYear()}-${String(ahoraLocal.getMonth() + 1).padStart(2, "0")}-${String(ahoraLocal.getDate()).padStart(2, "0")}`
  const itemStr = `${fechaItemLocal.getFullYear()}-${String(fechaItemLocal.getMonth() + 1).padStart(2, "0")}-${String(fechaItemLocal.getDate()).padStart(2, "0")}`

  if (itemStr < hoyStr) {
    return { puede: false, razon: "La fecha del pedido ya pasó" }
  }

  // Si la fecha del item es hoy, verificar hora de corte
  if (itemStr === hoyStr) {
    const [horaStr, minutoStr] = horaCorte.split(":")
    const horaCorteNum = parseInt(horaStr ?? "0", 10)
    const minutoCorteNum = parseInt(minutoStr ?? "0", 10)

    const horaActual = ahoraLocal.getHours()
    const minutoActual = ahoraLocal.getMinutes()

    if (
      horaActual > horaCorteNum ||
      (horaActual === horaCorteNum && minutoActual >= minutoCorteNum)
    ) {
      return {
        puede: false,
        razon: `La hora de corte (${horaCorte}) ya pasó. No se puede cancelar.`,
      }
    }
  }

  // Si la fecha del item es futura → siempre se puede cancelar
  return { puede: true }
}
