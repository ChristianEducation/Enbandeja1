import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { CategoriasSetupClient } from "./components/CategoriasSetupClient"

export const dynamic = "force-dynamic"

export default async function CategoriasSetupPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const progress = await prisma.onboardingProgress.findUnique({
    where: { tenantId: session.activeTenantId },
  })
  if (!progress?.comensalesCargados) redirect("/setup/comensales")
  if (progress.categoriasPrecios) redirect("/setup/menu")

  const colegios = await prisma.colegio.findMany({
    where: { tenantId: session.activeTenantId, isActive: true, deletedAt: null },
    select: { id: true, nombre: true, CategoriasPrecio: { where: { deletedAt: null } } },
  })

  return <CategoriasSetupClient colegios={colegios} />
}
