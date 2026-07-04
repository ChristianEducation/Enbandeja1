// ═══════════════════════════════════════════════════════════════════
// POST /api/billing/cancelar — Owner cancela su suscripción
// ═══════════════════════════════════════════════════════════════════
// Solo OWNER. Sin verificación de suscripción (billing route).
// Requiere confirmación literal "CANCELAR".
// Toda acción en AuditLog.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { withAuthBilling } from '@/lib/middleware/withAuthBilling'
import { prisma } from '@enbandeja/database'
import { cancelarSuscripcionSchema } from '@enbandeja/shared'
import type { SessionContext } from '@enbandeja/shared'

export const POST = withAuthBilling(async (req: NextRequest, context: SessionContext) => {
  const body = await req.json()
  const parsed = cancelarSuscripcionSchema.safeParse({ ...body, tenantId: context.tenantId })

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Datos inválidos', details: parsed.error.issues }, { status: 400 })
  }

  const { confirmacion } = parsed.data
  if (confirmacion !== 'CANCELAR') {
    return NextResponse.json({ success: false, error: 'Confirmación inválida. Debes escribir "CANCELAR".' }, { status: 400 })
  }

  const tenantId = context.tenantId

  const suscripcion = await prisma.suscripcion.findUnique({ where: { tenantId } })
  if (!suscripcion) {
    return NextResponse.json({ success: false, error: 'Sin suscripción registrada' }, { status: 400 })
  }

  if (suscripcion.estado === 'CANCELADA' || suscripcion.estado === 'ARCHIVADA') {
    return NextResponse.json({ success: false, error: `La suscripción ya está ${suscripcion.estado.toLowerCase()}` }, { status: 400 })
  }

  const ahora = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.suscripcion.update({
      where: { id: suscripcion.id },
      data: { estado: 'CANCELADA', canceladoAt: ahora },
    })

    await tx.tenant.update({
      where: { id: tenantId },
      data: { status: 'CANCELLED' },
    })

    await tx.auditLog.create({
      data: {
        tenantId, userId: context.userId,
        action: 'OWNER_CANCELAR_SUSCRIPCION',
        entityType: 'Suscripcion',
        entityId: suscripcion.id,
        changes: { estadoAnterior: suscripcion.estado, canceladoAt: ahora.toISOString() },
      },
    })
  })

  return NextResponse.json({
    success: true,
    mensaje: 'Suscripción cancelada. Los apoderados pueden seguir operando. Los operadores y owners serán bloqueados al inicio del próximo ciclo.',
  })
})
