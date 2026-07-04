// ═══════════════════════════════════════════════════════════════════
// POST /api/reportes/generar — Disparar exportación Excel mensual
// ═══════════════════════════════════════════════════════════════════
// Crea registro ReporteExportacion en estado PENDIENTE.
// Genera el Excel de forma sincrónica (en v1 sin Inngest real).
// Sube a Supabase Storage con URL firmada.
// Notifica al Owner vía push cuando está listo.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"
import { generarExcelConsolidado } from "@/lib/reportes/generar-excel-consolidado"
import { subirArchivo } from "@/lib/storage"

const GenerarReporteSchema = z.object({
  periodo: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  colegioId: z.string().uuid().optional(),
})

export const POST = withAuth(
  async (req: NextRequest, context: SessionContext) => {
    if (context.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Solo el owner puede generar reportes" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = GenerarReporteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos" },
        { status: 400 }
      )
    }

    const { periodo, colegioId } = parsed.data
    const parts = periodo.split("-")
    const anio = Number(parts[0])
    const mes = Number(parts[1])

    // Crear registro en estado GENERANDO
    const reporte = await prisma.reporteExportacion.create({
      data: {
        tenantId: context.tenantId,
        colegioId: colegioId || null,
        tipo: "EXCEL_MENSUAL",
        periodo,
        estado: "GENERANDO",
        solicitadoById: context.userId,
      },
    })

    try {
      // Generar Excel
      const buffer = await generarExcelConsolidado({
        tenantId: context.tenantId,
        anio,
        mes,
        colegioId,
      })

      // Subir a Storage
      const storagePath = `exportaciones/${context.tenantId}/${periodo}${colegioId ? `-${colegioId}` : ""}-${reporte.id.slice(0, 8)}.xlsx`
      await subirArchivo(buffer, storagePath)

      // Actualizar registro como LISTO
      await prisma.reporteExportacion.update({
        where: { id: reporte.id },
        data: {
          estado: "LISTO",
          storagePath,
          fileName: `reporte-${periodo}.xlsx`,
          fileSizeBytes: buffer.length as number,
          generadoAt: new Date(),
          expiraAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        },
      })

      // Notificación push al Owner (fire-and-forget)
      try {
        const { crearNotificacion } = await import("@/lib/push/send")
        await crearNotificacion(
          context.tenantId,
          context.userId,
          "REPORTE_LISTO",
          "Reporte listo",
          `El reporte de ${periodo} está disponible para descargar.`,
          "PUSH"
        )
      } catch {
        // Notificación es best-effort, no bloquea
      }

      return NextResponse.json({ success: true, reporteId: reporte.id })
    } catch (error) {
      // Marcar como ERROR
      await prisma.reporteExportacion.update({
        where: { id: reporte.id },
        data: { estado: "ERROR" },
      })
      console.error("Error generando reporte:", error)
      return NextResponse.json(
        { success: false, error: "Error al generar el reporte" },
        { status: 500 }
      )
    }
  }
)
