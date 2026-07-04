// ═══════════════════════════════════════════════════════════════════
// GET /api/notificaciones/count — Contar notificaciones no leídas
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"

export const GET = withAuth(async (_req, context) => {
  const count = await prisma.notificacionLog.count({
    where: {
      userId: context.userId,
      Lecturas: {
        none: {
          userId: context.userId,
        },
      },
    },
  })

  return NextResponse.json({ count })
})
