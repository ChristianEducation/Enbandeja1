// ═══════════════════════════════════════════════════════════════════
// generar-excel-consolidado.ts — Genera Excel del mes consolidado
// ═══════════════════════════════════════════════════════════════════

import { prisma } from "@enbandeja/database"
import * as XLSX from "xlsx-js-style"

interface FilaResumen {
  colegio: string
  fecha: string
  totalPedidos: number
  totalPagados: number
  totalCancelados: number
  totalRetirados: number
  totalNoRetirados: number
  totalIngresos: number
  ticketPromedio: number
}

interface ConsolidadoColegio {
  nombre: string
  pedidos: number
  pagados: number
  ingresos: number
  retirados: number
  ticket: number
  dias: number
}

/**
 * Genera un Excel consolidado del mes para un tenant.
 * Si colegioId es null, incluye todos los colegios.
 * Usa KpiSnapshot como fuente principal.
 */
export async function generarExcelConsolidado(params: {
  tenantId: string
  anio: number
  mes: number
  colegioId?: string
}): Promise<Buffer> {
  const { tenantId, anio, mes, colegioId } = params

  // Rango del mes en fechas Date (mediodía UTC para @db.Date)
  const desde = new Date(anio, mes - 1, 1, 12, 0, 0)
  const hasta = new Date(anio, mes, 0, 12, 0, 0) // último día del mes

  // Obtener snapshots
  const where: Record<string, unknown> = {
    tenantId,
    fecha: { gte: desde, lte: hasta },
  }
  if (colegioId) where.colegioId = colegioId

  const snapshots = await prisma.kpiSnapshot.findMany({
    where,
    orderBy: [{ colegioId: "asc" }, { fecha: "asc" }],
    include: { Colegio: { select: { nombre: true } } },
  })

  // Mapear a filas
  const filas: FilaResumen[] = snapshots.map((s) => ({
    colegio: s.Colegio.nombre,
    fecha: s.fecha.toISOString().slice(0, 10),
    totalPedidos: s.totalPedidos,
    totalPagados: s.totalPagados,
    totalCancelados: s.totalCancelados,
    totalRetirados: s.totalRetirados,
    totalNoRetirados: s.totalNoRetirados,
    totalIngresos: s.totalIngresos,
    ticketPromedio: s.ticketPromedio,
  }))

  // Crear workbook
  const wb = XLSX.utils.book_new()

  // --- Hoja 1: Resumen diario por colegio ---
  const ws1 = XLSX.utils.json_to_sheet(filas, {
    header: [
      "colegio", "fecha", "totalPedidos", "totalPagados", "totalCancelados",
      "totalRetirados", "totalNoRetirados", "totalIngresos", "ticketPromedio",
    ],
  })

  XLSX.utils.sheet_add_aoa(ws1, [
    ["Colegio", "Fecha", "Total Pedidos", "Pagados", "Cancelados",
     "Retirados", "No Retirados", "Ingresos (CLP)", "Ticket Promedio (CLP)"],
  ], { origin: "A1" })

  ws1["!cols"] = [
    { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 12 },
    { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(wb, ws1, "Resumen Diario")

  // --- Hoja 2: Consolidado por colegio ---
  const porColegio: Record<string, ConsolidadoColegio> = {}
  for (const f of filas) {
    const existing = porColegio[f.colegio]
    if (existing) {
      existing.pedidos += f.totalPedidos
      existing.pagados += f.totalPagados
      existing.ingresos += f.totalIngresos
      existing.retirados += f.totalRetirados
      existing.dias++
    } else {
      porColegio[f.colegio] = {
        nombre: f.colegio,
        pedidos: f.totalPedidos,
        pagados: f.totalPagados,
        ingresos: f.totalIngresos,
        retirados: f.totalRetirados,
        ticket: 0,
        dias: 1,
      }
    }
  }
  // Calcular ticket promedio por colegio
  for (const key of Object.keys(porColegio)) {
    const c = porColegio[key]
    if (c) c.ticket = c.pagados > 0 ? Math.round(c.ingresos / c.pagados) : 0
  }

  const consolidadoFilas = Object.values(porColegio)
  const ws2 = XLSX.utils.json_to_sheet(consolidadoFilas, {
    header: ["nombre", "pedidos", "pagados", "ingresos", "retirados", "ticket", "dias"],
  })
  XLSX.utils.sheet_add_aoa(ws2, [
    ["Colegio", "Total Pedidos", "Pagados", "Ingresos (CLP)", "Retirados", "Ticket Promedio (CLP)", "Días con datos"],
  ], { origin: "A1" })

  ws2["!cols"] = [
    { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 18 }, { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(wb, ws2, "Consolidado por Colegio")

  // Generar buffer
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer
  return buf
}
