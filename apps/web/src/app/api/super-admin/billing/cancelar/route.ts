// ═══════════════════════════════════════════════════════════════════
// POST /api/super-admin/billing/cancelar
// ═══════════════════════════════════════════════════════════════════
// Solo Super Admin. Cancela la suscripción de un tenant.
// Requiere confirmación literal "CANCELAR".
// La suscripción queda en estado CANCELADA inmediatamente.
// El tenant se mueve a status CANCELLED.
//
// BILLING SaaS: comercio → Enbandeja. NO pagos de apoderados.
// Toda acción queda en AuditLog.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { withSuperAuth } from '@/lib/middleware/withSuperAuth'
import { prisma } from '@enbandeja/database'
import { cancelarSuscripcionSchema } from '@enbandeja/shared'

export const POST = withSuperAuth(async (req, { superAdminId }) => {
  const body = await req.json()
  const parsed = cancelarSuscripcionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Datos inválidos', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { tenantId, confirmacion, motivo } = parsed.data

  // La validación Zod ya garantizó que confirmacion === "CANCELAR"
  // pero lo double-checkeamos por seguridad
  if (confirmacion !== 'CANCELAR') {
    return NextResponse.json(
      { success: false, error: 'Confirmación inválida. Debe escribir "CANCELAR".' },
      { status: 400 }
    )
  }

  // Verificar que el tenant existe
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, status: true },
  })

  if (!tenant) {
    return NextResponse.json(
      { success: false, error: 'Tenant no encontrado' },
      { status: 404 }
    )
  }

  // Verificar suscripción existente
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId },
  })

  if (!suscripcion) {
    return NextResponse.json(
      { success: false, error: 'El tenant no tiene suscripción registrada' },
      { status: 400 }
    )
  }

  if (suscripcion.estado === 'CANCELADA' || suscripcion.estado === 'ARCHIVADA') {
    return NextResponse.json(
      { success: false, error: `La suscripción ya está ${suscripcion.estado.toLowerCase()}` },
      { status: 400 }
    )
  }

  const ahora = new Date()

  const result = await prisma.$transaction(async (tx) => {
    // Cancelar suscripción
    const suscripcionCancelada = await tx.suscripcion.update({
      where: { id: suscripcion.id },
      data: {
        estado: 'CANCELADA',
        canceladoAt: ahora,
      },
    })

    // Mover tenant a CANCELLED
    await tx.tenant.update({
      where: { id: tenantId },
      data: { status: 'CANCELLED' },
    })

    // AuditLog
    await tx.auditLog.create({
      data: {
        tenantId,
        userId: null,
        action: 'CANCELAR_SUSCRIPCION',
        entityType: 'Suscripcion',
        entityId: suscripcion.id,
        changes: {
          estadoAnterior: suscripcion.estado,
          motivo: motivo || null,
          canceladoAt: ahora.toISOString(),
          superAdminId,
        },
      },
    })

    return suscripcionCancelada
  })

  return NextResponse.json({
    success: true,
    suscripcion: {
      id: result.id,
      estado: result.estado,
      canceladoAt: result.canceladoAt!.toISOString(),
    },
    mensaje: 'Suscripción cancelada. El tenant ya no puede operar.',
  })
})
