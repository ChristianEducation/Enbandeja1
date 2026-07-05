// ═══════════════════════════════════════════════════════════════════
// /operador/dia — Dashboard del día del operador (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Query pedidos del día con items, comensales, colegio.
// Usa timezone del tenant para definir "hoy".
// Pasa datos serializados al Client Component.
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { formatCLP } from "@enbandeja/shared"
import { toZonedTime } from "date-fns-tz"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DashboardOperadorClient } from "./components/DashboardOperadorClient"

export const dynamic = "force-dynamic"

export interface PedidoDia {
  id: string
  orderId: string
  estado: string
  total: number
  creditoAplicado: number
  totalPagado: number
  createdAt: string
  comensal: {
    id: string
    nombre: string
    apellido: string
    curso: string | null
  }
  items: {
    id: string
    nombre: string
    cantidad: number
    subtotal: number
    tipo: string
    cancelado: boolean
    retirado: boolean
  }[]
}

export interface ResumenOpcion {
  nombre: string
  cantidad: number
  total: number
}

export default async function DiaPage() {
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

  // Obtener colegios del tenant para selector de cierre
  const colegios = await db.colegio.findMany({
    where: { tenantId, isActive: true, deletedAt: null },
    select: { id: true, nombre: true },
  })

  // Calcular "hoy" en timezone del tenant
  const ahoraLocal = toZonedTime(new Date(), timezone)
  const hoyStr = format(ahoraLocal, "yyyy-MM-dd")
  const hoyDisplay = format(ahoraLocal, "EEEE d 'de' MMMM, yyyy", { locale: es })

  // Query pedidos del día (PAGADO, CANCELADO, RETIRADO, NO_RETIRADO)
  const pedidosRaw = await db.pedido.findMany({
    where: {
      tenantId,
      estado: { in: ["PAGADO", "CANCELADO", "RETIRADO", "NO_RETIRADO"] },
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
            select: { id: true, nombre: true, apellido: true, curso: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Serializar pedidos
  const pedidos: PedidoDia[] = pedidosRaw.map((p) => {
    // Tomar comensal del primer item no cancelado
    const itemActivo = p.Items.find((i) => !i.cancelado)
    const comensal = itemActivo?.Comensal || p.Items[0]?.Comensal || {
      id: "",
      nombre: "Sin",
      apellido: "comensal",
      curso: null,
    }

    return {
      id: p.id,
      orderId: p.orderId,
      estado: p.estado,
      total: p.total,
      creditoAplicado: p.creditoAplicado,
      totalPagado: p.totalPagado,
      createdAt: p.createdAt.toISOString(),
      comensal: {
        id: comensal.id,
        nombre: comensal.nombre,
        apellido: comensal.apellido,
        curso: comensal.curso,
      },
      items: p.Items.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        subtotal: item.subtotal,
        tipo: item.tipo,
        cancelado: item.cancelado,
        retirado: item.retirado,
      })),
    }
  })

  // Resumen por opción de menú (no cancelados)
  const opcionesMap: Record<string, { nombre: string; cantidad: number; total: number }> = {}
  for (const p of pedidosRaw) {
    for (const item of p.Items) {
      if (item.cancelado) continue
      const key = item.nombre
      if (!opcionesMap[key]) {
        opcionesMap[key] = { nombre: key, cantidad: 0, total: 0 }
      }
      opcionesMap[key].cantidad += item.cantidad
      opcionesMap[key].total += item.subtotal
    }
  }
  const resumenOpciones: ResumenOpcion[] = Object.values(opcionesMap).sort(
    (a, b) => b.cantidad - a.cantidad
  )

  // Totales generales
  const totalPedidos = pedidos.filter((p) => p.estado !== "CANCELADO").length
  const totalMonto = pedidosRaw.reduce((acc, p) => {
    if (p.estado === "CANCELADO") return acc
    return acc + p.total
  }, 0)
  const totalRetirados = pedidos.filter((p) => p.estado === "RETIRADO").length
  const totalPendientes = pedidos.filter(
    (p) => p.estado === "PAGADO" || p.estado === "NO_RETIRADO"
  ).length

  return (
    <DashboardOperadorClient
      pedidos={pedidos}
      colegios={colegios.map((c) => ({ id: c.id, nombre: c.nombre }))}
      resumenOpciones={resumenOpciones}
      hoyDisplay={hoyDisplay}
      totalPedidos={totalPedidos}
      totalMonto={totalMonto}
      totalRetirados={totalRetirados}
      totalPendientes={totalPendientes}
    />
  )
}
