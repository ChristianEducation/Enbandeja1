// ═══════════════════════════════════════════════════════════════════
// POST /api/billing/cambiar-plan — Owner cambia su plan
// ═══════════════════════════════════════════════════════════════════
// Solo OWNER. Sin verificación de suscripción (billing route).
// Upgrade: inmediato con prorrateo. Downgrade: próximo ciclo.
// Downgrade NO deja al tenant con más recursos de los permitidos.
// Toda acción en AuditLog.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { withAuthBilling } from '@/lib/middleware/withAuthBilling'
import { prisma } from '@enbandeja/database'
import { cambiarPlanSchema } from '@enbandeja/shared'
import type { SessionContext } from '@enbandeja/shared'

export const POST = withAuthBilling(async (req: NextRequest, context: SessionContext) => {
  const body = await req.json()
  const parsed = cambiarPlanSchema.safeParse({ ...body, tenantId: context.tenantId })

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Datos inválidos', details: parsed.error.issues }, { status: 400 })
  }

  const { planId, tipo } = parsed.data
  const tenantId = context.tenantId

  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId },
    include: { Plan: { select: { id: true, nombre: true, precioMensual: true, precioAnual: true, maxColegios: true, maxUsuarios: true, Limites: true } } },
  })

  if (!suscripcion) {
    return NextResponse.json({ success: false, error: 'Sin suscripción registrada' }, { status: 400 })
  }

  if (suscripcion.estado !== 'ACTIVA' && suscripcion.estado !== 'PERIODO_GRACIA') {
    return NextResponse.json({ success: false, error: 'No puedes cambiar de plan con suscripción suspendida/cancelada. Reactiva primero.' }, { status: 400 })
  }

  const nuevoPlan = await prisma.plan.findUnique({ where: { id: planId }, include: { Limites: true } })
  if (!nuevoPlan || !nuevoPlan.isActive || nuevoPlan.deletedAt) {
    return NextResponse.json({ success: false, error: 'Plan no encontrado' }, { status: 404 })
  }

  if (nuevoPlan.id === suscripcion.planId) {
    return NextResponse.json({ success: false, error: 'Ya estás en este plan' }, { status: 400 })
  }

  const precioActual = tipo === 'MENSUAL' ? (suscripcion.Plan.precioMensual ?? 0) : (suscripcion.Plan.precioAnual ?? 0)
  const precioNuevo = tipo === 'MENSUAL' ? (nuevoPlan.precioMensual ?? 0) : (nuevoPlan.precioAnual ?? 0)
  const esUpgrade = precioNuevo > precioActual

  if (!esUpgrade) {
    const colegiosActivos = await prisma.colegio.count({ where: { tenantId, isActive: true, deletedAt: null } })
    const usuariosActivos = await prisma.userTenant.count({ where: { tenantId, isActive: true, deletedAt: null } })
    const limiteColegios = nuevoPlan.Limites.find(l => l.metrica === 'MAX_COLEGIOS')?.valor ?? nuevoPlan.maxColegios
    const limiteUsuarios = nuevoPlan.Limites.find(l => l.metrica === 'MAX_USUARIOS')?.valor ?? nuevoPlan.maxUsuarios

    if (limiteColegios !== null && colegiosActivos > limiteColegios) {
      return NextResponse.json({ success: false, error: `Tienes ${colegiosActivos} colegios pero el plan ${nuevoPlan.nombre} permite máximo ${limiteColegios}` }, { status: 403 })
    }
    if (limiteUsuarios !== null && usuariosActivos > limiteUsuarios) {
      return NextResponse.json({ success: false, error: `Tienes ${usuariosActivos} usuarios pero el plan ${nuevoPlan.nombre} permite máximo ${limiteUsuarios}` }, { status: 403 })
    }
  }

  const ahora = new Date()

  if (esUpgrade) {
    const diasRestantes = Math.max(0, Math.ceil((suscripcion.periodoFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)))
    const diasTotales = Math.ceil((suscripcion.periodoFin.getTime() - suscripcion.periodoInicio.getTime()) / (1000 * 60 * 60 * 24))
    const prorrateoActual = diasTotales > 0 ? Math.round((precioActual / diasTotales) * diasRestantes) : 0
    const prorrateoNuevo = diasTotales > 0 ? Math.round((precioNuevo / diasTotales) * diasRestantes) : 0
    const diferencial = Math.max(0, prorrateoNuevo - prorrateoActual)

    await prisma.$transaction(async (tx) => {
      await tx.suscripcion.update({ where: { id: suscripcion.id }, data: { planId: nuevoPlan.id, tipo } })

      if (diferencial > 0) {
        await tx.pagoSuscripcion.create({
          data: {
            suscripcionId: suscripcion.id, tenantId, monto: diferencial, tipo,
            estado: 'PENDIENTE', metodoPago: 'MANUAL',
            transactionId: `PRORRATEO-UPGRADE-${Date.now()}`,
            periodoInicio: ahora, periodoFin: suscripcion.periodoFin,
          },
        })
      }

      await tx.auditLog.create({
        data: {
          tenantId, userId: context.userId,
          action: 'OWNER_CAMBIO_PLAN_UPGRADE',
          entityType: 'Suscripcion', entityId: suscripcion.id,
          changes: { planAnterior: suscripcion.Plan.nombre, planNuevo: nuevoPlan.nombre, tipo, prorrateoDiferencial: diferencial },
        },
      })
    })

    return NextResponse.json({ success: true, tipo: 'UPGRADE_INMEDIATO', planNuevo: nuevoPlan.nombre, prorrateo: diferencial, mensaje: 'Plan actualizado inmediatamente.' })
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.suscripcion.update({
        where: { id: suscripcion.id },
        data: { pendingPlanId: nuevoPlan.id, pendingPlanTipo: tipo },
      })

      await tx.auditLog.create({
        data: {
          tenantId, userId: context.userId,
          action: 'OWNER_CAMBIO_PLAN_DOWNGRADE_PENDIENTE',
          entityType: 'Suscripcion', entityId: suscripcion.id,
          changes: { planActual: suscripcion.Plan.nombre, planNuevo: nuevoPlan.nombre, fechaAplicacion: suscripcion.periodoFin.toISOString() },
        },
      })
    })

    return NextResponse.json({
      success: true, tipo: 'DOWNGRADE_PROXIMO_CICLO',
      planNuevo: nuevoPlan.nombre,
      fechaAplicacion: suscripcion.periodoFin.toLocaleDateString('es-CL'),
      mensaje: `El cambio al plan ${nuevoPlan.nombre} se aplicará al inicio del próximo ciclo.`,
    })
  }
})
