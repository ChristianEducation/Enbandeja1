// ═══════════════════════════════════════════════════════════════════
// Middleware withAuth — extrae contexto de sesión para rutas de API
// ═══════════════════════════════════════════════════════════════════
// Extrae userId, activeTenantId y role de la sesión.
// Pasa el contexto a createTenantClient para inyectar en RLS.
//
// POLÍTICA B DE SUSPENSIÓN (M19):
// - Owner/Operador/Cocina: BLOQUEADOS si suscripción no está activa
// - Apoderado: SIGUE operando (no es su culpa que el comercio no pagó)
// - PERIODO_GRACIA: permite operar con banner
// - Rutas de billing (/owner/billing, /api/super-admin) NO se bloquean
//
// REGLA: toda ruta de negocio usa createTenantClient(tenantId, userId).
// NUNCA prisma global en rutas autenticadas.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@enbandeja/database'
import { verificarSuscripcion } from '@/lib/middleware/verificarSuscripcion'
import type { SessionContext } from '@enbandeja/shared'

type AuthenticatedHandler = (
  req: NextRequest,
  context: SessionContext
) => Promise<NextResponse>

/**
 * Wrapper para rutas de API que requieren autenticación.
 * Verifica sesión, extrae el contexto del tenant activo,
 * y aplica la política B de suscripción.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest) => {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const activeTenantId = session.activeTenantId

    if (!activeTenantId) {
      return NextResponse.json(
        { success: false, error: 'Sin tenant activo. Completa el onboarding.' },
        { status: 403 }
      )
    }

    // Resolver role del usuario en el tenant activo
    const userTenant = await prisma.userTenant.findFirst({
      where: {
        userId,
        tenantId: activeTenantId,
        isActive: true,
        deletedAt: null,
      },
      select: { role: true, colegioId: true },
    })

    if (!userTenant) {
      return NextResponse.json(
        { success: false, error: 'Sin acceso a este tenant' },
        { status: 403 }
      )
    }

    const context: SessionContext = {
      userId,
      tenantId: activeTenantId,
      role: userTenant.role,
      colegioId: userTenant.colegioId ?? undefined,
    }

    // Política B: verificar suscripción para roles no-apoderado
    // Apoderados siempre pasan (pueden pedir y pagar su almuerzo)
    if (context.role !== 'APODERADO') {
      const verificacion = await verificarSuscripcion(activeTenantId, context.role)

      if (verificacion.bloqueado) {
        return NextResponse.json(
          {
            success: false,
            error: verificacion.motivo || 'Suscripción no activa',
            codigo: 'SUSCRIPCION_BLOQUEADA',
            estado: verificacion.estado,
          },
          { status: 402 }
        )
      }
    }

    return handler(req, context)
  }
}

/**
 * Wrapper para rutas que requieren autenticación pero NO requieren
 * verificación de suscripción. Útil para:
 * - Onboarding donde el usuario aún no tiene suscripción
 * - Rutas de billing donde el owner necesita pagar
 * - Setup wizard
 */
export function withAuthNoTenant(handler: (req: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    return handler(req, session.user.id)
  }
}
