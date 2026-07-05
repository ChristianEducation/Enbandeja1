// ═══════════════════════════════════════════════════════════════════
// /cocina — Vista de cocina (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Lista de pedidos del día agrupados por opción de menú
// Solo lectura — rol COCINA no puede escribir nada
// Tipografía 50% más grande para lectura a 3 metros
// Actualización vía Supabase Realtime filtrado por tenantId
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { toZonedTime } from "date-fns-tz"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CocinaClient } from "./components/CocinaClient"

export const dynamic = "force-dynamic"

export interface OpcionPreparar {
  nombre: string
  cantidadTotal: number
  cantidadRetirada: number
  cantidadPendiente: number
}

export interface PedidoCocina {
  id: string
  comensal: string
  curso: string | null
  items: { nombre: string; cantidad: number; retirado: boolean }[]
  estado: string
  createdAt: string
}

export default async function CocinaPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) {
    redirect("/login")
  }

  const tenantId = session.activeTenantId
  const userId = session.user.id
  const db = createTenantClient(tenantId, userId)

  // Obtener timezone
  const tenant = await db.tenant.findFirst({
    where: { id: tenantId },
    select: { timezone: true, name: true },
  })
  const timezone = tenant?.timezone || "America/Santiago"
  const tenantName = tenant?.name || ""

  const ahoraLocal = toZonedTime(new Date(), timezone)
  const hoyStr = format(ahoraLocal, "yyyy-MM-dd")
  const hoyDisplay = format(ahoraLocal, "EEEE d 'de' MMMM", { locale: es })

  // Query pedidos del día
  const pedidosRaw = await db.pedido.findMany({
    where: {
      tenantId,
      estado: { in: ["PAGADO", "RETIRADO", "NO_RETIRADO"] },
      Items: {
        some: {
          fecha: {
            gte: new Date(`${hoyStr}T00:00:00`),
            lt: new Date(`${hoyStr}T23:59:59.999`),
          },
        },
      },
    },
    include: {
      Items: {
        include: {
          Comensal: {
            select: { nombre: true, apellido: true, curso: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Agrupar por opción de menú (para "qué preparar")
  const opcionesMap: Record<string, OpcionPreparar> = {}
  for (const p of pedidosRaw) {
    for (const item of p.Items) {
      if (item.cancelado) continue
      const key = item.nombre
      if (!opcionesMap[key]) {
        opcionesMap[key] = { nombre: key, cantidadTotal: 0, cantidadRetirada: 0, cantidadPendiente: 0 }
      }
      opcionesMap[key].cantidadTotal += item.cantidad
      if (item.retirado) {
        opcionesMap[key].cantidadRetirada += item.cantidad
      } else {
        opcionesMap[key].cantidadPendiente += item.cantidad
      }
    }
  }
  const opcionesPreparar: OpcionPreparar[] = Object.values(opcionesMap).sort(
    (a, b) => b.cantidadPendiente - a.cantidadPendiente
  )

  // Serializar pedidos
  const pedidos: PedidoCocina[] = pedidosRaw.map((p) => {
    const primerItem = p.Items.find((i: any) => !i.cancelado)
    const comensal = primerItem?.Comensal || p.Items[0]?.Comensal || { nombre: "Sin", apellido: "comensal", curso: null }

    return {
      id: p.id,
      comensal: `${comensal.nombre} ${comensal.apellido}`,
      curso: comensal.curso,
      items: p.Items
        .filter((i: any) => !i.cancelado)
        .map((i: any) => ({ nombre: i.nombre, cantidad: i.cantidad, retirado: i.retirado })),
      estado: p.estado,
      createdAt: p.createdAt.toISOString(),
    }
  })

  return (
    <CocinaClient
      opcionesPreparar={opcionesPreparar}
      pedidos={pedidos}
      hoyDisplay={hoyDisplay}
      tenantName={tenantName}
      tenantId={tenantId}
    />
  )
}
