import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { MenuSetupClient } from "./components/MenuSetupClient"

export const dynamic = "force-dynamic"

export default async function MenuSetupPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const progress = await prisma.onboardingProgress.findUnique({
    where: { tenantId: session.activeTenantId },
  })
  if (!progress?.categoriasPrecios) redirect("/setup/categorias")

  const menus = await prisma.menu.findMany({
    where: { tenantId: session.activeTenantId },
    take: 1,
  })

  return <MenuSetupClient tieneMenu={menus.length > 0} completado={!!progress.primerMenuPublicado} />
}
