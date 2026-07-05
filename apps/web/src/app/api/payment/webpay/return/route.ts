// ═══════════════════════════════════════════════════════════════════
// POST /api/payment/webpay/return — Return URL oficial de Webpay Plus
// ═══════════════════════════════════════════════════════════════════
// Flujo oficial Webpay Plus:
// 1. Apoderado paga en Webpay
// 2. Webpay redirige de vuelta aquí vía POST con token_ws
// 3. Este handler busca Pedido por webpayToken (campo único)
// 4. Llama commit(token_ws) para confirmar
// 5. Actualiza Pedido según resultado
//
// CORRELACIÓN token_ws → Pedido:
// Al crear la transacción, se guarda webpayToken en el Pedido.
// Aquí se busca por Pedido.webpayToken === token_ws.
// Si no existe → token desconocido → error.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { prisma, createTenantClient } from "@enbandeja/database"
import { confirmarTransaccionWebpay } from "@/lib/payments/webpay"
import { getDecryptedPaymentConfig } from "@/lib/payments/provider"
import { crearNotificacion } from "@/lib/push/send"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function POST(req: NextRequest) {
  try {
    // ── 1. Leer token_ws del body ──
    // Webpay puede enviar como form-encoded o JSON
    const contentType = req.headers.get("content-type") || ""
    let token_ws: string | undefined

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formText = await req.text()
      const params = new URLSearchParams(formText)
      token_ws = params.get("token_ws") ?? undefined
    } else {
      try {
        const body = await req.json()
        token_ws = body.token_ws
      } catch {
        const formText = await req.text()
        const params = new URLSearchParams(formText)
        token_ws = params.get("token_ws") ?? undefined
      }
    }

    if (!token_ws) {
      return NextResponse.redirect(`${APP_URL}/pago-error?motivo=sin_token`)
    }

    // ── 2. Buscar Pedido por webpayToken (campo único) ──
    const pedido = await prisma.pedido.findUnique({
      where: { webpayToken: token_ws },
      select: {
        id: true,
        tenantId: true,
        orderId: true,
        estado: true,
        total: true,
        creditoAplicado: true,
        totalPagado: true,
        apoderadoId: true,
        Items: {
          select: {
            id: true,
            opcionMenuId: true,
            productoKioscoId: true,
            cantidad: true,
          },
        },
      },
    })

    if (!pedido) {
      // Token_ws no corresponde a ningún pedido → error
      return NextResponse.redirect(`${APP_URL}/pago-error?motivo=pedido_no_encontrado`)
    }

    // Si ya no está en PENDIENTE_PAGO, ya fue procesado (idempotente)
    if (pedido.estado !== "PENDIENTE_PAGO") {
      return NextResponse.redirect(`${APP_URL}/confirmacion?pedidoId=${pedido.orderId}`)
    }

    // ── 3. Procesar confirmación ──
    return await procesarConfirmacion(token_ws, pedido)
  } catch (error) {
    console.error("[webpay/return] Error:", error)
    return NextResponse.redirect(`${APP_URL}/pago-error?motivo=error_interno`)
  }
}

/**
 * Procesa la confirmación de una transacción Webpay.
 */
async function procesarConfirmacion(
  token_ws: string,
  pedido: {
    id: string
    tenantId: string
    orderId: string
    estado: string
    total: number
    creditoAplicado: number
    totalPagado: number
    apoderadoId: string
    Items: Array<{
      id: string
      opcionMenuId: string | null
      productoKioscoId: string | null
      cantidad: number
    }>
  }
): Promise<NextResponse> {
  const { tenantId, orderId } = pedido

  // Obtener credenciales descifradas del tenant
  const db = createTenantClient(tenantId, pedido.apoderadoId)
  const providerConfig = await getDecryptedPaymentConfig(db, "WEBPAY")

  // Llamar commit(token_ws) — método oficial del SDK
  const commitResult = await confirmarTransaccionWebpay(token_ws, providerConfig)

  // Verificar si fue rechazada
  if (commitResult.responseCode !== 0) {
    await db.$transaction(async (tx: any) => {
      await tx.pedido.update({
        where: { id: pedido.id },
        data: { estado: "RECHAZADO" },
      })

      await tx.webhookEventLog.upsert({
        where: { orderId },
        create: {
          tenantId,
          orderId,
          eventType: "WEBPAY_COMMIT",
          payload: JSON.stringify({
            token_ws,
            responseCode: commitResult.responseCode,
            status: commitResult.status,
          }),
          processed: true,
          processedAt: new Date(),
        },
        update: {
          processed: true,
          processedAt: new Date(),
        },
      })
    })

    return NextResponse.redirect(
      `${APP_URL}/pago-rechazado?motivo=response_code_${commitResult.responseCode}`
    )
  }

  // Transacción aprobada — transacción atómica de confirmación
  try {
    const result = await db.$transaction(async (tx: any) => {
      // 1. Upsert WebhookEventLog (bitácora interna del commit)
      await tx.webhookEventLog.upsert({
        where: { orderId },
        create: {
          tenantId,
          orderId,
          eventType: "WEBPAY_COMMIT",
          payload: JSON.stringify(commitResult),
          processed: false,
        },
        update: {},
      })

      // 2. Verificar stock disponible
      let stockSuficiente = true
      for (const item of pedido.Items) {
        if (item.opcionMenuId) {
          const opcion = await tx.opcionMenu.findUnique({
            where: { id: item.opcionMenuId },
            select: { stockActual: true },
          })
          if (opcion?.stockActual !== null && opcion?.stockActual !== undefined) {
            if (opcion.stockActual < item.cantidad) stockSuficiente = false
          }
        }
        if (item.productoKioscoId) {
          const producto = await tx.productoKiosco.findUnique({
            where: { id: item.productoKioscoId },
            select: { stockActual: true },
          })
          if (producto?.stockActual !== null && producto?.stockActual !== undefined) {
            if (producto.stockActual < item.cantidad) stockSuficiente = false
          }
        }
      }

      if (!stockSuficiente) {
        // Revertir pedido + restaurar crédito
        await tx.pedido.update({
          where: { id: pedido.id },
          data: { estado: "CANCELADO" },
        })

        if (pedido.creditoAplicado > 0) {
          await tx.creditoApoderado.update({
            where: { apoderadoId: pedido.apoderadoId },
            data: { monto: { increment: pedido.creditoAplicado } },
          })

          await tx.creditoMovimiento.create({
            data: {
              tenantId,
              apoderadoId: pedido.apoderadoId,
              tipo: "REVERSION",
              monto: pedido.creditoAplicado,
              pedidoId: pedido.id,
              descripcion: `Reversión por stock insuficiente — pedido ${orderId}`,
            },
          })
        }

        await tx.webhookEventLog.update({
          where: { orderId },
          data: { processed: true, processedAt: new Date() },
        })

        await tx.auditLog.create({
          data: {
            tenantId,
            userId: pedido.apoderadoId,
            action: "DEVOLUCION_MANUAL_REQUERIDA",
            entityType: "Pedido",
            entityId: pedido.id,
            changes: {
              orderId,
              montoADevolver: pedido.totalPagado,
              motivo: "stock_insuficiente_post_commit",
              token_ws,
            },
          },
        })

        return { status: "stock_insufficient" }
      }

      // 3. Actualizar Pedido a PAGADO
      await tx.pedido.update({
        where: { id: pedido.id },
        data: {
          estado: "PAGADO",
          transactionId: commitResult.authorizationCode || token_ws,
          metodoPago: "WEBPAY",
        },
      })

      // 4. Decrementar stock
      for (const item of pedido.Items) {
        if (item.opcionMenuId) {
          await tx.opcionMenu.update({
            where: { id: item.opcionMenuId },
            data: { stockActual: { decrement: item.cantidad } },
          })
        }
        if (item.productoKioscoId) {
          await tx.productoKiosco.update({
            where: { id: item.productoKioscoId },
            data: { stockActual: { decrement: item.cantidad } },
          })
        }
      }

      // 5. Descontar crédito si aplica
      if (pedido.creditoAplicado > 0) {
        await tx.creditoApoderado.update({
          where: { apoderadoId: pedido.apoderadoId },
          data: { monto: { decrement: pedido.creditoAplicado } },
        })

        await tx.creditoMovimiento.create({
          data: {
            tenantId,
            apoderadoId: pedido.apoderadoId,
            tipo: "APLICACION",
            monto: -pedido.creditoAplicado,
            pedidoId: pedido.id,
            descripcion: `Crédito aplicado al pedido ${orderId}`,
          },
        })
      }

      // 6. Marcar evento como procesado
      await tx.webhookEventLog.update({
        where: { orderId },
        data: { processed: true, processedAt: new Date() },
      })

      return { status: "success" }
    })

    console.log(`[webpay/return] Pedido ${orderId} → ${result.status}`)

    // ── Notificación push (fuera de $transaction, best-effort) ──
    if (result.status === "success") {
      crearNotificacion(
        tenantId,
        pedido.apoderadoId,
        "PAGO_CONFIRMADO",
        "¡Pedido confirmado!",
        `Tu pedido ${orderId} ha sido pagado exitosamente.`,
        "PUSH",
        { ruta: `/confirmacion?pedidoId=${orderId}` }
      ).catch(() => {})
    }

    if (result.status === "stock_insufficient") {
      crearNotificacion(
        tenantId,
        pedido.apoderadoId,
        "DEVOLUCION_PENDIENTE",
        "Pago en proceso de devolución",
        `El pedido ${orderId} no pudo completarse por stock insuficiente. Registramos la devolución manual para revisión.`,
        "PUSH",
        { ruta: "/historial" }
      ).catch(() => {})

      return NextResponse.redirect(
        `${APP_URL}/pago-error?motivo=stock_insuficiente&pedidoId=${orderId}`
      )
    }

    return NextResponse.redirect(`${APP_URL}/confirmacion?pedidoId=${orderId}`)
  } catch (error) {
    console.error("[webpay/return] Error en transacción atómica:", error)
    return NextResponse.redirect(`${APP_URL}/pago-error?motivo=error_transaccion`)
  }
}

/**
 * GET handler — Webpay también puede redirigir vía GET con token_ws en query
 */
export async function GET(req: NextRequest) {
  const token_ws = req.nextUrl.searchParams.get("token_ws")

  if (!token_ws) {
    return NextResponse.redirect(`${APP_URL}/pago-error?motivo=sin_token`)
  }

  const postReq = new NextRequest(req.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token_ws }),
  })

  return POST(postReq)
}
