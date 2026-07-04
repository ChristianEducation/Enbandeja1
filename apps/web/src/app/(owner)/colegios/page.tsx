// ═══════════════════════════════════════════════════════════════════
// /owner/colegios — Gestión de colegios del tenant (Server Component)
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient, prisma } from "@enbandeja/database"
import { ColegiosClient } from "./components/ColegiosClient"

export const dynamic = "force-dynamic"

export default async function ColegiosPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const db = createTenantClient(session.activeTenantId, session.user.id)

  const colegios = await db.colegio.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      nombre: true,
      codigoCasino: true,
      direccion: true,
      horaCorte: true,
      kioscoActivo: true,
      isActive: true,
    },
    orderBy: { nombre: "asc" },
  })

  // Límite del plan
  const suscripcion = await prisma.suscripcion.findFirst({
    where: { tenantId: session.activeTenantId },
    select: {
      Plan: { select: { maxColegios: true, nombre: true } },
    },
  })

  const maxColegios = suscripcion?.Plan?.maxColegios ?? null
  const colegiosActivos = colegios.filter((c: any) => c.isActive).length

  return (
    <ColegiosClient
      colegios={colegios}
      colegiosActivos={colegiosActivos}
      maxColegios={maxColegios}
      planNombre={suscripcion?.Plan?.nombre || "Sin plan"}
    />
  )
}
