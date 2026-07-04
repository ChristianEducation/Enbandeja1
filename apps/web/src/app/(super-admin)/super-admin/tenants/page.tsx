// ═══════════════════════════════════════════════════════════════════
// /super-admin/tenants — Lista de tenants para gestión de billing
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { TenantsListClient } from "./components/TenantsListClient"

export const dynamic = "force-dynamic"

export default async function TenantsPage() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) redirect("/login")

  const superAdmin = await prisma.superAdmin.findFirst({
    where: { email: session.user.email, isActive: true, deletedAt: null },
  })
  if (!superAdmin) redirect("/login")

  const tenants = await prisma.tenant.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      status: true,
      createdAt: true,
      Suscripcion: {
        select: {
          estado: true,
          tipo: true,
          periodoFin: true,
          Plan: { select: { nombre: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <TenantsListClient
      tenants={tenants.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        email: t.email,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        suscripcion: t.Suscripcion
          ? {
              estado: t.Suscripcion.estado,
              tipo: t.Suscripcion.tipo,
              periodoFin: t.Suscripcion.periodoFin.toISOString(),
              planNombre: t.Suscripcion.Plan.nombre,
            }
          : null,
      }))}
    />
  )
}
