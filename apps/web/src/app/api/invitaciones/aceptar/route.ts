// ═══════════════════════════════════════════════════════════════════
// POST /api/invitaciones/aceptar — Aceptar invitación
// ═══════════════════════════════════════════════════════════════════
// Recibe token de la invitación. Valida que no haya expirado.
// Crea UserTenant con el rol asignado.
// Marca invitación como ACCEPTED.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { z } from "zod"

const AceptarInvitacionSchema = z.object({
  token: z.string().min(1),
})

export const POST = withAuth(async (req: NextRequest, context: SessionContext) => {
  const body = await req.json()
  const parsed = AceptarInvitacionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Token inválido" }, { status: 400 })
  }

  const { token } = parsed.data

  // Buscar invitación por token
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  })

  if (!invitation) {
    return NextResponse.json({ success: false, error: "Invitación no encontrada" }, { status: 404 })
  }

  if (invitation.status !== "PENDING") {
    return NextResponse.json({ success: false, error: `Invitación ya ${invitation.status.toLowerCase()}` }, { status: 400 })
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    })
    return NextResponse.json({ success: false, error: "Invitación expirada" }, { status: 400 })
  }

  // Verificar que el email del usuario coincide con el de la invitación
  const user = await prisma.user.findUnique({
    where: { id: context.userId },
    select: { email: true },
  })

  if (user?.email !== invitation.email) {
    return NextResponse.json(
      { success: false, error: "Esta invitación es para otro email. Inicia sesión con el email correcto." },
      { status: 403 }
    )
  }

  // Crear UserTenant
  await prisma.userTenant.create({
    data: {
      userId: context.userId,
      tenantId: invitation.tenantId,
      role: invitation.role as any,
      colegioId: invitation.colegioId,
      isActive: true,
    },
  })

  // Marcar invitación como aceptada
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  })

  return NextResponse.json({ success: true, tenantId: invitation.tenantId, role: invitation.role })
})
