// ═══════════════════════════════════════════════════════════════════
// /api/kiosco/producto — CRUD de ProductoKiosco
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const ProductoSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(1),
  descripcion: z.string().nullable().optional(),
  precio: z.number().int().min(0),
  stockDiario: z.number().int().nullable().optional(),
  categoriaKioscoId: z.string().uuid().nullable().optional(),
})

// POST — crear producto
export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  if (context.role !== "OPERADOR" && context.role !== "OWNER") {
    return NextResponse.json({ success: false, error: "Solo operador u owner" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ProductoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Datos inválidos", details: parsed.error.issues }, { status: 400 })
  }

  const db = createTenantClient(context.tenantId, context.userId)

  // Obtener primer colegio con kiosco activo
  const colegio = await db.colegio.findFirst({
    where: { kioscoActivo: true, isActive: true, deletedAt: null },
    select: { id: true },
  })

  if (!colegio) {
    return NextResponse.json({ success: false, error: "No hay colegio con kiosco activo" }, { status: 400 })
  }

  const { nombre, descripcion, precio, stockDiario, categoriaKioscoId } = parsed.data

  const producto = await db.productoKiosco.create({
    data: {
      tenantId: context.tenantId,
      colegioId: colegio.id,
      nombre,
      descripcion,
      precio,
      stockDiario,
      stockActual: stockDiario,
      categoriaKioscoId,
    },
  })

  return NextResponse.json({ success: true, productoId: producto.id })
})

// PUT — actualizar producto
export const PUT = withAuth(async (req: NextRequest, context: SessionContext) => {
  if (context.role !== "OPERADOR" && context.role !== "OWNER") {
    return NextResponse.json({ success: false, error: "Solo operador u owner" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ProductoSchema.extend({ id: z.string().uuid() }).safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Datos inválidos", details: parsed.error.issues }, { status: 400 })
  }

  const { id, nombre, descripcion, precio, stockDiario, categoriaKioscoId } = parsed.data
  const db = createTenantClient(context.tenantId, context.userId)

  await db.productoKiosco.update({
    where: { id },
    data: {
      nombre,
      descripcion,
      precio,
      stockDiario,
      categoriaKioscoId,
    },
  })

  return NextResponse.json({ success: true })
})
