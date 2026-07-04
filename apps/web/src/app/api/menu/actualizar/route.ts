// ═══════════════════════════════════════════════════════════════════
// POST /api/menu/actualizar — Actualizar menú existente
// ═══════════════════════════════════════════════════════════════════
// Solo OPERADOR. Solo si estado === BORRADOR.
// Transacción atómica: elimina opciones viejas, crea nuevas + precios
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"
import { toZonedTime } from "date-fns-tz"
import { format } from "date-fns"

const ActualizarMenuSchema = z.object({
  menuId: z.string().uuid(),
  estado: z.enum(["BORRADOR", "PUBLICADO"]).optional(),
  opciones: z.array(z.object({
    id: z.string().uuid().optional(),
    nombre: z.string().min(1),
    descripcion: z.string().nullable().optional(),
    categoria: z.string().nullable().optional(),
    stockMax: z.number().int().nullable().optional(),
    estado: z.string().optional(),
    orden: z.number().int().optional(),
    precios: z.array(z.object({
      categoriaPrecioId: z.string().uuid(),
      precio: z.number().int().min(0),
    })),
  })).min(1),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  try {
    if (context.role !== "OPERADOR") {
      return NextResponse.json(
        { success: false, error: "Solo el operador puede actualizar menús" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = ActualizarMenuSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { menuId, estado: nuevoEstado, opciones } = parsed.data
    const db = createTenantClient(context.tenantId, context.userId)

    // Verificar menú existe y es BORRADOR
    const menu = await db.menu.findUnique({
      where: { id: menuId },
      select: { id: true, estado: true, colegioId: true },
    })

    if (!menu) {
      return NextResponse.json(
        { success: false, error: "Menú no encontrado" },
        { status: 404 }
      )
    }

    if (menu.estado !== "BORRADOR") {
      return NextResponse.json(
        { success: false, error: "Solo se pueden editar menús en estado BORRADOR" },
        { status: 400 }
      )
    }

    // Validar publicación si aplica
    const sePublica = nuevoEstado === "PUBLICADO"
    if (sePublica) {
      const tenant = await db.tenant.findFirst({
        where: { id: context.tenantId },
        select: { timezone: true },
      })
      const timezone = tenant?.timezone || "America/Santiago"
      const hoyStr = format(toZonedTime(new Date(), timezone), "yyyy-MM-dd")
      const menuFecha = await db.menu.findUnique({
        where: { id: menuId },
        select: { fecha: true },
      })
      const fechaStr = menuFecha?.fecha instanceof Date
        ? format(menuFecha.fecha, "yyyy-MM-dd")
        : ""

      if (fechaStr < hoyStr) {
        return NextResponse.json(
          { success: false, error: "No se puede publicar un menú con fecha pasada" },
          { status: 400 }
        )
      }

      // Validar que todas las categorías tienen precio
      const categorias = await db.categoriaPrecio.findMany({
        where: { colegioId: menu.colegioId, isActive: true, deletedAt: null },
        select: { id: true },
      })
      const catIds = categorias.map((c: any) => c.id)
      for (const op of opciones) {
        const preciosCatIds = op.precios.map((p) => p.categoriaPrecioId)
        const faltantes = catIds.filter((id: string) => !preciosCatIds.includes(id))
        if (faltantes.length > 0) {
          return NextResponse.json(
            { success: false, error: `La opción "${op.nombre}" no tiene precios para todas las categorías` },
            { status: 400 }
          )
        }
      }
    }

    // Transacción atómica: eliminar opciones viejas + crear nuevas
    await db.$transaction(async (tx: any) => {
      // Eliminar opciones existentes (y sus precios por cascade)
      const opcionesViejas = await tx.opcionMenu.findMany({
        where: { menuId },
        select: { id: true },
      })
      for (const opVieja of opcionesViejas) {
        await tx.precioOpcion.deleteMany({
          where: { opcionMenuId: opVieja.id },
        })
      }
      await tx.opcionMenu.deleteMany({
        where: { menuId },
      })

      // Crear nuevas opciones con precios
      for (let i = 0; i < opciones.length; i++) {
        const op = opciones[i]!
        const opcionMenu = await tx.opcionMenu.create({
          data: {
            tenantId: context.tenantId,
            menuId,
            nombre: op.nombre!,
            descripcion: op.descripcion ?? null,
            categoria: op.categoria ?? null,
            stockMax: op.stockMax ?? null,
            stockActual: op.stockMax ?? null,
            estado: (op.estado as any) || "ACTIVA",
            orden: op.orden ?? i,
          },
        })

        for (const precio of op.precios ?? []) {
          await tx.precioOpcion.create({
            data: {
              tenantId: context.tenantId,
              opcionMenuId: opcionMenu.id,
              categoriaPrecioId: precio.categoriaPrecioId,
              precio: precio.precio,
            },
          })
        }
      }

      // Actualizar estado del menú si se publica
      if (sePublica) {
        await tx.menu.update({
          where: { id: menuId },
          data: { estado: "PUBLICADO" },
        })
      }

      await tx.auditLog.create({
        data: {
          tenantId: context.tenantId,
          userId: context.userId,
          action: sePublica ? "PUBLICAR_MENU" : "ACTUALIZAR_MENU",
          entityType: "Menu",
          entityId: menuId,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[menu/actualizar] Error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
})
