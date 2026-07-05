// ═══════════════════════════════════════════════════════════════════
// POST /api/menu/crear — Crear menú del día con opciones y precios
// ═══════════════════════════════════════════════════════════════════
// OPERADOR u OWNER. Transacción atómica: Menu + OpcionMenu + PrecioOpcion
// Validación: no permitir menú en fecha pasada si se publica
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"
import { toZonedTime } from "date-fns-tz"
import { format, parseISO } from "date-fns"

const CrearMenuSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  colegioId: z.string().uuid(),
  estado: z.enum(["BORRADOR", "PUBLICADO"]).default("BORRADOR"),
  opciones: z.array(z.object({
    nombre: z.string().min(1),
    descripcion: z.string().nullable().optional(),
    categoria: z.string().nullable().optional(),
    stockMax: z.number().int().nullable().optional(),
    precios: z.array(z.object({
      categoriaPrecioId: z.string().uuid(),
      precio: z.number().int().min(0),
    })).min(1, "Cada opción debe tener al menos un precio"),
  })).min(1, "Debe haber al menos una opción"),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  try {
    if (context.role !== "OPERADOR" && context.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Solo operador u owner pueden crear menús" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = CrearMenuSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { fecha, colegioId, estado, opciones } = parsed.data
    const db = createTenantClient(context.tenantId, context.userId)

    // Validar fecha pasada si se publica
    if (estado === "PUBLICADO") {
      const tenant = await db.tenant.findFirst({
        where: { id: context.tenantId },
        select: { timezone: true },
      })
      const timezone = tenant?.timezone || "America/Santiago"
      const hoyStr = format(toZonedTime(new Date(), timezone), "yyyy-MM-dd")
      if (fecha < hoyStr) {
        return NextResponse.json(
          { success: false, error: "No se puede publicar un menú con fecha pasada" },
          { status: 400 }
        )
      }

      // Validar que todas las categorías de precio del colegio tienen precio
      const categorias = await db.categoriaPrecio.findMany({
        where: { tenantId: context.tenantId, colegioId, isActive: true, deletedAt: null },
        select: { id: true },
      })
      const catIds = categorias.map((c: any) => c.id)
      for (const op of opciones) {
        const preciosCatIds = op.precios.map((p) => p.categoriaPrecioId)
        const faltantes = catIds.filter((id: string) => !preciosCatIds.includes(id))
        if (faltantes.length > 0) {
          return NextResponse.json(
            { success: false, error: `La opción "${op.nombre}" no tiene precios para todas las categorías del colegio` },
            { status: 400 }
          )
        }
      }
    }

    // Verificar que no existe menú para esa fecha + colegio
    const fechaDate = parseISO(fecha)
    const existente = await db.menu.findFirst({
      where: { tenantId: context.tenantId, colegioId, fecha: fechaDate },
    })
    if (existente) {
      return NextResponse.json(
        { success: false, error: "Ya existe un menú para esa fecha en este colegio" },
        { status: 409 }
      )
    }

    // Crear menú con opciones y precios en transacción
    const menu = await db.$transaction(async (tx: any) => {
      const nuevoMenu = await tx.menu.create({
        data: {
          tenantId: context.tenantId,
          colegioId,
          fecha: fechaDate,
          estado,
        },
      })

      for (let i = 0; i < opciones.length; i++) {
        const op = opciones[i]!
        const opcionMenu = await tx.opcionMenu.create({
          data: {
            tenantId: context.tenantId,
            menuId: nuevoMenu.id,
            nombre: op.nombre!,
            descripcion: op.descripcion ?? null,
            categoria: op.categoria ?? null,
            stockMax: op.stockMax ?? null,
            stockActual: op.stockMax ?? null,
            estado: "ACTIVA",
            orden: i,
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

      await tx.auditLog.create({
        data: {
          tenantId: context.tenantId,
          userId: context.userId,
          action: "CREAR_MENU",
          entityType: "Menu",
          entityId: nuevoMenu.id,
          changes: { fecha, estado, opcionesCount: opciones.length },
        },
      })

      return nuevoMenu
    })

    return NextResponse.json({ success: true, menuId: menu.id })
  } catch (error) {
    console.error("[menu/crear] Error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
})
