// ═══════════════════════════════════════════════════════════════════
// GET /api/reportes/listar — Lista reportes generados del tenant
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"

export const GET = withAuth(
  async (req: NextRequest, context: SessionContext) => {
    if (context.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Solo el owner puede ver reportes" },
        { status: 403 }
      )
    }

    const reportes = await prisma.reporteExportacion.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        Colegio: { select: { nombre: true } },
      },
    })

    const data = reportes.map((r) => ({
      id: r.id,
      periodo: r.periodo,
      tipo: r.tipo,
      estado: r.estado,
      colegioNombre: r.Colegio?.nombre || "Todos los colegios",
      fileName: r.fileName,
      fileSizeBytes: r.fileSizeBytes,
      generadoAt: r.generadoAt?.toISOString() || null,
      expiraAt: r.expiraAt?.toISOString() || null,
      createdAt: r.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, reportes: data })
  }
)
