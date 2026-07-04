// ═══════════════════════════════════════════════════════════════════
// GET /api/reportes/descargar — URL firmada temporal para descargar
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { generarUrlFirmada } from "@/lib/storage"

export const GET = withAuth(
  async (req: NextRequest, context: SessionContext) => {
    if (context.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Solo el owner puede descargar reportes" },
        { status: 403 }
      )
    }

    const url = new URL(req.url)
    const reporteId = url.searchParams.get("reporteId")

    if (!reporteId) {
      return NextResponse.json(
        { success: false, error: "Falta reporteId" },
        { status: 400 }
      )
    }

    const reporte = await prisma.reporteExportacion.findFirst({
      where: { id: reporteId, tenantId: context.tenantId },
    })

    if (!reporte) {
      return NextResponse.json(
        { success: false, error: "Reporte no encontrado" },
        { status: 404 }
      )
    }

    if (reporte.estado !== "LISTO" || !reporte.storagePath) {
      return NextResponse.json(
        { success: false, error: "Reporte no está listo para descargar" },
        { status: 400 }
      )
    }

    // Verificar expiración
    if (reporte.expiraAt && reporte.expiraAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "El reporte ha expirado. Genera uno nuevo." },
        { status: 410 }
      )
    }

    // Generar URL firmada (1 hora)
    const downloadUrl = await generarUrlFirmada(reporte.storagePath, 3600)

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      fileName: reporte.fileName || `reporte-${reporte.periodo}.xlsx`,
    })
  }
)
