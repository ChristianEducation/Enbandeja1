// ═══════════════════════════════════════════════════════════════════
// API: Crear comensal — POST /api/comensales/crear
// ═══════════════════════════════════════════════════════════════════
// Crea un comensal y vincula al apoderado con el tenant si es la
// primera vez. Actualiza Session.activeTenantId.
//
// Usa prisma global para crear UserTenant (operación cross-tenant).
// Luego usa createTenantClient para crear el Comensal con RLS.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { prisma, createTenantClient } from '@enbandeja/database'
import { crearComensalSchema } from '@enbandeja/shared'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Requiere autenticación pero puede no tener tenant aún
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401 }
    )
  }

  const userId = session.user.id

  // Validar body con Zod
  const body = await req.json()
  const parsed = crearComensalSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
      },
      { status: 400 }
    )
  }

  const { colegioId, vinculo, comensalId } = parsed.data

  // Variables para extraer los campos opcionales del body solo si aplican
  const nombre = 'nombre' in parsed.data ? parsed.data.nombre : undefined
  const apellido = 'apellido' in parsed.data ? parsed.data.apellido : undefined
  const curso = 'curso' in parsed.data ? parsed.data.curso : undefined
  const nivel = 'nivel' in parsed.data ? parsed.data.nivel : undefined
  const categoriaPrecioId = 'categoriaPrecioId' in parsed.data ? parsed.data.categoriaPrecioId : undefined

  // Verificar que el colegio existe y obtener su tenantId
  const colegio = await prisma.colegio.findUnique({
    where: {
      id: colegioId,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      tenantId: true,
    },
  })

  if (!colegio) {
    return NextResponse.json(
      { success: false, error: 'Colegio no encontrado' },
      { status: 404 }
    )
  }

  const tenantId = colegio.tenantId

  // Crear UserTenant si no existe (operación global, no tenant-scoped)
  const existingUserTenant = await prisma.userTenant.findFirst({
    where: {
      userId,
      tenantId,
      deletedAt: null,
    },
  })

  if (!existingUserTenant) {
    await prisma.userTenant.create({
      data: {
        userId,
        tenantId,
        role: 'APODERADO',
        colegioId,
      },
    })
  }

  // Actualizar Session.activeTenantId
  await prisma.session.updateMany({
    where: {
      userId,
      expires: { gt: new Date() },
    },
    data: {
      activeTenantId: tenantId,
    },
  })

  // Ahora crear o vincular el Comensal con createTenantClient (con RLS inyectado)
  const db = createTenantClient(tenantId, userId)

  let finalComensalId: string

  // PATH A — comensalId viene en el body (vincular precargado)
  if (comensalId) {
    // 1. Buscar el Comensal verificando que exista y no esté vinculado
    const existingComensal = await db.comensal.findUnique({
      where: { id: comensalId },
    })

    if (!existingComensal || existingComensal.apoderadoId !== null || existingComensal.colegioId !== colegioId || existingComensal.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Comensal no encontrado o ya vinculado' },
        { status: 404 }
      )
    }

    // 3. UPDATE Comensal
    const updated = await db.comensal.update({
      where: { id: comensalId },
      data: {
        apoderadoId: userId,
        vinculo,
        version: { increment: 1 },
      },
    })
    
    finalComensalId = updated.id
  } else {
    // PATH B — comensalId NO viene (crear nuevo, flujo actual)
    
    // Resolver categoriaPrecioId: si no viene, usar la default del colegio
    let resolvedCategoriaPrecioId = categoriaPrecioId
    if (!resolvedCategoriaPrecioId) {
      const defaultCategoria = await db.categoriaPrecio.findFirst({
        where: {
          tenantId,
          colegioId,
          esDefault: true,
          isActive: true,
          deletedAt: null,
        },
        select: { id: true },
      })
      resolvedCategoriaPrecioId = defaultCategoria?.id ?? undefined
    }

    const newComensal = await db.comensal.create({
      data: {
        tenantId,
        colegioId,
        apoderadoId: userId,
        nombre: nombre!,
        apellido: apellido!,
        curso: curso!,
        nivel: nivel ?? null,
        vinculo,
        categoriaPrecioId: resolvedCategoriaPrecioId ?? null,
      },
    })
    
    finalComensalId = newComensal.id
  }

  return NextResponse.json({
    success: true,
    data: {
      comensalId: finalComensalId,
      tenantId,
    },
  })
}
