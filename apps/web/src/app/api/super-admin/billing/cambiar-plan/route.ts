// ═══════════════════════════════════════════════════════════════════
// POST /api/super-admin/billing/cambiar-plan
// ═══════════════════════════════════════════════════════════════════
// Solo Super Admin. Cambia el plan de un tenant:
// - Upgrade: inmediato con prorrateo del diferencial
// - Downgrade: al próximo ciclo (no inmediato)
// - Verifica que el nuevo plan permita los recursos actuales
//   (no permitir downgrade si tiene más colegios de los permitidos)
//
// BILLING SaaS: comercio → Enbandeja. NO pagos de apoderados.
// Toda acción queda en AuditLog.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { withSuperAuth } from '@/lib/middleware/withSuperAuth'
import { prisma } from '@enbandeja/database'
import { cambiarPlanSchema } from '@enbandeja/shared'

export const POST = withSuperAuth(async (req, { superAdminId }) => {
  const body = await req.json()
  const parsed = cambiarPlanSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Datos inválidos', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { tenantId, planId, tipo } = parsed.data

  // Verificar que el tenant existe
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

  // Verificar suscripción existente
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId },
    include: {
      Plan: {
        select: {
          id: true,
          tipo: true,
          nombre: true,
          precioMensual: true,
          precioAnual: true,
          maxColegios: true,
          maxUsuarios: true,
          Limites: true,
        },
      },
    },
  })

  if (!suscripcion) {
    return NextResponse.json(
      { success: false, error: 'El tenant no tiene suscripción registrada' },
      { status: 400 }
    )
  }

  // Verificar plan destino
  const nuevoPlan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { Limites: true },
  })

  if (!nuevoPlan || !nuevoPlan.isActive || nuevoPlan.deletedAt) {
    return NextResponse.json(
      { success: false, error: 'Plan no encontrado o inactivo' },
      { status: 404 }
    )
  }

  if (nuevoPlan.id === suscripcion.planId) {
    return NextResponse.json(
      { success: false, error: 'El tenant ya está en este plan' },
      { status: 400 }
    )
  }

  // Determinar si es upgrade o downgrade comparando precios
  const precioActual = tipo === 'MENSUAL'
    ? (suscripcion.Plan.precioMensual ?? 0)
    : (suscripcion.Plan.precioAnual ?? 0)
  const precioNuevo = tipo === 'MENSUAL'
    ? (nuevoPlan.precioMensual ?? 0)
    : (nuevoPlan.precioAnual ?? 0)

  const esUpgrade = precioNuevo > precioActual

  // DOWNGRADE: verificar que el nuevo plan soporta los recursos actuales
  if (!esUpgrade) {
    const colegiosActivos = await prisma.colegio.count({
      where: { tenantId, isActive: true, deletedAt: null },
    })

    const usuariosActivos = await prisma.userTenant.count({
      where: { tenantId, isActive: true, deletedAt: null },
    })

    const limiteColegiosNuevo = nuevoPlan.Limites.find(
      (l) => l.metrica === 'MAX_COLEGIOS'
    )?.valor ?? nuevoPlan.maxColegios

    const limiteUsuariosNuevo = nuevoPlan.Limites.find(
      (l) => l.metrica === 'MAX_USUARIOS'
    )?.valor ?? nuevoPlan.maxUsuarios

    if (limiteColegiosNuevo !== null && colegiosActivos > limiteColegiosNuevo) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede bajar de plan: el tenant tiene ${colegiosActivos} colegio(s) activo(s) pero el plan ${nuevoPlan.nombre} permite máximo ${limiteColegiosNuevo}. Debe desactivar colegios primero.`,
        },
        { status: 403 }
      )
    }

    if (limiteUsuariosNuevo !== null && usuariosActivos > limiteUsuariosNuevo) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede bajar de plan: el tenant tiene ${usuariosActivos} usuario(s) activo(s) pero el plan ${nuevoPlan.nombre} permite máximo ${limiteUsuariosNuevo}. Debe desactivar usuarios primero.`,
        },
        { status: 403 }
      )
    }
  }

  const ahora = new Date()

  if (esUpgrade) {
    // UPGRADE: inmediato con prorrateo
    const diasRestantes = Math.max(
      0,
      Math.ceil((suscripcion.periodoFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
    )
    const diasTotales = Math.ceil(
      (suscripcion.periodoFin.getTime() - suscripcion.periodoInicio.getTime()) / (1000 * 60 * 60 * 24)
    )
    const prorrateoActual = diasTotales > 0
      ? Math.round((precioActual / diasTotales) * diasRestantes)
      : 0
    const prorrateoNuevo = diasTotales > 0
      ? Math.round((precioNuevo / diasTotales) * diasRestantes)
      : 0
    const diferencial = Math.max(0, prorrateoNuevo - prorrateoActual)

    const result = await prisma.$transaction(async (tx) => {
      // Cambiar plan inmediatamente
      const suscripcionActualizada = await tx.suscripcion.update({
        where: { id: suscripcion.id },
        data: {
          planId: nuevoPlan.id,
          tipo,
        },
      })

      // Registrar pago del diferencial si hay prorrateo
      let pago = null
      if (diferencial > 0) {
        pago = await tx.pagoSuscripcion.create({
          data: {
            suscripcionId: suscripcion.id,
            tenantId,
            monto: diferencial,
            tipo,
            estado: 'CONFIRMADO',
            metodoPago: 'MANUAL',
            transactionId: `PRORRATEO-UPGRADE-${Date.now()}`,
            periodoInicio: ahora,
            periodoFin: suscripcion.periodoFin,
          },
        })
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: null,
          action: 'CAMBIO_PLAN_UPGRADE',
          entityType: 'Suscripcion',
          entityId: suscripcion.id,
          changes: {
            planAnterior: suscripcion.Plan.nombre,
            planNuevo: nuevoPlan.nombre,
            tipo,
            prorrateoDiferencial: diferencial,
            diasRestantes,
            superAdminId,
          },
        },
      })

      return { suscripcion: suscripcionActualizada, pago, diferencial }
    })

    return NextResponse.json({
      success: true,
      tipo: 'UPGRADE_INMEDIATO',
      suscripcion: {
        id: result.suscripcion.id,
        planNuevo: nuevoPlan.nombre,
        estado: result.suscripcion.estado,
        periodoFin: result.suscripcion.periodoFin.toISOString(),
      },
      prorrateo: result.diferencial,
      pago: result.pago
        ? { id: result.pago.id, monto: result.pago.monto }
        : null,
    })
  } else {
    // DOWNGRADE: al próximo ciclo, no inmediato
    // Se almacena pendingPlanId/pendingPlanTipo en la suscripción.
    // El cron de vencimientos (M19) aplica el cambio al iniciar
    // el nuevo período.

    await prisma.$transaction(async (tx) => {
      await tx.suscripcion.update({
        where: { id: suscripcion.id },
        data: {
          pendingPlanId: nuevoPlan.id,
          pendingPlanTipo: tipo,
        },
      })

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: null,
          action: 'CAMBIO_PLAN_DOWNGRADE_PENDIENTE',
          entityType: 'Suscripcion',
          entityId: suscripcion.id,
          changes: {
            planActual: suscripcion.Plan.nombre,
            planNuevo: nuevoPlan.nombre,
            tipo,
            aplicacion: 'PROXIMO_CICLO',
            fechaAplicacion: suscripcion.periodoFin.toISOString(),
            superAdminId,
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      tipo: 'DOWNGRADE_PROXIMO_CICLO',
      planActual: suscripcion.Plan.nombre,
      planNuevo: nuevoPlan.nombre,
      fechaAplicacion: suscripcion.periodoFin.toISOString(),
      mensaje: `El cambio al plan ${nuevoPlan.nombre} se aplicará automáticamente al inicio del próximo ciclo (${suscripcion.periodoFin.toLocaleDateString('es-CL')}).`,
    })
  }
})
