"use client"

// ═══════════════════════════════════════════════════════════════════
// ResumenPedidoClient — Resumen del pedido con botón de pago
// ═══════════════════════════════════════════════════════════════════
// Muestra: lista de items, desglose, crédito, total.
// Botón: "Confirmar y pagar" (si totalPagado > 0) o "Confirmar" (si 0).
// Al confirmar → POST a /api/pedidos/crear.
// Si requiere pago → redirect a URL de Webpay.
// Si monto 0 → redirect a /confirmacion.
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react"
import { formatCLP } from "@enbandeja/shared"
import { CreditCard, CheckCircle2, ChevronLeft, Loader2 } from "@enbandeja/ui/icons"
import { useRouter } from "next/navigation"

interface ResumenItem {
  id: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
  tipo: string
  comensal: string
}

export interface ResumenPedidoClientProps {
  pedidoId: string
  orderId: string
  total: number
  creditoAplicado: number
  totalPagado: number
  items: ResumenItem[]
  estado: string
}

export function ResumenPedidoClient({
  pedidoId,
  orderId,
  total,
  creditoAplicado,
  totalPagado,
  items,
  estado,
}: ResumenPedidoClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const montoCero = totalPagado === 0
  const yaConfirmado = estado === "PAGADO"

  const handleConfirmar = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/pedidos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Error al procesar el pedido")
        setLoading(false)
        return
      }

      if (data.requierePago && data.urlPasarela) {
        // Redirect a Webpay
        window.location.href = data.urlPasarela
      } else {
        // Monto cero → confirmación directa
        router.push("/confirmacion")
      }
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-4"
          type="button"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
          <span className="font-display text-small font-medium">Volver</span>
        </button>
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">
          Resumen del pedido
        </h1>
      </div>

      {/* Contenido */}
      <div className="px-5 space-y-4">
        {/* Lista de items */}
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <h2 className="font-display text-heading font-semibold text-foreground mb-4">
            Items del pedido
          </h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-body text-foreground">{item.nombre}</p>
                  <p className="font-sans text-small text-foreground-secondary">
                    {item.comensal} · {item.cantidad}x
                  </p>
                </div>
                <p className="font-display text-body font-bold text-foreground">
                  {formatCLP(item.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Desglose */}
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <h2 className="font-display text-heading font-semibold text-foreground mb-4">
            Desglose
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-body text-foreground-secondary">Subtotal</span>
              <span className="font-display text-body font-semibold text-foreground">
                {formatCLP(total)}
              </span>
            </div>

            {creditoAplicado > 0 && (
              <div className="flex justify-between">
                <span className="font-sans text-body text-success">Crédito aplicado</span>
                <span className="font-display text-body font-semibold text-success">
                  -{formatCLP(creditoAplicado)}
                </span>
              </div>
            )}

            <div className="border-t border-border my-2" />

            <div className="flex justify-between">
              <span className="font-display text-heading font-bold text-foreground">
                Total a pagar
              </span>
              <span className="font-display text-heading font-bold text-primary">
                {formatCLP(totalPagado)}
              </span>
            </div>
          </div>

          {montoCero && (
            <div className="mt-4 p-3 rounded-xl bg-success/10 border border-success/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} strokeWidth={1.5} className="text-success" />
                <p className="font-display text-small font-semibold text-success">
                  Cubierto por crédito/beca
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
            <p className="font-sans text-small text-warning">{error}</p>
          </div>
        )}

        {/* Botón de acción */}
        {!yaConfirmado && (
          <button
            onClick={handleConfirmar}
            disabled={loading}
            className={`
              w-full py-3 rounded-xl font-display text-body font-semibold
              transition-all duration-200 ease-out
              ${loading
                ? "bg-foreground-disabled text-foreground-tertiary cursor-default"
                : montoCero
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover"
              }
            `}
            type="button"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} strokeWidth={1.5} className="animate-spin" />
                Procesando...
              </span>
            ) : montoCero ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={18} strokeWidth={1.5} />
                Confirmar
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard size={18} strokeWidth={1.5} />
                Confirmar y pagar
              </span>
            )}
          </button>
        )}

        {yaConfirmado && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-center">
            <CheckCircle2 size={24} strokeWidth={1.5} className="text-success mx-auto mb-2" />
            <p className="font-display text-body font-semibold text-success">
              Pedido confirmado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
