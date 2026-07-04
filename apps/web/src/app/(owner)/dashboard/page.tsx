// ═══════════════════════════════════════════════════════════════════
// /owner/dashboard — Dashboard del Owner con KpiSnapshot (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Obtiene datos de KpiSnapshot y los pasa al Client Component.
// Permite drill-down a colegio específico vía query param.
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { toZonedTime } from "date-fns-tz"
import { subDays, format, startOfDay } from "date-fns"
import { DashboardClient } from "./components/DashboardClient"

function fechaToISO(d: Date): string {
  return d.toISOString().split("T")[0] || d.toISOString().slice(0, 10)
}

export const dynamic = "force-dynamic"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ colegioId?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const params = await searchParams
  const colegioIdFilter = params.colegioId

  // Obtener timezone del tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.activeTenantId },
    select: { timezone: true },
  })
  const timezone = tenant?.timezone || "America/Santiago"

  // Calcular rango: últimos 30 días en fecha local del tenant
  const ahoraLocal = toZonedTime(new Date(), timezone)
  const hasta = format(ahoraLocal, "yyyy-MM-dd")
  const desde = format(subDays(ahoraLocal, 30), "yyyy-MM-dd")

  const desdeDate = new Date(desde + "T12:00:00Z")
  const hastaDate = new Date(hasta + "T12:00:00Z")

  // Obtener colegios del tenant
  const colegios = await prisma.colegio.findMany({
    where: {
      tenantId: session.activeTenantId,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  })

  // Obtener snapshots según filtro
  if (colegioIdFilter) {
    const snapshots = await prisma.kpiSnapshot.findMany({
      where: {
        tenantId: session.activeTenantId,
        colegioId: colegioIdFilter,
        fecha: { gte: desdeDate, lte: hastaDate },
      },
      orderBy: { fecha: "asc" },
    })

    const colegio = colegios.find((c) => c.id === colegioIdFilter)

    return (
      <DashboardClient
        consolidado={null}
        snapshotsColegio={snapshots.map((s) => ({
          fecha: fechaToISO(s.fecha),
          totalPedidos: s.totalPedidos,
          totalPagados: s.totalPagados,
          totalCancelados: s.totalCancelados,
          totalExpirados: s.totalExpirados,
          totalRetirados: s.totalRetirados,
          totalNoRetirados: s.totalNoRetirados,
          totalIngresos: s.totalIngresos,
          totalCreditos: s.totalCreditos,
          ticketPromedio: s.ticketPromedio,
          distribucionOpciones: s.distribucionOpciones as Record<string, number>,
          distribucionKiosco: s.distribucionKiosco as Record<string, number>,
        }))}
        colegios={colegios}
        colegioSeleccionado={colegioIdFilter}
        colegioNombre={colegio?.nombre || ""}
        rangoDesde={desde}
        rangoHasta={hasta}
      />
    )
  }

  // Vista consolidada: todos los colegios
  const snapshots = await prisma.kpiSnapshot.findMany({
    where: {
      tenantId: session.activeTenantId,
      fecha: { gte: desdeDate, lte: hastaDate },
    },
    orderBy: { fecha: "asc" },
    include: {
      Colegio: { select: { nombre: true } },
    },
  })

  // Agrupar por fecha para consolidado
  const porFecha: Record<string, typeof snapshots> = {}
  for (const s of snapshots) {
    const key = fechaToISO(s.fecha)
    if (!porFecha[key]) porFecha[key] = []
    porFecha[key].push(s)
  }

  const consolidado = Object.entries(porFecha)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, snaps]) => ({
      fecha,
      totalPedidos: snaps.reduce((s, x) => s + x.totalPedidos, 0),
      totalPagados: snaps.reduce((s, x) => s + x.totalPagados, 0),
      totalCancelados: snaps.reduce((s, x) => s + x.totalCancelados, 0),
      totalExpirados: snaps.reduce((s, x) => s + x.totalExpirados, 0),
      totalRetirados: snaps.reduce((s, x) => s + x.totalRetirados, 0),
      totalNoRetirados: snaps.reduce((s, x) => s + x.totalNoRetirados, 0),
      totalIngresos: snaps.reduce((s, x) => s + x.totalIngresos, 0),
      totalCreditos: snaps.reduce((s, x) => s + x.totalCreditos, 0),
      ticketPromedio:
        snaps.reduce((s, x) => s + x.totalPagados, 0) > 0
          ? Math.round(
              snaps.reduce((s, x) => s + x.totalIngresos, 0) /
              snaps.reduce((s, x) => s + x.totalPagados, 0)
            )
          : 0,
      porColegio: snaps.map((s) => ({
        colegioId: s.colegioId,
        colegioNombre: s.Colegio.nombre,
        totalPedidos: s.totalPedidos,
        totalPagados: s.totalPagados,
        totalIngresos: s.totalIngresos,
        totalRetirados: s.totalRetirados,
        totalNoRetirados: s.totalNoRetirados,
        ticketPromedio: s.ticketPromedio,
      })),
    }))

  return (
    <DashboardClient
      consolidado={consolidado}
      snapshotsColegio={null}
      colegios={colegios}
      colegioSeleccionado={null}
      colegioNombre=""
      rangoDesde={desde}
      rangoHasta={hasta}
    />
  )
}
