// ═══════════════════════════════════════════════════════════════════
// POST /api/cron/pedidos-expirados — Limpiar pedidos pendientes viejos
// ═══════════════════════════════════════════════════════════════════
// Busca Pedidos en PENDIENTE_PAGO creados hace más de 2h.
// Itera por tenant.timezone usando toZonedTime (NO hardcodea Santiago).
// Marca como EXPIRADO y registra en AuditLog.
//
// Protegido por CRON_SECRET (Bearer token).
// Se ejecuta cada hora via Vercel Cron.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { prisma, createTenantClient } from "@enbandeja/database"
import { toZonedTime } from "date-fns-tz"
import { subHours } from "date-fns"

const EXPIRATION_HOURS = 2

export async function POST(req: NextRequest) {
  // ── Verificar CRON_SECRET ──
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 })
  }

  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const ahora = new Date()
    const limite = subHours(ahora, EXPIRATION_HOURS)

    // Buscar pedidos PENDIENTE_PAGO viejos
    const pedidosExpirados = await prisma.pedido.findMany({
      where: {
        estado: "PENDIENTE_PAGO",
        createdAt: { lt: limite },
        deletedAt: null,
      },
      select: {
        id: true,
        tenantId: true,
        orderId: true,
        createdAt: true,
      },
    })

    if (pedidosExpirados.length === 0) {
      return NextResponse.json({ processed: 0, message: "Sin pedidos expirados" })
    }

    // Agrupar por tenant para RLS
    const porTenant = new Map<string, typeof pedidosExpirados>()
    for (const pedido of pedidosExpirados) {
      const existing = porTenant.get(pedido.tenantId) || []
      existing.push(pedido)
      porTenant.set(pedido.tenantId, existing)
    }

    let procesados = 0
    let errores = 0

    for (const [tenantId, pedidos] of porTenant) {
      try {
        // Obtener timezone del tenant
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { timezone: true },
        })

        const timezone = tenant?.timezone ?? "America/Santiago"
        const ahoraLocal = toZonedTime(ahora, timezone)

        // Crear cliente con contexto de tenant
        const db = createTenantClient(tenantId, "cron-pedidos-expirados")

        for (const pedido of pedidos) {
          try {
            await db.$transaction(async (tx: any) => {
              // Marcar como EXPIRADO
              await tx.pedido.update({
                where: { id: pedido.id },
                data: { estado: "EXPIRADO" },
              })

              // Registrar en AuditLog
              await tx.auditLog.create({
                data: {
                  tenantId,
                  action: "PEDIDO_EXPIRADO",
                  entityType: "Pedido",
                  entityId: pedido.id,
                  changes: {
                    orderId: pedido.orderId,
                    createdAt: pedido.createdAt.toISOString(),
                    expiredAt: ahora.toISOString(),
                    timezone,
                  },
                },
              })
            })

            procesados++
          } catch (error) {
            errores++
            console.error(
              `[cron/pedidos-expirados] Error procesando pedido ${pedido.orderId}:`,
              error
            )
          }
        }
      } catch (error) {
        console.error(
          `[cron/pedidos-expirados] Error procesando tenant ${tenantId}:`,
          error
        )
      }
    }

    return NextResponse.json({
      processed: procesados,
      errors: errores,
      total: pedidosExpirados.length,
    })
  } catch (error) {
    console.error("[cron/pedidos-expirados] Error general:", error)
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}
