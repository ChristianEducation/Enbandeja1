// ═══════════════════════════════════════════════════════════════════
// POST /api/pedidos/crear — Crear pedido e iniciar flujo de pago
// ═══════════════════════════════════════════════════════════════════
// Flujo:
// 1. Valida con CrearPedidoSchema
// 2. Verifica que comensales pertenecen al apoderado
// 3. Recalcula total en backend (NUNCA confía en frontend)
// 4. Calcula crédito aplicable
// 5. Valida invariante contable: total = creditoAplicado + totalPagado
// 6. Genera orderId único
// 7. Si totalPagado === 0 → crearPedidoMontoZero
// 8. Si totalPagado > 0 → crea Pedido PENDIENTE_PAGO + inicia Webpay
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { CrearPedidoSchema, validarInvarianteContable } from "@enbandeja/shared"
import { calcularTotal } from "@/lib/pedidos/calcular-total"
import { aplicarCredito } from "@/lib/pedidos/aplicar-credito"
import { iniciarTransaccionWebpay } from "@/lib/payments/webpay"
import { getDecryptedPaymentConfig } from "@/lib/payments/provider"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  try {
    const body = await req.json()
    const parsed = CrearPedidoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { colegioId, items, creditoAplicado: creditoSolicitado } = parsed.data
    const db = createTenantClient(context.tenantId, context.userId)

    // ── 2. Verificar que comensales pertenecen al apoderado ──
    const comensalIds = [...new Set(items.map((i) => i.comensalId))]
    const comensalesValidos = await db.comensal.findMany({
      where: {
        tenantId: context.tenantId,
        id: { in: comensalIds },
        apoderadoId: context.userId,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    })

    if (comensalesValidos.length !== comensalIds.length) {
      return NextResponse.json(
        { success: false, error: "Uno o más comensales no pertenecen al apoderado" },
        { status: 403 }
      )
    }

    // ── 3. Recalcular total en backend ──
    const { total, itemsConPrecio, errores } = await calcularTotal(db, items)

    if (errores.length > 0) {
      return NextResponse.json(
        { success: false, error: "Error calculando precios", details: errores },
        { status: 400 }
      )
    }

    // ── 4. Calcular crédito aplicable ──
    const credito = await aplicarCredito(db, total, context.userId, colegioId)
    const creditoAplicado = Math.min(creditoSolicitado, credito.creditoDisponible, total)
    const totalPagado = total - creditoAplicado

    // ── 5. Validar invariante contable ──
    const invariante = validarInvarianteContable(total, creditoAplicado, totalPagado)
    if (!invariante.valid) {
      return NextResponse.json(
        { success: false, error: invariante.error },
        { status: 400 }
      )
    }

    // ── 6. Generar orderId único ──
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const tenantShort = context.tenantId.substring(0, 8)
    const orderId = `ENB-${tenantShort}-${timestamp}-${random}`

    // ── 7. Flujo monto cero ──
    if (totalPagado === 0) {
      const pedido = await crearPedidoMontoZero(db, {
        orderId,
        colegioId,
        total,
        creditoAplicado,
        itemsConPrecio,
        apoderadoId: context.userId,
        tenantId: context.tenantId,
      })

      return NextResponse.json({
        success: true,
        pedido,
        requierePago: false,
      })
    }

    // ── 8. Flujo normal con Webpay ──
    // Obtener credenciales descifradas del tenant
    const providerConfig = await getDecryptedPaymentConfig(db, "WEBPAY")

    // Crear pedido en PENDIENTE_PAGO
    const pedido = await db.pedido.create({
      data: {
        tenantId: context.tenantId,
        colegioId,
        apoderadoId: context.userId,
        orderId,
        total,
        creditoAplicado,
        totalPagado,
        estado: "PENDIENTE_PAGO",
        Items: {
          create: itemsConPrecio.map((item, idx) => ({
            tenantId: context.tenantId,
            comensalId: item.comensalId,
            opcionMenuId: item.opcionMenuId ?? null,
            productoKioscoId: item.productoKioscoId ?? null,
            fecha: new Date(items[idx]?.fecha || new Date()),
            tipo: item.tipo as string,
            nombre: `item-${idx}`,
            precio: item.precio,
            cantidad: item.cantidad,
            subtotal: item.subtotal,
          })) as any[], // Unchecked create — tipo del extended client no infiere correctamente
        },
      },
      include: { Items: true },
    })

    // Iniciar transacción Webpay
    const returnUrl = `${APP_URL}/api/payment/webpay/return`
    let webpayResponse
    try {
      webpayResponse = await iniciarTransaccionWebpay(
        orderId,
        pedido.id,
        totalPagado,
        returnUrl,
        providerConfig
      )
    } catch (webpayError) {
      // Webpay falló — marcar pedido como EXPIRADO para que el cron lo limpie
      console.error("[pedidos/crear] Webpay init falló:", webpayError)
      await db.pedido.update({
        where: { id: pedido.id },
        data: { estado: "EXPIRADO" },
      })
      const errMsg = webpayError instanceof Error ? webpayError.message : "Error al iniciar pago Webpay"
      return NextResponse.json(
        { success: false, error: errMsg },
        { status: 502 }
      )
    }

    // Guardar webpayToken en el Pedido para correlación en el return handler
    await db.pedido.update({
      where: { id: pedido.id },
      data: { webpayToken: webpayResponse.token },
    })

    return NextResponse.json({
      success: true,
      pedido,
      urlPasarela: webpayResponse.url,
      token: webpayResponse.token,
      requierePago: true,
    })
  } catch (error) {
    console.error("[pedidos/crear] Error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
})

// ═══════════════════════════════════════════════════════════════════
// crearPedidoMontoZero — Flujo especial para pedidos con totalPagado=0
// ═══════════════════════════════════════════════════════════════════
// No pasa por pasarela. Pedido se crea directamente en PAGADO.
// Transacción atómica: Pedido + Items + Stock + Crédito
// ═══════════════════════════════════════════════════════════════════

interface MontoZeroParams {
  orderId: string
  colegioId: string
  total: number
  creditoAplicado: number
  itemsConPrecio: Array<{
    comensalId: string
    opcionMenuId?: string | null
    productoKioscoId?: string | null
    tipo: string
    cantidad: number
    precio: number
    subtotal: number
  }>
  apoderadoId: string
  tenantId: string
}

async function crearPedidoMontoZero(db: any, params: MontoZeroParams) {
  const { orderId, colegioId, total, creditoAplicado, itemsConPrecio, apoderadoId, tenantId } = params
  const internalTxId = `INTERNO-${Date.now()}`

  return await db.$transaction(async (tx: any) => {
    // 1. Crear Pedido directamente en PAGADO
    const pedido = await tx.pedido.create({
      data: {
        tenantId,
        colegioId,
        apoderadoId,
        orderId,
        total,
        creditoAplicado,
        totalPagado: 0,
        estado: "PAGADO",
        metodoPago: null,
        transactionId: internalTxId,
        Items: {
          create: itemsConPrecio.map((item, idx) => ({
            tenantId,
            comensalId: item.comensalId,
            opcionMenuId: item.opcionMenuId ?? null,
            productoKioscoId: item.productoKioscoId ?? null,
            fecha: new Date(),
            tipo: item.tipo as string,
            nombre: `item-${idx}`,
            precio: item.precio,
            cantidad: item.cantidad,
            subtotal: item.subtotal,
          })) as any[], // Unchecked create — tipo del extended client no infiere correctamente
        },
      },
      include: { Items: true },
    })

    // 2. Decrementar stock de opciones con stockMax
    for (const item of itemsConPrecio) {
      if (item.opcionMenuId) {
        const opcion = await tx.opcionMenu.findUnique({
          where: { id: item.opcionMenuId },
          select: { stockMax: true, stockActual: true },
        })
        if (opcion?.stockMax && opcion.stockActual !== null) {
          await tx.opcionMenu.update({
            where: { id: item.opcionMenuId },
            data: { stockActual: Math.max(0, opcion.stockActual - item.cantidad) },
          })
        }
      }
      if (item.productoKioscoId) {
        const producto = await tx.productoKiosco.findUnique({
          where: { id: item.productoKioscoId },
          select: { stockActual: true },
        })
        if (producto?.stockActual !== null && producto?.stockActual !== undefined) {
          await tx.productoKiosco.update({
            where: { id: item.productoKioscoId },
            data: { stockActual: Math.max(0, producto.stockActual - item.cantidad) },
          })
        }
      }
    }

    // 3. Descontar crédito si aplica
    if (creditoAplicado > 0) {
      await tx.creditoApoderado.update({
        where: { apoderadoId },
        data: { monto: { decrement: creditoAplicado } },
      })

      await tx.creditoMovimiento.create({
        data: {
          tenantId,
          apoderadoId,
          tipo: "APLICACION",
          monto: -creditoAplicado,
          pedidoId: pedido.id,
          descripcion: `Crédito aplicado al pedido ${orderId}`,
        },
      })
    }

    return pedido
  })
}
