// ═══════════════════════════════════════════════════════════════════
// POST /api/setup/avanzar-paso — Marcar paso completado
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const AvanzarPasoSchema = z.object({
  paso: z.enum([
    "datosEmpresa",
    "primerColegio",
    "conectoMercadoPago",
    "comensalesCargados",
    "categoriasPrecios",
    "primerMenuPublicado",
    "kitDescargado",
  ]),
})

export const POST = withAuth(
  async (req: NextRequest, context: SessionContext) => {
    const body = await req.json()
    const parsed = AvanzarPasoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Paso inválido" },
        { status: 400 }
      )
    }

    const { paso } = parsed.data

    // Upsert OnboardingProgress
    const progress = await prisma.onboardingProgress.upsert({
      where: { tenantId: context.tenantId },
      update: { [paso]: true },
      create: {
        tenantId: context.tenantId,
        [paso]: true,
      },
    })

    // Verificar si todos los pasos están completos
    const allDone =
      progress.datosEmpresa &&
      progress.primerColegio &&
      progress.conectoMercadoPago &&
      progress.comensalesCargados &&
      progress.categoriasPrecios &&
      progress.primerMenuPublicado

    if (allDone && !progress.completadoAt) {
      await prisma.onboardingProgress.update({
        where: { tenantId: context.tenantId },
        data: { completadoAt: new Date() },
      })
    }

    return NextResponse.json({ success: true, progress })
  }
)
