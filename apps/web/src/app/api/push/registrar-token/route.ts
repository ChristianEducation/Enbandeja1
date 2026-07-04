// ═══════════════════════════════════════════════════════════════════
// POST /api/push/registrar-token — Registrar token push del usuario
// ═══════════════════════════════════════════════════════════════════
// Upsert PushToken por (userId, token).
// Si el token ya existe (ej: re-registro), lo reactiva.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import { z } from "zod"

const RegistrarTokenSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  platform: z.enum(["web", "ios", "android"]),
})

export const POST = withAuth(async (req, context) => {
  const body = await req.json()
  const parsed = RegistrarTokenSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Datos inválidos", detalles: parsed.error.format() },
      { status: 400 }
    )
  }

  const { token, platform } = parsed.data

  // Upsert: si ya existe el token para este usuario, lo reactiva
  const pushToken = await prisma.pushToken.upsert({
    where: { token },
    create: {
      userId: context.userId,
      token,
      platform,
      isActive: true,
    },
    update: {
      userId: context.userId,
      platform,
      isActive: true,
    },
  })

  return NextResponse.json({ success: true, id: pushToken.id })
})
