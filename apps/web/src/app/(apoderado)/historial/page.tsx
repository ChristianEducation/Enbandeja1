// ═══════════════════════════════════════════════════════════════════
// /historial — Historial de pedidos del apoderado (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Query de pedidos del apoderado con items, ordenados desc por createdAt.
// Respeta RLS: apoderado solo ve sus pedidos.
// Fechas con toZonedTime del tenant.
// Incluye datos de cancelación por item + hora de corte del colegio.
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { toZonedTime } from "date-fns-tz"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { puedeCancelar } from "@/lib/pedidos/validar-hora-corte"
import { HistorialClient } from "./components/HistorialClient"

export const dynamic = "force-dynamic"

export interface PedidoHistorial {
  id: string
  orderId: string
  estado: string
  total: number
  creditoAplicado: number
  totalPagado: number
  createdAt: string
  fechaFormateada: string
  items: {
    id: string
    nombre: string
    cantidad: number
    subtotal: number
    cancelado: boolean
    creditoGenerado: number
    fecha: string
    puedeCancelar: boolean
    razonNoCancelar?: string
    comensal: string
  }[]
}

export interface ComensalHistorial {
  id: string
  nombre: string
  apellido: string
  curso: string | null
}

export default async function HistorialPage() {
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

  // Query pedidos del apoderado
  const pedidos = await db.pedido.findMany({
    where: { tenantId, apoderadoId: userId },
    include: {
      Items: {
        include: {
          Comensal: {
            select: { nombre: true, apellido: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Obtener todos los colegios del tenant con horaCorte (cache batch)
  const colegios = await db.colegio.findMany({
    where: { tenantId, isActive: true, deletedAt: null },
    select: { id: true, horaCorte: true },
  })
  const colegioMap = new Map(colegios.map((c) => [c.id, c.horaCorte]))

  // Obtener comensales con su colegio para mapeo
  const comensalesRaw = await db.comensal.findMany({
    where: { tenantId, deletedAt: null },
    select: { id: true, colegioId: true },
  })
  const comensalColegioMap = new Map(comensalesRaw.map((c) => [c.id, c.colegioId]))

  // Serializar pedidos para el Client Component
  const pedidosSerializados: PedidoHistorial[] = pedidos.map((p) => {
    const fechaZoned = toZonedTime(p.createdAt, timezone)
    return {
      id: p.id,
      orderId: p.orderId,
      estado: p.estado,
      total: p.total,
      creditoAplicado: p.creditoAplicado,
      totalPagado: p.totalPagado,
      createdAt: p.createdAt.toISOString(),
      fechaFormateada: format(fechaZoned, "EEEE d 'de' MMMM, HH:mm", { locale: es }),
      items: p.Items.map((item) => {
        // Resolver hora de corte real desde el colegio del comensal
        const colegioId = item.comensalId ? comensalColegioMap.get(item.comensalId) : undefined
        const horaCorte = colegioId ? (colegioMap.get(colegioId) || "09:00") : "09:00"
        // Nota: la hora de corte se resuelve del colegio del comensal.
        // En el server component no podemos hacer lookup por item sin otra query,
        // así que pasamos la fecha y dejamos que el cliente haga la validación
        // llamando al endpoint. Aquí marcamos como "potencialmente cancelable"
        // si el pedido está PAGADO y el item no está cancelado.
        const esCancelableBase = p.estado === "PAGADO" && !item.cancelado

        // Validación server-side de hora de corte
        let puedeCancelarItem = false
        let razonNoCancelar: string | undefined

        if (esCancelableBase) {
          const validacion = puedeCancelar(item.fecha, horaCorte, timezone)
          puedeCancelarItem = validacion.puede
          razonNoCancelar = validacion.razon
        }

        return {
          id: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          subtotal: item.subtotal,
          cancelado: item.cancelado,
          creditoGenerado: item.creditoGenerado,
          fecha: item.fecha instanceof Date ? item.fecha.toISOString() : String(item.fecha),
          puedeCancelar: puedeCancelarItem,
          razonNoCancelar,
          comensal: `${item.Comensal.nombre} ${item.Comensal.apellido}`,
        }
      }),
    }
  })

  // Query comensales del apoderado para filtro
  const comensales = await db.comensal.findMany({
    where: { tenantId, apoderadoId: userId, deletedAt: null },
    select: { id: true, nombre: true, apellido: true, curso: true },
  })

  return (
    <HistorialClient pedidos={pedidosSerializados} comensales={comensales} />
  )
}
