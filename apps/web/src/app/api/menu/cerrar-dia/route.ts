// ═══════════════════════════════════════════════════════════════════
// POST /api/menu/cerrar-dia — Cierre manual de la ventana del día
// ═══════════════════════════════════════════════════════════════════
// OPERADOR u OWNER. Cambia menú PUBLICADO → CERRADO para la fecha dada.
// Esto bloquea nuevos pedidos para ese día (el middleware de creación
// verifica que el menú esté PUBLICADO antes de permitir pedidos).
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const CerrarDiaSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  colegioId: z.string().uuid().optional(),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  try {
    if (context.role !== "OPERADOR" && context.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Solo operador u owner pueden cerrar el día" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = CerrarDiaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    let { fecha, colegioId } = parsed.data
    const db = createTenantClient(context.tenantId, context.userId)

    // Si no se envió colegioId, intentar resolverlo automáticamente
    if (!colegioId) {
      const colegios = await db.colegio.findMany({
        where: { tenantId: context.tenantId, isActive: true, deletedAt: null },
        select: { id: true, nombre: true },
      })

      if (colegios.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No hay colegios activos en el tenant' },
          { status: 400 }
        )
      }

      if (colegios.length === 1) {
        colegioId = colegios[0]!.id
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Tienes varios colegios. Selecciona cuál cerrar enviando colegioId.',
            colegios: colegios.map((c) => ({ id: c.id, nombre: c.nombre })),
          },
          { status: 400 }
        )
      }
    }

    // Después del fallback, colegioId siempre está definido
    // (los casos sin resolver retornan antes)
    const resolvedcolegioId = colegioId!

    const fechaDate = new Date(`${fecha}T00:00:00`)

    // Buscar menú PUBLICADO para esa fecha
    const menu = await db.menu.findFirst({
      where: {
        tenantId: context.tenantId,
        colegioId: resolvedcolegioId,
        fecha: fechaDate,
        estado: "PUBLICADO",
      },
    })

    if (!menu) {
      return NextResponse.json(
        { success: false, error: "No hay menú PUBLICADO para esa fecha" },
        { status: 404 }
      )
    }

    // Cambiar a CERRADO
    await db.menu.update({
      where: { id: menu.id },
      data: { estado: "CERRADO" },
    })

    await db.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: "CERRAR_DIA",
        entityType: "Menu",
        entityId: menu.id,
        changes: { fecha, estadoAnterior: "PUBLICADO", estadoNuevo: "CERRADO" },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[menu/cerrar-dia] Error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
})
