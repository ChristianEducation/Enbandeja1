// ═══════════════════════════════════════════════════════════════════
// /owner/usuarios — Gestión de usuarios internos (Server Component)
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { UsuariosClient } from "./components/UsuariosClient"

export const dynamic = "force-dynamic"

export interface UsuarioInterno {
  id: string
  nombre: string | null
  email: string
  role: string
  colegioNombre: string | null
  isActive: boolean
}

export interface InvitacionItem {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
  colegioNombre: string | null
}

export default async function UsuariosPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const db = createTenantClient(session.activeTenantId, session.user.id)

  // Usuarios del tenant
  const userTenants = await db.userTenant.findMany({
    where: { tenantId: session.activeTenantId, deletedAt: null },
    include: {
      User: { select: { name: true, email: true, isActive: true } },
      Colegio: { select: { nombre: true } },
    },
    orderBy: { role: "asc" },
  })

  const usuarios: UsuarioInterno[] = userTenants.map((ut: any) => ({
    id: ut.id,
    nombre: ut.User?.name,
    email: ut.User?.email || "",
    role: ut.role,
    colegioNombre: ut.Colegio?.nombre || null,
    isActive: ut.isActive,
  }))

  // Invitaciones pendientes
  const invitacionesRaw = await db.invitation.findMany({
    where: { tenantId: session.activeTenantId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const invitaciones: InvitacionItem[] = invitacionesRaw.map((inv: any) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    expiresAt: inv.expiresAt instanceof Date ? inv.expiresAt.toISOString() : String(inv.expiresAt),
    colegioNombre: null,
  }))

  // Colegios para selector en invitación
  const colegios = await db.colegio.findMany({
    where: { tenantId: session.activeTenantId, isActive: true, deletedAt: null },
    select: { id: true, nombre: true },
  })

  return (
    <UsuariosClient
      usuarios={usuarios}
      invitaciones={invitaciones}
      colegios={colegios}
    />
  )
}
