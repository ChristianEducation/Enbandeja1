// ═══════════════════════════════════════════════════════════════════
// POST /api/tenant/actualizar — Actualizar datos del tenant
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const ActualizarTenantSchema = z.object({
  name: z.string().min(1).optional(),
  rut: z.string().nullable().optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  timezone: z.string().optional(),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  if (context.role !== "OWNER") {
    return NextResponse.json({ success: false, error: "Solo el owner puede actualizar datos del tenant" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ActualizarTenantSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Datos inválidos", details: parsed.error.issues }, { status: 400 })
  }

  const db = createTenantClient(context.tenantId, context.userId)

  await db.tenant.update({
    where: { id: context.tenantId },
    data: parsed.data,
  })

  return NextResponse.json({ success: true })
})
