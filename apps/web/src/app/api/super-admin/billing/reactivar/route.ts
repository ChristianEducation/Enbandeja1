// ═══════════════════════════════════════════════════════════════════
// POST /api/super-admin/billing/reactivar
// ═══════════════════════════════════════════════════════════════════
// Solo Super Admin. Reactiva una suscripción cancelada/suspendida
// con un pago. Crea nueva suscripción o reactiva la existente.
//
// BILLING SaaS: comercio → Enbandeja. NO pagos de apoderados.
// Toda acción queda en AuditLog.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { withSuperAuth } from '@/lib/middleware/withSuperAuth'
import { prisma } from '@enbandeja/database'
import { reactivarSuscripcionSchema } from '@enbandeja/shared'

export const POST = withSuperAuth(async (req, { superAdminId }) => {
  const body = await req.json()
  const parsed = reactivarSuscripcionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Datos inválidos', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { tenantId, planId, tipo, monto, metodoPago } = parsed.data

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true },
  })

  if (!tenant) {
    return NextResponse.json(
      { success: false, error: 'Tenant no encontrado' },
      { status: 404 }
    )
  }

  const nuevoPlan = await prisma.plan.findUnique({ where: { id: planId } })
  if (!nuevoPlan || !nuevoPlan.isActive || nuevoPlan.deletedAt) {
    return NextResponse.json(
      { success: false, error: 'Plan no encontrado o inactivo' },
      { status: 404 }
    )
  }

  const suscripcion = await prisma.suscripcion.findUnique({ where: { tenantId } })

  if (suscripcion && suscripcion.estado === 'ACTIVA') {
    return NextResponse.json(
      { success: false, error: 'La suscripción ya está activa. Usa cambiar-plan si necesitas modificarla.' },
      { status: 400 }
    )
  }

  const ahora = new Date()
  const fin = new Date(ahora)
  if (tipo === 'MENSUAL') {
    fin.setMonth(fin.getMonth() + 1)
  } else {
    fin.setFullYear(fin.getFullYear() + 1)
  }

  const result = await prisma.$transaction(async (tx) => {
    let suscripcionResult

    if (suscripcion) {
      // Reactivar existente
      suscripcionResult = await tx.suscripcion.update({
        where: { id: suscripcion.id },
        data: {
          planId: nuevoPlan.id,
          tipo,
          estado: 'ACTIVA',
          periodoInicio: ahora,
          periodoFin: fin,
          vencidoAt: null,
          suspendidoAt: null,
          canceladoAt: null,
          archivadoAt: null,
          metodoPago,
          tokenPago: null,
          pendingPlanId: null,
          pendingPlanTipo: null,
        },
      })
    } else {
      // Crear nueva
      suscripcionResult = await tx.suscripcion.create({
        data: {
          tenantId,
          planId: nuevoPlan.id,
          tipo,
          estado: 'ACTIVA',
          periodoInicio: ahora,
          periodoFin: fin,
          metodoPago,
        },
      })
    }

    const pago = await tx.pagoSuscripcion.create({
      data: {
        suscripcionId: suscripcionResult.id,
        tenantId,
        monto,
        tipo,
        estado: 'CONFIRMADO',
        metodoPago,
        transactionId: `REACTIVACION-${Date.now()}`,
        periodoInicio: ahora,
        periodoFin: fin,
      },
    })

    await tx.tenant.update({
      where: { id: tenantId },
      data: { status: 'ACTIVE' },
    })

    await tx.auditLog.create({
      data: {
        tenantId,
        userId: null,
        action: 'REACTIVAR_SUSCRIPCION',
        entityType: 'Suscripcion',
        entityId: suscripcionResult.id,
        changes: {
          estadoAnterior: suscripcion?.estado || 'SIN_SUSCRIPCION',
          planNuevo: nuevoPlan.nombre,
          tipo,
          monto,
          metodoPago,
          superAdminId,
        },
      },
    })

    return { suscripcion: suscripcionResult, pago }
  })

  return NextResponse.json({
    success: true,
    suscripcion: {
      id: result.suscripcion.id,
      estado: result.suscripcion.estado,
      periodoFin: result.suscripcion.periodoFin.toISOString(),
    },
    pago: { id: result.pago.id, monto: result.pago.monto },
  })
})
