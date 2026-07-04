import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { PasarelaSetupClient } from "./components/PasarelaSetupClient"

export const dynamic = "force-dynamic"

export default async function PasarelaSetupPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const progress = await prisma.onboardingProgress.findUnique({
    where: { tenantId: session.activeTenantId },
  })
  if (!progress?.primerColegio) redirect("/setup/colegio")
  if (progress.conectoMercadoPago) redirect("/setup/comensales")

  // Verificar si ya tiene configuración de MercadoPago
  const mpConfig = await prisma.paymentProviderConfig.findFirst({
    where: { tenantId: session.activeTenantId, provider: "MERCADOPAGO", isActive: true },
  })

  return <PasarelaSetupClient yaConectado={!!mpConfig} />
}
