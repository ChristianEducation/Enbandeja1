// ═══════════════════════════════════════════════════════════════════
// API: Vincular código de casino — POST /api/vincular/codigo
// ═══════════════════════════════════════════════════════════════════
// El apoderado ingresa el código de casino durante el onboarding.
// Este endpoint SOLO valida que el código existe y retorna info
// del colegio. NO persiste nada.
//
// Usa prisma global (CORRECTO): el apoderado aún no tiene tenant.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@enbandeja/database'
import { vincularCodigoSchema } from '@enbandeja/shared'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Requiere autenticación pero NO requiere tenant
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401 }
    )
  }

  // Validar body con Zod
  const body = await req.json()
  const parsed = vincularCodigoSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.errors[0]?.message ?? 'Código inválido',
      },
      { status: 400 }
    )
  }

  const { codigoCasino } = parsed.data

  // Buscar colegio por código — usa prisma global (correcto, sin tenant aún)
  const colegio = await prisma.colegio.findUnique({
    where: {
      codigoCasino,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      tenantId: true,
      nombre: true,
    },
  })

  if (!colegio) {
    return NextResponse.json(
      { success: false, error: 'Código de casino no encontrado' },
      { status: 404 }
    )
  }

  // Verificar que el tenant esté activo
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: colegio.tenantId,
      deletedAt: null,
    },
    select: {
      id: true,
      status: true,
    },
  })

  if (!tenant || tenant.status === 'CANCELLED') {
    return NextResponse.json(
      { success: false, error: 'Este casino no está disponible actualmente' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      colegioId: colegio.id,
      tenantId: colegio.tenantId,
      colegioNombre: colegio.nombre,
    },
  })
}
