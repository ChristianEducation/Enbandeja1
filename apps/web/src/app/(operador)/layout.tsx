// ═══════════════════════════════════════════════════════════════════
// Layout del operador — Server Component
// ═══════════════════════════════════════════════════════════════════
// Valida sesión + rol OPERADOR/OWNER en el tenant activo
// Sidebar lateral en desktop, bottom-nav en mobile
// Tablet-first (el operador usa tablet)
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { OperadorSidebar } from "./components/OperadorSidebar"

export default async function OperadorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (!session.activeTenantId) redirect("/onboarding/codigo")

  // Verificar rol OPERADOR u OWNER en el tenant activo
  const userTenant = await prisma.userTenant.findFirst({
    where: {
      userId: session.user.id,
      tenantId: session.activeTenantId,
      role: { in: ["OPERADOR", "OWNER"] },
      isActive: true,
      deletedAt: null,
    },
  })

  if (!userTenant) {
    // No es operador — redirigir según su rol
    const anyTenant = await prisma.userTenant.findFirst({
      where: {
        userId: session.user.id,
        tenantId: session.activeTenantId,
        isActive: true,
        deletedAt: null,
      },
      select: { role: true },
    })
    if (anyTenant?.role === "APODERADO") redirect("/home")
    if (anyTenant?.role === "COCINA") redirect("/cocina")
    if (anyTenant?.role === "OWNER") redirect("/operador/menu")
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop/tablet */}
      <OperadorSidebar />
      {/* Main content */}
      <main className="flex-1 md:ml-[240px] pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
