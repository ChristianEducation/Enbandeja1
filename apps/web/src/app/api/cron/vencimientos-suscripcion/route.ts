// ═══════════════════════════════════════════════════════════════════
// POST /api/cron/vencimientos-suscripcion
// ═══════════════════════════════════════════════════════════════════
// CRÍTICO: Este cron decide quién queda suspendido y quién activo.
//
// Transiciones de estado (respetando timezone del tenant):
//   ACTIVA → PERIODO_GRACIA (al vencer sin pago)
//   PERIODO_GRACIA → SUSPENDIDA (al terminar gracia, 7 días)
//   SUSPENDIDA → CANCELADA (tras 30 días suspendida)
//   CANCELADA → ARCHIVADA (tras 90 días cancelada, retención datos)
//
// REGLAS:
// - Idempotente: correr dos veces no salta estados
// - Una transición SOLO ocurre si la fecha lo justifica
// - NUNCA suspender un tenant con pago vigente
// - Timezone del tenant para calcular "hoy"
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server'
import { prisma } from '@enbandeja/database'
import { toZonedTime } from 'date-fns-tz'

const DIAS_GRACIA = 7
const DIAS_SUSPENDIDA = 30
const DIAS_CANCELADA = 90

/** Obtiene los userIds de los owners del tenant */
async function getOwnerIds(tenantId: string): Promise<string[]> {
  const owners = await prisma.userTenant.findMany({
    where: { tenantId, role: 'OWNER', isActive: true, deletedAt: null },
    select: { userId: true },
  })
  return owners.map((o) => o.userId)
}

/** Crea notificaciones de billing para todos los owners del tenant */
async function crearNotificacionBilling(
  tenantId: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  canal: string = 'PUSH'
) {
  const ownerIds = await getOwnerIds(tenantId)
  for (const userId of ownerIds) {
    await prisma.notificacionLog.create({
      data: { tenantId, userId, tipo, titulo, mensaje, canal },
    })
  }
}

export const POST = async (req: Request) => {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 })
  }

  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = new Date()
  const resultados: { tenantId: string; transicion: string; estado: string }[] = []

  const suscripciones = await prisma.suscripcion.findMany({
    where: {
      estado: { in: ['ACTIVA', 'PERIODO_GRACIA', 'SUSPENDIDA', 'CANCELADA'] },
    },
    include: {
      Tenant: { select: { id: true, timezone: true, name: true } },
      Plan: { select: { nombre: true } },
    },
  })

  for (const sus of suscripciones) {
    try {
      const tenantTimezone = sus.Tenant.timezone || 'America/Santiago'
      const horaLocal = toZonedTime(ahora, tenantTimezone)

      // Solo procesar al inicio del día (00:00-01:00 hora local)
      if (horaLocal.getHours() > 1) continue

      let transicion: string | null = null

      switch (sus.estado) {
        case 'ACTIVA': {
          if (sus.periodoFin <= ahora) {
            transicion = 'ACTIVA → PERIODO_GRACIA'
            await prisma.$transaction(async (tx) => {
              await tx.suscripcion.update({
                where: { id: sus.id },
                data: { estado: 'PERIODO_GRACIA', vencidoAt: ahora },
              })

              // Notificación a owners
              const owners = await tx.userTenant.findMany({
                where: { tenantId: sus.tenantId, role: 'OWNER', isActive: true, deletedAt: null },
                select: { userId: true },
              })
              for (const o of owners) {
                await tx.notificacionLog.create({
                  data: {
                    tenantId: sus.tenantId,
                    userId: o.userId,
                    tipo: 'BILLING_GRACIA',
                    titulo: 'Suscripción vencida',
                    mensaje: `Tu suscripción al plan ${sus.Plan.nombre} ha vencido. Tienes ${DIAS_GRACIA} días para regularizar el pago.`,
                    canal: 'PUSH',
                  },
                })
              }

              await tx.auditLog.create({
                data: {
                  tenantId: sus.tenantId,
                  userId: null,
                  action: 'SUSCRIPCION_GRACIA',
                  entityType: 'Suscripcion',
                  entityId: sus.id,
                  changes: {
                    estadoAnterior: 'ACTIVA',
                    estadoNuevo: 'PERIODO_GRACIA',
                    periodoFin: sus.periodoFin.toISOString(),
                  },
                },
              })
            })
          }
          break
        }

        case 'PERIODO_GRACIA': {
          const fechaVencimiento = sus.vencidoAt || sus.periodoFin
          const diasEnGracia = Math.floor(
            (ahora.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (diasEnGracia >= DIAS_GRACIA) {
            transicion = 'PERIODO_GRACIA → SUSPENDIDA'
            await prisma.$transaction(async (tx) => {
              await tx.suscripcion.update({
                where: { id: sus.id },
                data: { estado: 'SUSPENDIDA', suspendidoAt: ahora },
              })

              await tx.tenant.update({
                where: { id: sus.tenantId },
                data: { status: 'SUSPENDED' },
              })

              const owners = await tx.userTenant.findMany({
                where: { tenantId: sus.tenantId, role: 'OWNER', isActive: true, deletedAt: null },
                select: { userId: true },
              })
              for (const o of owners) {
                await tx.notificacionLog.create({
                  data: {
                    tenantId: sus.tenantId,
                    userId: o.userId,
                    tipo: 'BILLING_SUSPENDIDA',
                    titulo: 'Suscripción suspendida',
                    mensaje: 'Tu suscripción ha sido suspendida por falta de pago. Los operadores y owners no pueden acceder. Los apoderados pueden seguir operando.',
                    canal: 'PUSH',
                  },
                })
              }

              await tx.auditLog.create({
                data: {
                  tenantId: sus.tenantId,
                  userId: null,
                  action: 'SUSCRIPCION_SUSPENDIDA',
                  entityType: 'Suscripcion',
                  entityId: sus.id,
                  changes: { estadoAnterior: 'PERIODO_GRACIA', estadoNuevo: 'SUSPENDIDA', diasEnGracia },
                },
              })
            })
          }
          break
        }

        case 'SUSPENDIDA': {
          const fechaSuspension = sus.suspendidoAt || ahora
          const diasSuspendido = Math.floor(
            (ahora.getTime() - fechaSuspension.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (diasSuspendido >= DIAS_SUSPENDIDA) {
            transicion = 'SUSPENDIDA → CANCELADA'
            await prisma.$transaction(async (tx) => {
              await tx.suscripcion.update({
                where: { id: sus.id },
                data: { estado: 'CANCELADA', canceladoAt: ahora },
              })

              await tx.tenant.update({
                where: { id: sus.tenantId },
                data: { status: 'CANCELLED' },
              })

              const owners = await tx.userTenant.findMany({
                where: { tenantId: sus.tenantId, role: 'OWNER', isActive: true, deletedAt: null },
                select: { userId: true },
              })
              for (const o of owners) {
                await tx.notificacionLog.create({
                  data: {
                    tenantId: sus.tenantId,
                    userId: o.userId,
                    tipo: 'BILLING_CANCELADA',
                    titulo: 'Suscripción cancelada',
                    mensaje: `Tu suscripción ha sido cancelada tras ${DIAS_SUSPENDIDA} días sin pago. Contacta al equipo Enbandeja para reactivar.`,
                    canal: 'PUSH',
                  },
                })
              }

              await tx.auditLog.create({
                data: {
                  tenantId: sus.tenantId,
                  userId: null,
                  action: 'SUSCRIPCION_CANCELADA_AUTO',
                  entityType: 'Suscripcion',
                  entityId: sus.id,
                  changes: { estadoAnterior: 'SUSPENDIDA', estadoNuevo: 'CANCELADA', diasSuspendido },
                },
              })
            })
          }
          break
        }

        case 'CANCELADA': {
          const fechaCancelacion = sus.canceladoAt || ahora
          const diasCancelado = Math.floor(
            (ahora.getTime() - fechaCancelacion.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (diasCancelado >= DIAS_CANCELADA) {
            transicion = 'CANCELADA → ARCHIVADA'
            await prisma.$transaction(async (tx) => {
              await tx.suscripcion.update({
                where: { id: sus.id },
                data: { estado: 'ARCHIVADA', archivadoAt: ahora },
              })

              await tx.auditLog.create({
                data: {
                  tenantId: sus.tenantId,
                  userId: null,
                  action: 'SUSCRIPCION_ARCHIVADA',
                  entityType: 'Suscripcion',
                  entityId: sus.id,
                  changes: { estadoAnterior: 'CANCELADA', estadoNuevo: 'ARCHIVADA', diasCancelado },
                },
              })
            })
          }
          break
        }
      }

      if (transicion) {
        resultados.push({ tenantId: sus.tenantId, transicion, estado: sus.estado })
      }
    } catch (err) {
      console.error(`Error procesando suscripción ${sus.id}:`, err)
      resultados.push({ tenantId: sus.tenantId, transicion: 'ERROR', estado: sus.estado })
    }
  }

  // Notificación: 7 días antes de renovación anual
  const en7Dias = new Date(ahora)
  en7Dias.setDate(en7Dias.getDate() + 7)

  const anualesPorVencer = await prisma.suscripcion.findMany({
    where: {
      tipo: 'ANUAL',
      estado: 'ACTIVA',
      periodoFin: { gte: en7Dias, lte: new Date(en7Dias.getTime() + 24 * 60 * 60 * 1000) },
    },
  })

  for (const sus of anualesPorVencer) {
    await crearNotificacionBilling(
      sus.tenantId,
      'BILLING_RENOVACION_PROXIMA',
      'Renovación anual próxima',
      `Tu suscripción anual se renueva el ${sus.periodoFin.toLocaleDateString('es-CL')}. Asegúrate de tener tu pago al día.`
    )
  }

  // Notificación: 3 días antes de vencimiento
  const en3Dias = new Date(ahora)
  en3Dias.setDate(en3Dias.getDate() + 3)

  const porVencer = await prisma.suscripcion.findMany({
    where: {
      estado: 'ACTIVA',
      periodoFin: { gte: en3Dias, lte: new Date(en3Dias.getTime() + 24 * 60 * 60 * 1000) },
    },
  })

  for (const sus of porVencer) {
    await crearNotificacionBilling(
      sus.tenantId,
      'BILLING_VENCIMIENTO_PROXIMO',
      'Vencimiento próximo',
      `Tu suscripción vence el ${sus.periodoFin.toLocaleDateString('es-CL')}. Regulariza tu pago para evitar interrupciones.`
    )
  }

  return NextResponse.json({
    procesadas: resultados.length,
    transiciones: resultados,
    avisosRenovacionAnual: anualesPorVencer.length,
    avisosVencimientoProximo: porVencer.length,
  })
}
