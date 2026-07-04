import { prisma } from '@enbandeja/database'
import { Suspense } from 'react'
import { ComensalFlow } from '@/components/onboarding/comensal-flow'

// ═══════════════════════════════════════════════════════════════════
// Onboarding Paso 2 — Datos del Comensal
// ═══════════════════════════════════════════════════════════════════
// Server Component. Verifica si el colegio tiene alumnos precargados.
// Si tiene, le pasa los cursos a ComensalFlow (modo búsqueda).
// Si no tiene, el array va vacío (modo manual directo).
// ═══════════════════════════════════════════════════════════════════

export default async function ComensalPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const colegioId = Array.isArray(resolvedSearchParams?.colegioId)
    ? resolvedSearchParams.colegioId[0]
    : resolvedSearchParams?.colegioId

  let cursosDisponibles: string[] = []

  if (colegioId && typeof colegioId === 'string') {
    const cursosRaw = await prisma.comensal.findMany({
      where: {
        colegioId,
        apoderadoId: null,
        isActive: true,
        deletedAt: null,
      },
      select: { curso: true },
      distinct: ['curso'],
    })
    cursosDisponibles = cursosRaw.map((c) => c.curso).sort()
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ComensalFlow cursosDisponibles={cursosDisponibles} />
    </Suspense>
  )
}
