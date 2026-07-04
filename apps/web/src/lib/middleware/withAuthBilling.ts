// ═══════════════════════════════════════════════════════════════════
// withAuthBilling — Wrapper para rutas de billing del owner
// ═══════════════════════════════════════════════════════════════════
// Verifica auth + rol OWNER pero NO verifica suscripción.
// El owner debe poder acceder a billing incluso si está suspendido
// (para pagar o cambiar plan).
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@enbandeja/database'
import type { SessionContext } from '@enbandeja/shared'

type AuthenticatedHandler = (
  req: NextRequest,
  context: SessionContext
) => Promise<NextResponse>

export function withAuthBilling(handler: AuthenticatedHandler) {
  return async (req: NextRequest) => {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const userId = session.user.id
    const activeTenantId = session.activeTenantId

    if (!activeTenantId) {
      return NextResponse.json({ success: false, error: 'Sin tenant activo' }, { status: 403 })
    }

    const userTenant = await prisma.userTenant.findFirst({
      where: { userId, tenantId: activeTenantId, role: 'OWNER', isActive: true, deletedAt: null },
    })

    if (!userTenant) {
      return NextResponse.json({ success: false, error: 'Solo el owner puede gestionar billing' }, { status: 403 })
    }

    const context: SessionContext = {
      userId,
      tenantId: activeTenantId,
      role: 'OWNER',
    }

    return handler(req, context)
  }
}
