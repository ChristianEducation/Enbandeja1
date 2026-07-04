// ═══════════════════════════════════════════════════════════════════
// POST /api/colegios/actualizar — Actualizar colegio existente
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const ActualizarColegioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).optional(),
  direccion: z.string().nullable().optional(),
  horaCorte: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  kioscoActivo: z.boolean().optional(),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  if (context.role !== "OWNER") {
    return NextResponse.json({ success: false, error: "Solo el owner puede actualizar colegios" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ActualizarColegioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 })
  }

  const { id, ...data } = parsed.data
  const db = createTenantClient(context.tenantId, context.userId)

  await db.colegio.update({
    where: { id },
    data,
  })

  return NextResponse.json({ success: true })
})
