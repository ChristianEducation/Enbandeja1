// ═══════════════════════════════════════════════════════════════════
// /confirmacion — Pantalla de confirmación post-pago (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Recibe pedidoId de searchParams (orderId del pedido).
// Query del pedido con items incluidos.
// Bento Card hero con ícono CheckCircle verde.
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { formatCLP } from "@enbandeja/shared"
import { toZonedTime } from "date-fns-tz"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { CheckCircle2, ChevronLeft, ClipboardList, Home } from "@enbandeja/ui/icons"

export const dynamic = "force-dynamic"

interface ConfirmacionPageProps {
  searchParams: Promise<{ pedidoId?: string }>
}

export default async function ConfirmacionPage({ searchParams }: ConfirmacionPageProps) {
  const params = await searchParams
  const pedidoId = params.pedidoId

  if (!pedidoId) {
    redirect("/home")
  }

  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) {
    redirect("/login")
  }

  const tenantId = session.activeTenantId
  const userId = session.user.id
  const db = createTenantClient(tenantId, userId)

  // Buscar pedido por orderId (no por UUID directo)
  const pedido = await db.pedido.findFirst({
    where: {
      orderId: pedidoId,
      apoderadoId: userId,
    },
    include: {
      Items: true,
    },
  })

  if (!pedido) {
    redirect("/home")
  }

  // Obtener timezone del tenant para formatear fechas
  const tenant = await db.tenant.findFirst({
    where: { id: tenantId },
    select: { timezone: true },
  })
  const timezone = tenant?.timezone || "America/Santiago"

  const fechaZoned = toZonedTime(pedido.createdAt, timezone)
  const fechaFormateada = format(fechaZoned, "EEEE d 'de' MMMM, HH:mm", { locale: es })

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <Link
          href="/home"
          className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
          <span className="font-display text-small font-medium">Volver</span>
        </Link>
      </div>

      {/* Hero confirmation card */}
      <div className="px-5 space-y-4">
        <div className="rounded-xl bg-surface-glass border border-border p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/16">
            <CheckCircle2 size={32} strokeWidth={1.5} className="text-success" />
          </div>
          <h1 className="font-display text-title font-bold text-foreground tracking-tight mb-1">
            ¡Pedido confirmado!
          </h1>
          <p className="font-sans text-body text-foreground-secondary">
            {fechaFormateada}
          </p>
        </div>

        {/* Lista de items */}
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <h2 className="font-display text-heading font-semibold text-foreground mb-4">
            Detalle del pedido
          </h2>
          <div className="space-y-3">
            {pedido.Items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-body text-foreground truncate">
                    {item.nombre}
                  </p>
                  <p className="font-sans text-small text-foreground-secondary">
                    {item.cantidad}x · {formatCLP(item.precio)} c/u
                  </p>
                </div>
                <p className="font-display text-body font-bold text-foreground ml-3">
                  {formatCLP(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-border mt-4 pt-4">
            {pedido.creditoAplicado > 0 && (
              <div className="flex justify-between mb-2">
                <span className="font-sans text-body text-foreground-secondary">Subtotal</span>
                <span className="font-display text-body font-semibold text-foreground">
                  {formatCLP(pedido.total)}
                </span>
              </div>
            )}
            {pedido.creditoAplicado > 0 && (
              <div className="flex justify-between mb-2">
                <span className="font-sans text-body text-success">Crédito aplicado</span>
                <span className="font-display text-body font-semibold text-success">
                  -{formatCLP(pedido.creditoAplicado)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-display text-heading font-bold text-foreground">
                Total pagado
              </span>
              <span className="font-display text-heading font-bold text-primary">
                {formatCLP(pedido.totalPagado)}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/historial"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-display text-body font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-all duration-200 ease-out"
          >
            <ClipboardList size={18} strokeWidth={1.5} />
            Ver historial
          </Link>
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-display text-body font-semibold bg-surface-glass border border-border text-foreground hover:bg-surface-glass/80 transition-all duration-200 ease-out"
          >
            <Home size={18} strokeWidth={1.5} />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
