// ═══════════════════════════════════════════════════════════════════
// /operador/menu/nuevo — Crear menú del día (Server Component)
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { NuevoMenuClient } from "./components/NuevoMenuClient"

export const dynamic = "force-dynamic"

export default async function NuevoMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) {
    redirect("/login")
  }

  const tenantId = session.activeTenantId
  const userId = session.user.id
  const db = createTenantClient(tenantId, userId)

  const params = await searchParams
  const fechaPreseleccionada = params.fecha || ""

  // Colegios del tenant
  const colegios = await db.colegio.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, nombre: true },
  })

  // Categorías de precio del primer colegio
  const primerColegio = colegios[0]
  const categorias = primerColegio
    ? await db.categoriaPrecio.findMany({
        where: { colegioId: primerColegio.id, isActive: true, deletedAt: null },
        select: { id: true, nombre: true, esDefault: true },
        orderBy: { orden: "asc" },
      })
    : []

  return (
    <NuevoMenuClient
      colegios={colegios}
      categorias={categorias}
      fechaPreseleccionada={fechaPreseleccionada}
    />
  )
}
