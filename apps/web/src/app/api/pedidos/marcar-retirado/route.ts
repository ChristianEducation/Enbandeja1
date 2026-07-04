// ═══════════════════════════════════════════════════════════════════
// POST /api/pedidos/marcar-retirado — Marcar pedido como retirado
// ═══════════════════════════════════════════════════════════════════
// Solo OPERADOR puede marcar retiros.
// Valida que el pedido pertenece al tenant.
// Transición: PAGADO/NO_RETIRADO → RETIRADO
// Marca todos los items como retirado=true.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const MarcarRetiradoSchema = z.object({
  pedidoId: z.string().uuid(),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  try {
    // Validar rol OPERADOR
    if (context.role !== "OPERADOR") {
      return NextResponse.json(
        { success: false, error: "Solo el operador puede marcar retiros" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = MarcarRetiradoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { pedidoId } = parsed.data
    const db = createTenantClient(context.tenantId, context.userId)

    // Verificar que el pedido existe y está en estado válido
    const pedido = await db.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, estado: true },
    })

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    if (pedido.estado !== "PAGADO" && pedido.estado !== "NO_RETIRADO") {
      return NextResponse.json(
        { success: false, error: `No se puede marcar como retirado un pedido en estado ${pedido.estado}` },
        { status: 400 }
      )
    }

    // Actualizar pedido y items
    await db.$transaction(async (tx: any) => {
      await tx.pedido.update({
        where: { id: pedidoId },
        data: { estado: "RETIRADO" },
      })

      await tx.pedidoItem.updateMany({
        where: { pedidoId, cancelado: false },
        data: { retirado: true, retiradoAt: new Date() },
      })

      await tx.auditLog.create({
        data: {
          tenantId: context.tenantId,
          userId: context.userId,
          action: "MARCAR_RETIRADO",
          entityType: "Pedido",
          entityId: pedidoId,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[pedidos/marcar-retirado] Error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
})
