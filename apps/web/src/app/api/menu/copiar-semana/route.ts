// ═══════════════════════════════════════════════════════════════════
// POST /api/menu/copiar-semana — Copiar menús de la semana anterior
// ═══════════════════════════════════════════════════════════════════
// Transacción atómica que duplica menús + opciones + precios
// Idempotente: no duplica si ya existe menú para esa fecha
// Toma la semana más reciente con menús como origen
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { addDays } from "date-fns"

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  try {
    if (context.role !== "OPERADOR") {
      return NextResponse.json(
        { success: false, error: "Solo el operador puede copiar menús" },
        { status: 403 }
      )
    }

    const db = createTenantClient(context.tenantId, context.userId)

    // Buscar la semana más reciente con menús PUBLICADOS o BORRADOR
    const menusRecientes = await db.menu.findMany({
      where: {
        estado: { in: ["PUBLICADO", "BORRADOR"] },
      },
      include: {
        Opciones: {
          include: {
            Precios: {
              select: {
                categoriaPrecioId: true,
                precio: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
      take: 7, // Última semana
    })

    if (menusRecientes.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay menús anteriores para copiar" },
        { status: 400 }
      )
    }

    // Calcular offset: la diferencia entre la última fecha y "próxima semana"
    const ultimoMenu = menusRecientes[0]!
    const ultimaFecha = ultimoMenu.fecha instanceof Date
      ? ultimoMenu.fecha
      : new Date(ultimoMenu.fecha as string)
    const offsetDias = 7 // Siempre copiar a la semana siguiente

    let copiados = 0

    await db.$transaction(async (tx: any) => {
      for (const menuOrigen of menusRecientes) {
        const fechaOrigen = menuOrigen.fecha instanceof Date
          ? menuOrigen.fecha
          : new Date(menuOrigen.fecha as string)
        const fechaDestino = addDays(fechaOrigen, offsetDias)

        // Idempotencia: verificar si ya existe menú para la fecha destino
        const existente = await tx.menu.findFirst({
          where: {
            colegioId: menuOrigen.colegioId!,
            fecha: fechaDestino,
          },
        })

        if (existente) continue // Ya existe, saltar

        // Crear menú destino como BORRADOR
        const nuevoMenu = await tx.menu.create({
          data: {
            tenantId: context.tenantId,
            colegioId: menuOrigen.colegioId,
            fecha: fechaDestino,
            estado: "BORRADOR",
          },
        })

        // Copiar opciones y precios
        for (const opcionOrigen of menuOrigen.Opciones) {
          const opcionDestino = await tx.opcionMenu.create({
            data: {
              tenantId: context.tenantId,
              menuId: nuevoMenu.id,
              nombre: opcionOrigen.nombre,
              descripcion: opcionOrigen.descripcion,
              categoria: opcionOrigen.categoria,
              stockMax: opcionOrigen.stockMax,
              stockActual: opcionOrigen.stockMax, // Reset stock
              estado: "ACTIVA",
              orden: opcionOrigen.orden,
            },
          })

          for (const precioOrigen of opcionOrigen.Precios) {
            await tx.precioOpcion.create({
              data: {
                tenantId: context.tenantId,
                opcionMenuId: opcionDestino.id,
                categoriaPrecioId: precioOrigen.categoriaPrecioId,
                precio: precioOrigen.precio,
              },
            })
          }
        }

        copiados++
      }

      if (copiados > 0) {
        await tx.auditLog.create({
          data: {
            tenantId: context.tenantId,
            userId: context.userId,
            action: "COPIAR_SEMANA_MENU",
            entityType: "Menu",
            entityId: context.tenantId,
            changes: { copiados },
          },
        })
      }
    })

    return NextResponse.json({ success: true, copiados })
  } catch (error) {
    console.error("[menu/copiar-semana] Error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
})
