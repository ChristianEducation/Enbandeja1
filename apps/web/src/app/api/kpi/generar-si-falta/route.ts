// ═══════════════════════════════════════════════════════════════════
// POST /api/kpi/generar-si-falta — Generación lazy on-demand
// ═══════════════════════════════════════════════════════════════════
// Si el Owner abre el dashboard y falta el snapshot de un período,
// se calcula en el momento y se guarda. No bloquea la carga del
// dashboard porque el Server Component ya pasó los snapshots
// existentes y este endpoint se llama solo para los faltantes.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"
import { generarKpiSnapshot } from "@/lib/kpi/generar-snapshot"
import { toZonedTime } from "date-fns-tz"
import { startOfDay, parse } from "date-fns"

const GenerarSiFaltaSchema = z.object({
  colegioId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
})

export const POST = withAuth(
  async (req: NextRequest, context: SessionContext) => {
    if (context.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Solo el owner puede generar snapshots" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = GenerarSiFaltaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos" },
        { status: 400 }
      )
    }

    const { colegioId, fecha } = parsed.data

    // Obtener timezone del tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
      select: { timezone: true },
    })

    const timezone = tenant?.timezone || "America/Santiago"

    // Verificar que el colegio pertenece al tenant
    const colegio = await prisma.colegio.findFirst({
      where: { id: colegioId, tenantId: context.tenantId, deletedAt: null },
      select: { id: true },
    })

    if (!colegio) {
      return NextResponse.json(
        { success: false, error: "Colegio no encontrado" },
        { status: 404 }
      )
    }

    // Parsear fecha local
    const fechaLocal = parse(fecha, "yyyy-MM-dd", new Date())
    const fechaDate = new Date(fechaLocal.getFullYear(), fechaLocal.getMonth(), fechaLocal.getDate(), 12, 0, 0)

    // Verificar si ya existe
    const existente = await prisma.kpiSnapshot.findUnique({
      where: {
        colegioId_fecha: {
          colegioId,
          fecha: fechaDate,
        },
      },
    })

    if (existente) {
      return NextResponse.json({ success: true, snapshot: existente, generado: false })
    }

    // Generar snapshot
    const snapshot = await generarKpiSnapshot(
      context.tenantId,
      colegioId,
      fechaLocal,
      timezone
    )

    return NextResponse.json({ success: true, snapshot, generado: true })
  }
)
