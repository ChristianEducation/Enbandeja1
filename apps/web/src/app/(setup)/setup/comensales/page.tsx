import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { ComensalesSetupClient } from "./components/ComensalesSetupClient"

export const dynamic = "force-dynamic"

export default async function ComensalesSetupPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const progress = await prisma.onboardingProgress.findUnique({
    where: { tenantId: session.activeTenantId },
  })
  if (!progress?.conectoMercadoPago) redirect("/setup/pasarela")
  if (progress.comensalesCargados) redirect("/setup/categorias")

  const colegios = await prisma.colegio.findMany({
    where: { tenantId: session.activeTenantId, isActive: true, deletedAt: null },
    select: { id: true, nombre: true },
  })

  const comensalesCount = await prisma.comensal.count({
    where: { tenantId: session.activeTenantId },
  })

  return <ComensalesSetupClient colegios={colegios} comensalesCount={comensalesCount} />
}
