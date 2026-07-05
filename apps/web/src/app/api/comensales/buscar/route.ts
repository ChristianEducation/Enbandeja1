import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@enbandeja/database'
import { z } from 'zod'
import { auth } from '@/lib/auth'

// ═══════════════════════════════════════════════════════════════════
// GET /api/comensales/buscar
// ═══════════════════════════════════════════════════════════════════
// Busca comensales precargados (apoderadoId IS NULL) en un colegio
// y curso determinado.
//
// NOTA: autenticado sin tenant porque el apoderado en onboarding
// no tiene un activeTenantId aún.
// ═══════════════════════════════════════════════════════════════════

const buscarSchema = z.object({
  tenantId: z.string().uuid('tenantId inválido'),
  colegioId: z.string().uuid('colegioId inválido'),
  curso: z.string().min(1, 'el curso es obligatorio'),
  q: z.string().min(2, 'debe buscar al menos 2 caracteres'),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get('tenantId') ?? ''
    const colegioId = searchParams.get('colegioId') ?? ''
    const curso = searchParams.get('curso') ?? ''
    const q = searchParams.get('q') ?? ''

    // Validación estricta con Zod
    const result = buscarSchema.safeParse({ tenantId, colegioId, curso, q })
    if (!result.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { tenantId: validTenant, colegioId: validColegio, curso: validCurso, q: validQ } = result.data

    // Búsqueda en DB global
    const comensales = await prisma.comensal.findMany({
      where: {
        tenantId: validTenant,
        colegioId: validColegio,
        curso: validCurso,
        apoderadoId: null, // SOLO precargados
        isActive: true,
        deletedAt: null,
        OR: [
          { nombre: { contains: validQ, mode: 'insensitive' } },
          { apellido: { contains: validQ, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        curso: true,
      },
      take: 10,
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
    })

    return NextResponse.json({ comensales })
  } catch (error) {
    console.error('[API Buscar Comensales Error]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor intentando buscar comensales' },
      { status: 500 }
    )
  }
}
