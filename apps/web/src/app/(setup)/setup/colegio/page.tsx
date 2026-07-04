import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { ColegioSetupClient } from "./components/ColegioSetupClient"

export const dynamic = "force-dynamic"

export default async function ColegioSetupPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const progress = await prisma.onboardingProgress.findUnique({
    where: { tenantId: session.activeTenantId },
  })
  if (!progress?.datosEmpresa) redirect("/setup/empresa")
  if (progress.primerColegio) redirect("/setup/pasarela")

  // Si ya tiene colegio, mostrarlo
  const colegio = await prisma.colegio.findFirst({
    where: { tenantId: session.activeTenantId, deletedAt: null },
    select: { id: true, nombre: true, codigoCasino: true },
  })

  return <ColegioSetupClient colegioExistente={colegio} />
}
