// ═══════════════════════════════════════════════════════════════════
// /operador/menu — Calendario de menús del operador (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Query menús del mes actual + siguiente
// Pasa datos al Client Component con calendario
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { toZonedTime } from "date-fns-tz"
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns"
import { MenuCalendarioClient } from "./components/MenuCalendarioClient"

export const dynamic = "force-dynamic"

export interface MenuCalendario {
  id: string
  fecha: string // ISO date
  estado: string
  opcionesCount: number
}

export default async function MenuPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) {
    redirect("/login")
  }

  const tenantId = session.activeTenantId
  const userId = session.user.id
  const db = createTenantClient(tenantId, userId)

  // Obtener timezone del tenant
  const tenant = await db.tenant.findFirst({
    where: { id: tenantId },
    select: { timezone: true },
  })
  const timezone = tenant?.timezone || "America/Santiago"

  const ahoraLocal = toZonedTime(new Date(), timezone)
  const inicioMes = startOfMonth(ahoraLocal)
  const finMesSiguiente = endOfMonth(addMonths(ahoraLocal, 1))

  // Query menús del mes actual y siguiente
  const menusRaw = await db.menu.findMany({
    where: {
      tenantId,
      fecha: {
        gte: inicioMes,
        lte: finMesSiguiente,
      },
    },
    include: {
      Opciones: { select: { id: true } },
    },
    orderBy: { fecha: "asc" },
  })

  const menus: MenuCalendario[] = menusRaw.map((m) => ({
    id: m.id,
    fecha: m.fecha instanceof Date ? format(m.fecha, "yyyy-MM-dd") : String(m.fecha),
    estado: m.estado,
    opcionesCount: m.Opciones.length,
  }))

  // Colegios del tenant para selector
  const colegios = await db.colegio.findMany({
    where: { tenantId, isActive: true, deletedAt: null },
    select: { id: true, nombre: true },
  })

  return (
    <MenuCalendarioClient
      menus={menus}
      colegios={colegios}
      timezone={timezone}
    />
  )
}
