// ═══════════════════════════════════════════════════════════════════
// POST /api/super-admin/billing/confirmar-pago
// ═══════════════════════════════════════════════════════════════════
// Solo Super Admin. Registra un PagoSuscripcion manual y
// activa/renueva la suscripción del tenant.
//
// BILLING SaaS: comercio → Enbandeja. NO pagos de apoderados.
// Toda acción queda en AuditLog.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { withSuperAuth } from '@/lib/middleware/withSuperAuth'
import { prisma } from '@enbandeja/database'
import { confirmarPagoSchema } from '@enbandeja/shared'

export const POST = withSuperAuth(async (req, { superAdminId }) => {
  const body = await req.json()
  const parsed = confirmarPagoSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Datos inválidos', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { tenantId, monto, tipo, metodoPago, transactionId, periodoInicio } = parsed.data

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

  // Buscar suscripción existente
  const suscripcionExistente = await prisma.suscripcion.findUnique({
    where: { tenantId },
    include: { Plan: { select: { nombre: true } } },
  })

  const ahora = new Date()
  const inicio = periodoInicio ? new Date(periodoInicio) : ahora

  // Calcular fin del período
  const fin = new Date(inicio)
  if (tipo === 'MENSUAL') {
    fin.setMonth(fin.getMonth() + 1)
  } else {
    fin.setFullYear(fin.getFullYear() + 1)
  }

  const result = await prisma.$transaction(async (tx) => {
    let suscripcion

    if (suscripcionExistente) {
      // Renovar/activar suscripción existente
      // Si estaba suspendida/cancelada/en gracia → vuelve a ACTIVA
      // Si estaba activa → extiende el período
      const nuevoInicio = suscripcionExistente.estado === 'ACTIVA'
        ? suscripcionExistente.periodoFin // Extiende desde donde termina
        : inicio

      const nuevoFin = new Date(nuevoInicio)
      if (tipo === 'MENSUAL') {
        nuevoFin.setMonth(nuevoFin.getMonth() + 1)
      } else {
        nuevoFin.setFullYear(nuevoFin.getFullYear() + 1)
      }

      suscripcion = await tx.suscripcion.update({
        where: { id: suscripcionExistente.id },
        data: {
          estado: 'ACTIVA',
          tipo,
          periodoInicio: suscripcionExistente.estado === 'ACTIVA'
            ? suscripcionExistente.periodoInicio
            : inicio,
          periodoFin: nuevoFin,
          vencidoAt: null,
          suspendidoAt: null,
          canceladoAt: null,
          archivadoAt: null,
          metodoPago,
        },
      })
    } else {
      // Sin suscripción — crear una nueva con el plan del tenant
      // El Super Admin debe haber especificado un plan previamente
      // o usar el plan Starter por defecto
      const planStarter = await tx.plan.findUnique({
        where: { tipo: 'STARTER' },
      })

      if (!planStarter) {
        throw new Error('No se encontró el plan Starter. Ejecuta el seed.')
      }

      suscripcion = await tx.suscripcion.create({
        data: {
          tenantId,
          planId: planStarter.id,
          tipo,
          estado: 'ACTIVA',
          periodoInicio: inicio,
          periodoFin: fin,
          metodoPago,
        },
      })
    }

    // Registrar PagoSuscripcion (tabla inmutable)
    const pago = await tx.pagoSuscripcion.create({
      data: {
        suscripcionId: suscripcion.id,
        tenantId,
        monto,
        tipo,
        estado: 'CONFIRMADO',
        metodoPago,
        transactionId: transactionId || `MANUAL-${Date.now()}`,
        periodoInicio: suscripcionExistente?.estado === 'ACTIVA'
          ? suscripcionExistente.periodoFin
          : inicio,
        periodoFin: suscripcionExistente?.estado === 'ACTIVA'
          ? suscripcion.periodoFin
          : fin,
      },
    })

    // Actualizar estado del tenant a ACTIVE si estaba SUSPENDED/CANCELLED
    if (tenant.status !== 'ACTIVE') {
      await tx.tenant.update({
        where: { id: tenantId },
        data: { status: 'ACTIVE' },
      })
    }

    // AuditLog
    await tx.auditLog.create({
      data: {
        tenantId,
        userId: null, // Super Admin no está en User, sino en SuperAdmin
        action: 'CONFIRMAR_PAGO_SUSCRIPCION',
        entityType: 'PagoSuscripcion',
        entityId: pago.id,
        changes: {
          monto,
          tipo,
          metodoPago,
          transactionId: transactionId || `MANUAL-${Date.now()}`,
          suscripcionEstado: suscripcion.estado,
          superAdminId,
        },
      },
    })

    return { suscripcion, pago }
  })

  return NextResponse.json({
    success: true,
    suscripcion: {
      id: result.suscripcion.id,
      estado: result.suscripcion.estado,
      periodoFin: result.suscripcion.periodoFin.toISOString(),
    },
    pago: {
      id: result.pago.id,
      monto: result.pago.monto,
      estado: result.pago.estado,
    },
  })
})
