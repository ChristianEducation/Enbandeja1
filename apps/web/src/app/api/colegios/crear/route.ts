// ═══════════════════════════════════════════════════════════════════
// POST /api/colegios/crear — Crear colegio con verificación de límite
// ═══════════════════════════════════════════════════════════════════
// Refactorizado: usa verificarLimitePlan (M16) en vez de lógica inline
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient, prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"
import { generarCodigoCasino } from "@enbandeja/shared"
import { verificarLimitePlan } from "@/lib/middleware/verificarSuscripcion"

const CrearColegioSchema = z.object({
  nombre: z.string().min(1),
  direccion: z.string().nullable().optional(),
  horaCorte: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  kioscoActivo: z.boolean().default(false),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  if (context.role !== "OWNER") {
    return NextResponse.json(
      { success: false, error: "Solo el owner puede crear colegios" },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parsed = CrearColegioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Datos inválidos", details: parsed.error.issues },
      { status: 400 }
    )
  }

  // Verificar límite del plan usando middleware consolidado (M16)
  const colegiosActuales = await prisma.colegio.count({
    where: { tenantId: context.tenantId, isActive: true, deletedAt: null },
  })
  const limite = await verificarLimitePlan(context.tenantId, "MAX_COLEGIOS", colegiosActuales)

  if (!limite.dentroDelLimite) {
    return NextResponse.json(
      {
        success: false,
        error: `Has alcanzado el límite de ${limite.limite} colegios del plan ${limite.planNombre}. Actualiza tu plan.`,
      },
      { status: 403 }
    )
  }

  const { nombre, direccion, horaCorte, kioscoActivo } = parsed.data
  const db = createTenantClient(context.tenantId, context.userId)

  const codigoCasino = generarCodigoCasino()

  const colegio = await db.colegio.create({
    data: {
      tenantId: context.tenantId,
      nombre,
      direccion,
      codigoCasino,
      horaCorte,
      kioscoActivo,
    },
  })

  await db.categoriaPrecio.create({
    data: {
      tenantId: context.tenantId,
      colegioId: colegio.id,
      nombre: "General",
      descripcion: "Categoría de precio por defecto",
      esDefault: true,
      isActive: true,
    },
  })

  await db.auditLog.create({
    data: {
      tenantId: context.tenantId,
      userId: context.userId,
      action: "CREAR_COLEGIO",
      entityType: "Colegio",
      entityId: colegio.id,
      changes: { nombre, codigoCasino },
    },
  })

  return NextResponse.json({ success: true, colegioId: colegio.id, codigoCasino })
})
