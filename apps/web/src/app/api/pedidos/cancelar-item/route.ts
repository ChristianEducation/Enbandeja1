// ═══════════════════════════════════════════════════════════════════
// POST /api/pedidos/cancelar-item — Cancelar un item de pedido
// ═══════════════════════════════════════════════════════════════════
// Flujo:
// 1. Recibe { pedidoItemId }
// 2. Query item con pedido, colegio, tenant
// 3. Valida que el pedido pertenece al apoderado
// 4. Valida puedeCancelar (hora de corte por timezone)
// 5. Transacción atómica:
//    - pedidoItem.cancelado = true, canceladoAt = now, creditoGenerado = subtotal
//    - Incrementar stockActual de OpcionMenu/ProductoKiosco si aplica
//    - Upsert CreditoApoderado: monto += subtotal
//    - Crear CreditoMovimiento (inmutable)
//    - AuditLog
// 6. Fuera de transacción: notificación push
// 7. Retorna { ok, creditoGenerado }
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { puedeCancelar } from "@/lib/pedidos/validar-hora-corte"
import { crearNotificacion } from "@/lib/push/send"
import { z } from "zod"

// ── Schema de validación ──
const CancelarItemSchema = z.object({
  pedidoItemId: z.string().uuid(),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  try {
    const body = await req.json()
    const parsed = CancelarItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { pedidoItemId } = parsed.data
    const db = createTenantClient(context.tenantId, context.userId)

    // ── 2. Query item con pedido, colegio, tenant ──
    const item = await db.pedidoItem.findUnique({
      where: { id: pedidoItemId },
      include: {
        Pedido: {
          select: {
            id: true,
            apoderadoId: true,
            estado: true,
            tenantId: true,
          },
        },
        Comensal: {
          select: { nombre: true, apellido: true },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item no encontrado" },
        { status: 404 }
      )
    }

    // ── 3. Validar que el pedido pertenece al apoderado ──
    if (item.Pedido.apoderadoId !== context.userId) {
      return NextResponse.json(
        { success: false, error: "Este item no pertenece a tu pedido" },
        { status: 403 }
      )
    }

    // ── Validaciones de estado ──
    if (item.cancelado) {
      return NextResponse.json(
        { success: false, error: "Este item ya fue cancelado" },
        { status: 409 }
      )
    }

    if (item.Pedido.estado !== "PAGADO") {
      return NextResponse.json(
        { success: false, error: "Solo se pueden cancelar items de pedidos pagados" },
        { status: 400 }
      )
    }

    // ── 4. Validar hora de corte ──
    // Buscar el colegio por comensal para obtener horaCorte
    const comensalConColegio = await db.comensal.findUnique({
      where: { id: item.comensalId },
      select: {
        Colegio: {
          select: { id: true, horaCorte: true },
        },
      },
    })

    const horaCorte = comensalConColegio?.Colegio?.horaCorte || "09:00"

    // Obtener timezone del tenant
    const tenant = await db.tenant.findFirst({
      where: { id: context.tenantId },
      select: { timezone: true },
    })
    const timezone = tenant?.timezone || "America/Santiago"

    const validacion = puedeCancelar(item.fecha, horaCorte, timezone)
    if (!validacion.puede) {
      return NextResponse.json(
        { success: false, error: validacion.razon || "No se puede cancelar este item" },
        { status: 403 }
      )
    }

    const creditoGenerado = item.subtotal

    // ── 5. Transacción atómica ──
    await db.$transaction(async (tx: any) => {
      // 5a. Marcar item como cancelado
      await tx.pedidoItem.update({
        where: { id: pedidoItemId },
        data: {
          cancelado: true,
          canceladoAt: new Date(),
          creditoGenerado,
        },
      })

      // 5b. Incrementar stock si aplica
      if (item.opcionMenuId) {
        const opcion = await tx.opcionMenu.findUnique({
          where: { id: item.opcionMenuId },
          select: { stockMax: true, stockActual: true },
        })
        if (opcion?.stockMax && opcion.stockActual !== null) {
          await tx.opcionMenu.update({
            where: { id: item.opcionMenuId },
            data: {
              stockActual: Math.min(opcion.stockMax, opcion.stockActual + item.cantidad),
            },
          })
        }
      }

      if (item.productoKioscoId) {
        const producto = await tx.productoKiosco.findUnique({
          where: { id: item.productoKioscoId },
          select: { stockActual: true, stockDiario: true },
        })
        if (producto?.stockActual !== null && producto?.stockActual !== undefined) {
          await tx.productoKiosco.update({
            where: { id: item.productoKioscoId },
            data: {
              stockActual: Math.min(
                producto.stockDiario || 999999,
                producto.stockActual + item.cantidad
              ),
            },
          })
        }
      }

      // 5c. Upsert CreditoApoderado — monto += subtotal
      // El comensal siempre tiene colegio, pero por robustez
      // usamos fallback al primer colegio del tenant o al tenantId
      // si no hay colegios (no debería ocurrir).
      let colegioId = comensalConColegio?.Colegio?.id

      if (!colegioId) {
        // Fallback: buscar el primer colegio activo del tenant
        const primerColegio = await tx.colegio.findFirst({
          where: { tenantId: context.tenantId, isActive: true, deletedAt: null },
          select: { id: true },
        })
        if (!primerColegio) {
          throw new Error('El comensal no tiene colegio asignado y el tenant no tiene colegios activos. No se puede generar crédito.')
        }
        colegioId = primerColegio.id
      }

      await tx.creditoApoderado.upsert({
        where: {
          apoderadoId_colegioId: {
            apoderadoId: context.userId,
            colegioId,
          },
        },
        create: {
          tenantId: context.tenantId,
          apoderadoId: context.userId,
          colegioId,
          monto: creditoGenerado,
        },
        update: {
          monto: { increment: creditoGenerado },
        },
      })

      // 5d. Crear CreditoMovimiento (inmutable)
      const credito = await tx.creditoApoderado.findUnique({
        where: {
          apoderadoId_colegioId: {
            apoderadoId: context.userId,
            colegioId,
          },
        },
        select: { id: true },
      })

      await tx.creditoMovimiento.create({
        data: {
          tenantId: context.tenantId,
          creditoId: credito?.id || "",
          monto: creditoGenerado,
          concepto: `Cancelación de ${item.nombre} para ${item.Comensal.nombre} ${item.Comensal.apellido}`,
          pedidoId: item.pedidoId,
        },
      })

      // 5e. AuditLog
      await tx.auditLog.create({
        data: {
          tenantId: context.tenantId,
          userId: context.userId,
          action: "CANCELAR_ITEM",
          entityType: "PedidoItem",
          entityId: pedidoItemId,
          changes: {
            cancelado: true,
            creditoGenerado,
            subtotal: item.subtotal,
          },
        },
      })

      // 5f. Verificar si todos los items del pedido están cancelados
      const itemsRestantes = await tx.pedidoItem.findMany({
        where: {
          pedidoId: item.pedidoId,
          cancelado: false,
        },
        select: { id: true },
      })

      if (itemsRestantes.length === 0) {
        await tx.pedido.update({
          where: { id: item.pedidoId },
          data: { estado: "CANCELADO" },
        })
      }
    })

    // ── 6. Fuera de transacción: notificación push ──
    crearNotificacion(
      context.tenantId,
      context.userId,
      "ITEM_CANCELADO",
      "Item cancelado",
      `Se canceló "${item.nombre}" y se generó crédito de ${formatCLPInline(creditoGenerado)}`,
      "PUSH",
      { ruta: "/historial" }
    ).catch(() => {
      // Fire-and-forget
    })

    return NextResponse.json({
      success: true,
      creditoGenerado,
    })
  } catch (error) {
    console.error("[pedidos/cancelar-item] Error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
})

// Helper local para formato CLP sin importar desde shared en API route
function formatCLPInline(monto: number): string {
  return `$${monto.toLocaleString("es-CL")}`
}
