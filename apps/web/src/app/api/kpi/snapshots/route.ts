// ═══════════════════════════════════════════════════════════════════
// GET /api/kpi/snapshots — Obtener snapshots para el dashboard
// ═══════════════════════════════════════════════════════════════════
// Recibe rango de fechas y opcionalmente colegioId.
// Retorna snapshots existentes para ese rango.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const SnapshotsQuerySchema = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  colegioId: z.string().uuid().optional(),
})

function fechaToISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export const GET = withAuth(
  async (req: NextRequest, context: SessionContext) => {
    if (context.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Solo el owner puede ver snapshots" },
        { status: 403 }
      )
    }

    const url = new URL(req.url)
    const query = {
      desde: url.searchParams.get("desde") || "",
      hasta: url.searchParams.get("hasta") || "",
      colegioId: url.searchParams.get("colegioId") || undefined,
    }

    const parsed = SnapshotsQuerySchema.safeParse(query)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Parámetros inválidos" },
        { status: 400 }
      )
    }

    const { desde, hasta, colegioId } = parsed.data

    // Fechas como Date (mediodía UTC para evitar offset con @db.Date)
    const desdeDate = new Date(`${desde}T12:00:00Z`)
    const hastaDate = new Date(`${hasta}T12:00:00Z`)

    // Si es consolidado (sin colegioId)
    if (!colegioId) {
      const snapshots = await prisma.kpiSnapshot.findMany({
        where: {
          tenantId: context.tenantId,
          fecha: { gte: desdeDate, lte: hastaDate },
        },
        orderBy: { fecha: "asc" },
        include: { Colegio: { select: { nombre: true } } },
      })

      // Agrupar por fecha para vista consolidada
      const porFecha: Record<string, typeof snapshots> = {}
      for (const s of snapshots) {
        const key = fechaToISO(s.fecha)
        if (!porFecha[key]) porFecha[key] = []
        porFecha[key].push(s)
      }

      // Calcular consolidado por fecha
      const consolidado = Object.entries(porFecha)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, snaps]) => ({
          fecha,
          totalPedidos: snaps.reduce((s, x) => s + x.totalPedidos, 0),
          totalPagados: snaps.reduce((s, x) => s + x.totalPagados, 0),
          totalCancelados: snaps.reduce((s, x) => s + x.totalCancelados, 0),
          totalExpirados: snaps.reduce((s, x) => s + x.totalExpirados, 0),
          totalRetirados: snaps.reduce((s, x) => s + x.totalRetirados, 0),
          totalNoRetirados: snaps.reduce((s, x) => s + x.totalNoRetirados, 0),
          totalIngresos: snaps.reduce((s, x) => s + x.totalIngresos, 0),
          totalCreditos: snaps.reduce((s, x) => s + x.totalCreditos, 0),
          ticketPromedio:
            snaps.reduce((s, x) => s + x.totalPagados, 0) > 0
              ? Math.round(
                  snaps.reduce((s, x) => s + x.totalIngresos, 0) /
                  snaps.reduce((s, x) => s + x.totalPagados, 0)
                )
              : 0,
          porColegio: snaps.map((s) => ({
            colegioId: s.colegioId,
            colegioNombre: s.Colegio.nombre,
            totalPedidos: s.totalPedidos,
            totalPagados: s.totalPagados,
            totalIngresos: s.totalIngresos,
            totalRetirados: s.totalRetirados,
            totalNoRetirados: s.totalNoRetirados,
            ticketPromedio: s.ticketPromedio,
          })),
        }))

      return NextResponse.json({ success: true, consolidado })
    }

    // Snapshot de un colegio específico
    const snapshots = await prisma.kpiSnapshot.findMany({
      where: {
        tenantId: context.tenantId,
        colegioId,
        fecha: { gte: desdeDate, lte: hastaDate },
      },
      orderBy: { fecha: "asc" },
      include: { Colegio: { select: { nombre: true } } },
    })

    return NextResponse.json({ success: true, snapshots })
  }
)
