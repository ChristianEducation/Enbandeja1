// ═══════════════════════════════════════════════════════════════════
// Layout Super Admin — Server Component
// ═══════════════════════════════════════════════════════════════════
// Valida que el usuario autenticado es Super Admin activo.
// Sidebar propio separado de los layouts de tenant.
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { SuperAdminSidebar } from "./components/SuperAdminSidebar"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id || !session.user.email) {
    redirect("/login")
  }

  const superAdmin = await prisma.superAdmin.findFirst({
    where: {
      email: session.user.email,
      isActive: true,
      deletedAt: null,
    },
  })

  if (!superAdmin) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SuperAdminSidebar />
      <main className="flex-1 md:ml-[240px] pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
