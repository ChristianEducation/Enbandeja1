// ═══════════════════════════════════════════════════════════════════
// /setup/empresa — Paso 1: Datos de la empresa
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { EmpresaSetupClient } from "./components/EmpresaSetupClient"

export const dynamic = "force-dynamic"

export default async function EmpresaSetupPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.activeTenantId },
    select: { name: true, rut: true, email: true, phone: true },
  })

  const progress = await prisma.onboardingProgress.findUnique({
    where: { tenantId: session.activeTenantId },
  })

  // Si ya completó este paso, redirigir al siguiente
  if (progress?.datosEmpresa) {
    redirect("/setup/colegio")
  }

  return <EmpresaSetupClient tenant={tenant} />
}
