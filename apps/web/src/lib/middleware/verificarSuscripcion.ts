// ═══════════════════════════════════════════════════════════════════
// verificarSuscripcion — Middleware de billing para rutas de negocio
// ═══════════════════════════════════════════════════════════════════
// CRÍTICO: Este middleware se ejecuta en TODAS las rutas de negocio.
// Si está mal, rompe la app entera.
//
// POLÍTICA B DE SUSPENSIÓN:
// - Operador/Owner: BLOQUEADOS si suscripción no está activa
//   (son responsables del pago)
// - Apoderados: SIGUEN operando (pueden pedir y pagar su almuerzo,
//   no es su culpa que el comercio no pagó)
// - PERIODO_GRACIA: permite operar con banner (todos los roles)
// - ACTIVA y TRIAL: permiten operar
// - NUNCA se aplica a: /login, /registro, /setup/*, /api/auth/*,
//   /api/cron/*, /owner/billing (el owner debe poder pagar)
//
// Downgrade pendiente (M19): si pendingPlanId está seteado y el
// periodo ya venció, se aplica automáticamente al inicio del nuevo ciclo.
// ═══════════════════════════════════════════════════════════════════
import { prisma } from "@enbandeja/database"

const ESTADOS_BLOQUEADOS_OWNER = ["SUSPENDIDA", "CANCELADA", "ARCHIVADA"] as const
const ESTADOS_ACTIVOS = ["ACTIVA", "PERIODO_GRACIA"] as const

export interface VerificacionSuscripcion {
  activa: boolean
  estado: string | null
  planNombre: string | null
  periodoFin: Date | null
  enGracia: boolean
  bloqueado: boolean
  motivo?: string
}

/**
 * Verifica el estado de la suscripción de un tenant.
 * Aplica política B: bloquea owner/operador, permite apoderado.
 */
export async function verificarSuscripcion(
  tenantId: string,
  role?: string
): Promise<VerificacionSuscripcion> {
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId },
    include: { Plan: { select: { nombre: true } } },
  })

  // Sin suscripción registrada
  if (!suscripcion) {
    return {
      activa: false,
      estado: null,
      planNombre: null,
      periodoFin: null,
      enGracia: false,
      bloqueado: true,
      motivo: "Sin suscripción registrada. Contacta al equipo Enbandeja.",
    }
  }

  // Estados activos — permite operar
  if ((ESTADOS_ACTIVOS as readonly string[]).includes(suscripcion.estado)) {
    const enGracia = suscripcion.estado === "PERIODO_GRACIA"

    // Aplicar downgrade pendiente si el nuevo ciclo ya empezó
    if (
      suscripcion.pendingPlanId &&
      suscripcion.pendingPlanTipo &&
      suscripcion.periodoFin <= new Date()
    ) {
      await aplicarDowngradePendiente(suscripcion.id, suscripcion.pendingPlanId, suscripcion.pendingPlanTipo)
    }

    return {
      activa: true,
      estado: suscripcion.estado,
      planNombre: suscripcion.Plan.nombre,
      periodoFin: suscripcion.periodoFin,
      enGracia,
      bloqueado: false,
      motivo: enGracia
        ? "Tu suscripción está en período de gracia. Regulariza tu pago pronto."
        : undefined,
    }
  }

  // Estados bloqueados — política B:
  // Owner/Operador/Cocina → BLOQUEADO
  // Apoderado → PERMITE operar
  if ((ESTADOS_BLOQUEADOS_OWNER as readonly string[]).includes(suscripcion.estado)) {
    const esApoderado = role === "APODERADO"

    return {
      activa: !esApoderado,
      estado: suscripcion.estado,
      planNombre: suscripcion.Plan.nombre,
      periodoFin: suscripcion.periodoFin,
      enGracia: false,
      bloqueado: !esApoderado,
      motivo: !esApoderado
        ? `Tu suscripción está ${suscripcion.estado.toLowerCase()}. Regulariza tu pago para continuar.`
        : undefined,
    }
  }

  // Fallback — no debería llegar aquí
  return {
    activa: false,
    estado: suscripcion.estado,
    planNombre: suscripcion.Plan.nombre,
    periodoFin: suscripcion.periodoFin,
    enGracia: false,
    bloqueado: true,
    motivo: `Estado de suscripción desconocido: ${suscripcion.estado}`,
  }
}

/**
 * Aplica un downgrade pendiente cuando inicia el nuevo ciclo.
 * Usa pendingPlanId y pendingPlanTipo (campos formales, no hack).
 */
async function aplicarDowngradePendiente(
  suscripcionId: string,
  planId: string,
  tipo: string
): Promise<void> {
  await prisma.suscripcion.update({
    where: { id: suscripcionId },
    data: {
      planId,
      tipo: tipo as "MENSUAL" | "ANUAL",
      pendingPlanId: null,
      pendingPlanTipo: null,
    },
  })

  await prisma.auditLog.create({
    data: {
      tenantId: (await prisma.suscripcion.findUnique({
        where: { id: suscripcionId },
        select: { tenantId: true },
      }))!.tenantId,
      userId: null,
      action: "DOWNGRADE_APLICADO",
      entityType: "Suscripcion",
      entityId: suscripcionId,
      changes: { planId, tipo, aplicadoAt: new Date().toISOString() },
    },
  })
}

/**
 * Verifica un límite específico del plan (ej: MAX_COLEGIOS, MAX_USUARIOS).
 * Retorna true si está dentro del límite, false si lo excede.
 * null en valor = ilimitado (siempre true).
 */
export async function verificarLimitePlan(
  tenantId: string,
  metrica: string,
  cantidadActual: number
): Promise<{ dentroDelLimite: boolean; limite: number | null; planNombre: string }> {
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId },
    include: {
      Plan: {
        select: { nombre: true, Limites: { where: { metrica } } },
      },
    },
  })

  const planNombre = suscripcion?.Plan.nombre || "Sin plan"
  const limite = suscripcion?.Plan.Limites[0]?.valor ?? null

  if (limite === null) {
    return { dentroDelLimite: true, limite: null, planNombre }
  }

  return {
    dentroDelLimite: cantidadActual < limite,
    limite,
    planNombre,
  }
}

/**
 * Obtiene los límites del plan actual del tenant.
 */
export async function obtenerLimitesPlan(tenantId: string): Promise<{
  maxColegios: number | null
  maxUsuarios: number | null
  planNombre: string
  estado: string | null
}> {
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId },
    include: {
      Plan: {
        select: { nombre: true, maxColegios: true, maxUsuarios: true, Limites: true },
      },
    },
  })

  if (!suscripcion) {
    return {
      maxColegios: 0,
      maxUsuarios: 0,
      planNombre: "Sin plan",
      estado: null,
    }
  }

  const limiteColegios = suscripcion.Plan.Limites.find((l) => l.metrica === "MAX_COLEGIOS")
  const limiteUsuarios = suscripcion.Plan.Limites.find((l) => l.metrica === "MAX_USUARIOS")

  return {
    maxColegios: limiteColegios?.valor ?? suscripcion.Plan.maxColegios,
    maxUsuarios: limiteUsuarios?.valor ?? suscripcion.Plan.maxUsuarios,
    planNombre: suscripcion.Plan.nombre,
    estado: suscripcion.estado,
  }
}
