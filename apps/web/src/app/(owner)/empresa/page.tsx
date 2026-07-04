// ═══════════════════════════════════════════════════════════════════
// /owner/empresa — Gestión de datos del tenant (Server Component)
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { EmpresaClient } from "./components/EmpresaClient"

export const dynamic = "force-dynamic"

export default async function EmpresaPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const db = createTenantClient(session.activeTenantId, session.user.id)

  const tenant = await db.tenant.findFirst({
    where: { id: session.activeTenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      rut: true,
      email: true,
      phone: true,
      timezone: true,
      status: true,
    },
  })

  const suscripcion = await db.suscripcion.findFirst({
    where: { tenantId: session.activeTenantId },
    select: {
      id: true,
      estado: true,
      tipo: true,
      periodoInicio: true,
      periodoFin: true,
      Plan: { select: { nombre: true, tipo: true, maxColegios: true } },
    },
  })

  // Serializar fechas de Prisma (Date) a string para el Client Component
  const suscripcionSerializada = suscripcion
    ? {
        ...suscripcion,
        periodoInicio: suscripcion.periodoInicio.toISOString(),
        periodoFin: suscripcion.periodoFin.toISOString(),
      }
    : null

  return (
    <EmpresaClient
      tenant={tenant || null}
      suscripcion={suscripcionSerializada}
    />
  )
}
