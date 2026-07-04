// ═══════════════════════════════════════════════════════════════════
// POST /api/kiosco/reponer-stock — Reponer stock de un producto
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const ReponerStockSchema = z.object({
  productoId: z.string().uuid(),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  if (context.role !== "OPERADOR") {
    return NextResponse.json({ success: false, error: "Solo el operador" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ReponerStockSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 })
  }

  const { productoId } = parsed.data
  const db = createTenantClient(context.tenantId, context.userId)

  const producto = await db.productoKiosco.findUnique({
    where: { id: productoId },
    select: { id: true, stockDiario: true, stockActual: true },
  })

  if (!producto) {
    return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
  }

  if (!producto.stockDiario) {
    return NextResponse.json({ success: false, error: "Este producto no tiene stock diario configurado" }, { status: 400 })
  }

  // Reponer: stockActual = stockDiario
  await db.productoKiosco.update({
    where: { id: productoId },
    data: { stockActual: producto.stockDiario },
  })

  await db.auditLog.create({
    data: {
      tenantId: context.tenantId,
      userId: context.userId,
      action: "REPONER_STOCK_KIOSCO",
      entityType: "ProductoKiosco",
      entityId: productoId,
      changes: { stockAnterior: producto.stockActual, stockNuevo: producto.stockDiario },
    },
  })

  return NextResponse.json({ success: true })
})
