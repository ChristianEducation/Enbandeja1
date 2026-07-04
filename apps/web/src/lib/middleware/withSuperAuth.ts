// ═══════════════════════════════════════════════════════════════════
// withSuperAuth — Middleware para rutas exclusivas del Super Admin
// ═══════════════════════════════════════════════════════════════════
// Valida que el usuario autenticado tiene un registro activo en
// la tabla SuperAdmin. Solo el Super Admin gestiona billing SaaS
// (comercio → Enbandeja), NO pagos de apoderados.
//
// REGLA: toda ruta /api/super-admin/* pasa por aquí.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@enbandeja/database'

type SuperAdminHandler = (
  req: NextRequest,
  context: { superAdminId: string; superAdminEmail: string }
) => Promise<NextResponse>

/**
 * Wrapper para rutas de API que requieren Super Admin.
 * Verifica sesión de NextAuth + registro activo en tabla SuperAdmin.
 */
export function withSuperAuth(handler: SuperAdminHandler) {
  return async (req: NextRequest) => {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario es Super Admin activo
    const superAdmin = await prisma.superAdmin.findFirst({
      where: {
        email: session.user.email!,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
      },
    })

    if (!superAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requiere Super Admin.' },
        { status: 403 }
      )
    }

    return handler(req, {
      superAdminId: superAdmin.id,
      superAdminEmail: superAdmin.email,
    })
  }
}
