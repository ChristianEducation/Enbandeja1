// ═══════════════════════════════════════════════════════════════════
// /resumen — Resumen del pedido antes de confirmar y pagar
// ═══════════════════════════════════════════════════════════════════
// Server Component que muestra el desglose del pedido.
// Recibe datos del pedido pendiente vía searchParams (pedidoId).
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { ResumenPedidoClient } from "./components/ResumenPedidoClient"

export default async function ResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ pedidoId?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (!session.activeTenantId) redirect("/onboarding/codigo")

  const params = await searchParams
  const pedidoId = params.pedidoId

  if (!pedidoId) {
    redirect("/home")
  }

  const db = createTenantClient(session.activeTenantId, session.user.id)

  // Buscar el pedido pendiente
  const pedido = await db.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      Items: {
        select: {
          id: true,
          nombre: true,
          precio: true,
          cantidad: true,
          subtotal: true,
          tipo: true,
          comensalId: true,
          Comensal: {
            select: { nombre: true, apellido: true },
          },
        },
      },
    },
  })

  if (!pedido || pedido.apoderadoId !== session.user.id) {
    redirect("/home")
  }

  // Preparar datos serializables
  const items = pedido.Items.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    precio: item.precio,
    cantidad: item.cantidad,
    subtotal: item.subtotal,
    tipo: item.tipo,
    comensal: `${item.Comensal.nombre} ${item.Comensal.apellido}`,
  }))

  return (
    <ResumenPedidoClient
      pedidoId={pedido.id}
      orderId={pedido.orderId}
      total={pedido.total}
      creditoAplicado={pedido.creditoAplicado}
      totalPagado={pedido.totalPagado}
      items={items}
      estado={pedido.estado}
    />
  )
}
