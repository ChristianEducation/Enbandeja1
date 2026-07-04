// ═══════════════════════════════════════════════════════════════════
// POST /api/setup/conectar-mercadopago — Placeholder OAuth MP
// ═══════════════════════════════════════════════════════════════════
// [PENDIENTE CONSULTA] OAuth real de MercadoPago no configurado aún.
// Este endpoint simula la conexión creando un registro placeholder
// en PaymentProviderConfig. Cuando se configure el OAuth real,
// este endpoint se reemplaza por el callback de MercadoPago.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"

export const POST = withAuth(
  async (req: NextRequest, context: SessionContext) => {
    // [PENDIENTE CONSULTA] En producción, este endpoint:
    // 1. Redirige a https://auth.mercadopago.com/authorization?client_id=APP_ID&redirect_uri=CALLBACK_URL&response_type=code
    // 2. Recibe callback con código
    // 3. Intercambia código por access_token + refresh_token
    // 4. Guarda tokens cifrados en PaymentProviderConfig

    // Por ahora: crear registro placeholder
    const existing = await prisma.paymentProviderConfig.findFirst({
      where: { tenantId: context.tenantId, provider: "MERCADOPAGO", isActive: true },
    })

    if (!existing) {
      await prisma.paymentProviderConfig.create({
        data: {
          tenantId: context.tenantId,
          provider: "MERCADOPAGO",
          commerceCode: "PLACEHOLDER_MP",
          apiKeyEncrypted: "PLAIN:PLACEHOLDER_MP_ACCESS_TOKEN",
          secretKeyEncrypted: "PLAIN:PLACEHOLDER_MP_REFRESH_TOKEN",
          environment: "integration",
          isActive: true,
          isDefault: false,
        },
      })
    }

    return NextResponse.json({ success: true, message: "MercadoPago placeholder configurado. OAuth real pendiente." })
  }
)
