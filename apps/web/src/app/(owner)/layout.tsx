// ═══════════════════════════════════════════════════════════════════
// Layout del owner — Server Component
// ═══════════════════════════════════════════════════════════════════
// Valida sesión + rol OWNER en el tenant activo
// Sidebar 240px Liquid Glass en desktop, bottom nav en mobile
// Separado de /operador — Owner administra, operador opera
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { OwnerSidebar } from "./components/OwnerSidebar"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (!session.activeTenantId) redirect("/onboarding/codigo")

  // Verificar rol OWNER en el tenant activo
  const userTenant = await prisma.userTenant.findFirst({
    where: {
      userId: session.user.id,
      tenantId: session.activeTenantId,
      role: "OWNER",
      isActive: true,
      deletedAt: null,
    },
  })

  if (!userTenant) {
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
    if (anyTenant?.role === "COCINA") redirect("/cocina")
    if (anyTenant?.role === "APODERADO") redirect("/home")
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <OwnerSidebar />
      <main className="flex-1 md:ml-[240px] pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
