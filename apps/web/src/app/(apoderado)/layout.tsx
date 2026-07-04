// ═══════════════════════════════════════════════════════════════════
// Layout del apoderado — Server Component
// ═══════════════════════════════════════════════════════════════════
// Valida sesión + rol APODERADO en el tenant activo
// Children en main con padding-bottom 96px (para bottom nav)
// BottomNav al final (Client Component)
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { BottomNav } from "@/components/BottomNav"
import { NotificationBadge } from "@/components/NotificationBadge"

export default async function ApoderadoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar sesión
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (!session.activeTenantId) redirect("/onboarding/codigo")

  // Verificar rol APODERADO en el tenant activo
  // Usamos prisma global (no createTenantClient) porque solo verificamos
  // pertenencia, no leemos datos de negocio del tenant
  const userTenant = await prisma.userTenant.findFirst({
    where: {
      userId: session.user.id,
      tenantId: session.activeTenantId,
      role: "APODERADO",
      isActive: true,
      deletedAt: null,
    },
  })

  if (!userTenant) {
    // No es apoderado en este tenant — redirigir
    redirect("/login")
  }

  return (
    <>
      {/* Top bar con badge de notificaciones */}
      <div className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center justify-end px-5 bg-background/80">
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-surface-glass transition-colors"
          aria-label="Notificaciones"
        >
          <NotificationBadge />
        </button>
      </div>
      <main className="pt-12 pb-24">{children}</main>
      <BottomNav />
    </>
  )
}
