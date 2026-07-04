// ═══════════════════════════════════════════════════════════════════
// Layout de cocina — Server Component
// ═══════════════════════════════════════════════════════════════════
// Valida sesión + rol COCINA en el tenant activo
// Solo lectura — sin acciones de escritura
// Full-screen para lectura a 3 metros
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"

export default async function CocinaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (!session.activeTenantId) redirect("/onboarding/codigo")

  // Verificar rol COCINA en el tenant activo
  const userTenant = await prisma.userTenant.findFirst({
    where: {
      userId: session.user.id,
      tenantId: session.activeTenantId,
      role: "COCINA",
      isActive: true,
      deletedAt: null,
    },
  })

  if (!userTenant) {
    // Redirigir según su rol
    const anyTenant = await prisma.userTenant.findFirst({
      where: {
        userId: session.user.id,
        tenantId: session.activeTenantId,
        isActive: true,
        deletedAt: null,
      },
      select: { role: true },
    })
    if (anyTenant?.role === "OPERADOR") redirect("/operador/dia")
    if (anyTenant?.role === "APODERADO") redirect("/home")
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
