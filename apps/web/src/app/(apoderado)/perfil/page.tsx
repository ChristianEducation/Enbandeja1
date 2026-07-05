// ═══════════════════════════════════════════════════════════════════
// /perfil — Perfil del apoderado (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Query: user, comensales, creditoApoderado
// Pasa a PerfilClient
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient, prisma } from "@enbandeja/database"
import { PerfilClient } from "./components/PerfilClient"

export const dynamic = "force-dynamic"

export interface ComensalPerfil {
  id: string
  nombre: string
  apellido: string
  curso: string | null
  avatarUrl: string | null
}

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) {
    redirect("/login")
  }

  const tenantId = session.activeTenantId
  const userId = session.user.id
  const db = createTenantClient(tenantId, userId)

  // Datos del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  // Comensales del apoderado
  const comensalesRaw = await db.comensal.findMany({
    where: { tenantId, apoderadoId: userId, deletedAt: null },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      curso: true,
      avatarUrl: true,
    },
    orderBy: { nombre: "asc" },
  })

  // Crédito del apoderado
  const credito = await db.creditoApoderado.findFirst({
    where: { tenantId, apoderadoId: userId },
    select: { monto: true },
  })

  // Colegio del primer comensal (para FormComensal en drawer)
  const primerComensal = comensalesRaw[0]
  let colegioId = ""
  let colegioNombre = ""
  if (primerComensal) {
    const comensalConColegio = await db.comensal.findUnique({
      where: { id: primerComensal.id },
      select: { Colegio: { select: { id: true, nombre: true } } },
    })
    colegioId = comensalConColegio?.Colegio?.id || ""
    colegioNombre = comensalConColegio?.Colegio?.nombre || ""
  }

  const comensales: ComensalPerfil[] = comensalesRaw.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    apellido: c.apellido,
    curso: c.curso,
    avatarUrl: c.avatarUrl,
  }))

  return (
    <PerfilClient
      user={{
        id: user?.id || userId,
        name: user?.name || "",
        email: user?.email || "",
        image: user?.image || null,
      }}
      comensales={comensales}
      creditoDisponible={credito?.monto || 0}
      colegioId={colegioId}
      colegioNombre={colegioNombre}
    />
  )
}
