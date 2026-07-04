// ═══════════════════════════════════════════════════════════════════
// generar-snapshot.ts — Lógica de cálculo de KpiSnapshot por colegio
// ═══════════════════════════════════════════════════════════════════
// Recibe un colegio y una fecha (en timezone del tenant).
// Calcula métricas del día y guarda snapshot (idempotente por unique).
// NUNCA hardcodea America/Santiago — usa la fecha ya convertida.
// ═══════════════════════════════════════════════════════════════════

import { prisma } from "@enbandeja/database"
import { startOfDay, endOfDay } from "date-fns"
import { fromZonedTime } from "date-fns-tz"

/**
 * Genera (o regenera) el KpiSnapshot de un colegio para una fecha local.
 * Idempotente: usa upsert sobre @@unique([colegioId, fecha]).
 *
 * @param tenantId - UUID del tenant (para RLS)
 * @param colegioId - UUID del colegio
 * @param fechaLocal - Fecha local (solo día, sin hora) en el timezone del tenant
 * @param timezone - Timezone IANA del tenant (ej: "America/Santiago")
 */
export async function generarKpiSnapshot(
  tenantId: string,
  colegioId: string,
  fechaLocal: Date,
  timezone: string
) {
  // Rango del día en UTC para queries
  // fromZonedTime convierte fecha local → UTC (inverso de toZonedTime)
  const inicioDiaUtc = fromZonedTime(startOfDay(fechaLocal), timezone)
  const finDiaUtc = fromZonedTime(endOfDay(fechaLocal), timezone)

  // Obtener pedidos del día para este colegio
  const pedidos = await prisma.pedido.findMany({
    where: {
      tenantId,
      colegioId,
      createdAt: {
        gte: inicioDiaUtc,
        lte: finDiaUtc,
      },
      deletedAt: null,
    },
    include: {
      Items: {
        include: {
          OpcionMenu: { select: { nombre: true } },
          ProductoKiosco: { select: { nombre: true } },
        },
      },
    },
  })

  // Calcular métricas
  const totalPedidos = pedidos.length
  const totalPagados = pedidos.filter((p) => p.estado === "PAGADO").length
  const totalCancelados = pedidos.filter((p) => p.estado === "CANCELADO").length
  const totalExpirados = pedidos.filter((p) => p.estado === "EXPIRADO").length

  // Retirados y no retirados solo cuentan entre pagados
  const pedidosPagados = pedidos.filter((p) => p.estado === "PAGADO")
  const totalRetirados = pedidosPagados.filter((p) =>
    p.Items.every((item) => item.retiradoAt !== null)
  ).length
  const totalNoRetirados = pedidosPagados.filter((p) =>
    p.Items.some((item) => item.retiradoAt === null)
  ).length

  // Ingresos: suma de total de pedidos pagados (en CLP enteros)
  const totalIngresos = pedidosPagados.reduce((sum, p) => sum + p.total, 0)

  // Créditos generados por cancelaciones
  const totalCreditos = pedidos
    .filter((p) => p.estado === "CANCELADO")
    .reduce((sum, p) => sum + p.creditoAplicado, 0)

  // Ticket promedio (evita división por cero)
  const ticketPromedio = totalPagados > 0 ? Math.round(totalIngresos / totalPagados) : 0

  // Distribución por opción de menú
  const distribucionOpciones: Record<string, number> = {}
  const distribucionKiosco: Record<string, number> = {}

  for (const pedido of pedidosPagados) {
    for (const item of pedido.Items) {
      if (item.opcionMenuId && item.OpcionMenu) {
        const nombre = item.OpcionMenu.nombre
        distribucionOpciones[nombre] = (distribucionOpciones[nombre] || 0) + 1
      }
      if (item.productoKioscoId && item.ProductoKiosco) {
        const nombre = item.ProductoKiosco.nombre
        distribucionKiosco[nombre] = (distribucionKiosco[nombre] || 0) + 1
      }
    }
  }

  // Fecha como Date sin hora para el unique constraint
  const fechaSolo = new Date(
    fechaLocal.getFullYear(),
    fechaLocal.getMonth(),
    fechaLocal.getDate(),
    12, // mediodía UTC para evitar offset issues con @db.Date
    0,
    0
  )

  // Upsert idempotente
  const snapshot = await prisma.kpiSnapshot.upsert({
    where: {
      colegioId_fecha: {
        colegioId,
        fecha: fechaSolo,
      },
    },
    create: {
      tenantId,
      colegioId,
      fecha: fechaSolo,
      totalPedidos,
      totalPagados,
      totalCancelados,
      totalExpirados,
      totalRetirados,
      totalNoRetirados,
      totalIngresos,
      totalCreditos,
      ticketPromedio,
      distribucionOpciones,
      distribucionKiosco,
    },
    update: {
      totalPedidos,
      totalPagados,
      totalCancelados,
      totalExpirados,
      totalRetirados,
      totalNoRetirados,
      totalIngresos,
      totalCreditos,
      ticketPromedio,
      distribucionOpciones,
      distribucionKiosco,
    },
  })

  return snapshot
}
