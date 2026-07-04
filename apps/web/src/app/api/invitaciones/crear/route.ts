// ═══════════════════════════════════════════════════════════════════
// POST /api/invitaciones/crear — Crear invitación para usuario interno
// ═══════════════════════════════════════════════════════════════════
// Solo OWNER. Genera token único + expiración 7 días.
// Envía email con Resend (si está configurado).
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"
import { randomBytes } from "crypto"
import { enviarInvitacionEmail } from "@/lib/email"

const CrearInvitacionSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OPERADOR", "COCINA"]),
  colegioId: z.string().uuid().optional(),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  if (context.role !== "OWNER") {
    return NextResponse.json({ success: false, error: "Solo el owner puede invitar usuarios" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CrearInvitacionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Datos inválidos", details: parsed.error.issues }, { status: 400 })
  }

  const { email, role, colegioId } = parsed.data
  const db = createTenantClient(context.tenantId, context.userId)

  // Verificar si ya existe invitación pendiente para este email
  const existente = await db.invitation.findFirst({
    where: { email, tenantId: context.tenantId, status: "PENDING" },
  })
  if (existente) {
    return NextResponse.json(
      { success: false, error: "Ya existe una invitación pendiente para este email" },
      { status: 409 }
    )
  }

  // Generar token único
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

  const invitation = await db.invitation.create({
    data: {
      tenantId: context.tenantId,
      email,
      role,
      colegioId: colegioId || null,
      token,
      status: "PENDING",
      expiresAt,
      invitedById: context.userId,
    },
  })

  // ── 3. Enviar email con Resend ──
  const tenant = await db.tenant.findUnique({
    where: { id: context.tenantId },
    select: { name: true },
  })

  await enviarInvitacionEmail({
    email,
    tenantNombre: tenant?.name || 'la empresa',
    token,
    expiresAt,
  })

  await db.auditLog.create({
    data: {
      tenantId: context.tenantId,
      userId: context.userId,
      action: "CREAR_INVITACION",
      entityType: "Invitation",
      entityId: invitation.id,
      changes: { email, role },
    },
  })

  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invitacion?token=${token}`

  return NextResponse.json({ success: true, invitationId: invitation.id, invitationUrl })
})
