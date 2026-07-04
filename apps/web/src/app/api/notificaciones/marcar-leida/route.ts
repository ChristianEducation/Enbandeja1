// ═══════════════════════════════════════════════════════════════════
// POST /api/notificaciones/marcar-leida — Marcar notificación como leída
// ═══════════════════════════════════════════════════════════════════
// Upsert NotificacionLeida por (notificacionId, userId).
// Si ya existe, no hace nada (idempotente).
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import { z } from "zod"

const MarcarLeidaSchema = z.object({
  notificacionId: z.string().uuid("ID de notificación inválido"),
})

export const POST = withAuth(async (req, context) => {
  const body = await req.json()
  const parsed = MarcarLeidaSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Datos inválidos", detalles: parsed.error.format() },
      { status: 400 }
    )
  }

  const { notificacionId } = parsed.data

  // Upsert: si ya existe, noop
  await prisma.notificacionLeida.upsert({
    where: {
      notificacionId_userId: {
        notificacionId,
        userId: context.userId,
      },
    },
    create: {
      notificacionId,
      userId: context.userId,
    },
    update: {},
  })

  return NextResponse.json({ success: true })
})
