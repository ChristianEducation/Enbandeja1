"use client"
// ═══════════════════════════════════════════════════════════════════
// HistorialClient — Historial de pedidos con filtros + cancelación
// ═══════════════════════════════════════════════════════════════════
// Filtros: por estado (todos, pagados, cancelados)
// Lista de Bento Cards, 1 por pedido
// Card muestra: fecha, total, estado (badge), items, botón "Ver detalle"
// que expande inline con botón "Cancelar" por item (NO modal)
// Confirmación inline antes de cancelar
// ═══════════════════════════════════════════════════════════════════
import React, { useState, useTransition } from "react"
import { formatCLP } from "@enbandeja/shared"
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Filter,
  XCircle,
  Loader2,
  RotateCcw,
} from "@enbandeja/ui/icons"
import type { PedidoHistorial, ComensalHistorial } from "../page"

// ───────────────────────────────────────────────────────────────────
// Tokens de estado-pedido → colores
// ───────────────────────────────────────────────────────────────────
const ESTADO_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PAGADO: { bg: "bg-success/16", text: "text-success", label: "Pagado" },
  PENDIENTE_PAGO: { bg: "bg-warning/16", text: "text-warning", label: "Pendiente" },
  CANCELADO: { bg: "bg-danger/16", text: "text-danger", label: "Cancelado" },
  RECHAZADO: { bg: "bg-danger/16", text: "text-danger", label: "Rechazado" },
  EXPIRADO: { bg: "bg-foreground-disabled/16", text: "text-foreground-tertiary", label: "Expirado" },
}

// ───────────────────────────────────────────────────────────────────
// Tipos de filtro
// ───────────────────────────────────────────────────────────────────
type FiltroEstado = "todos" | "pagados" | "cancelados"

interface HistorialClientProps {
  pedidos: PedidoHistorial[]
  comensales: ComensalHistorial[]
}

export function HistorialClient({ pedidos, comensales }: HistorialClientProps) {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos")
  const [expandido, setExpandido] = useState<string | null>(null)
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroEstado === "pagados") return p.estado === "PAGADO"
    if (filtroEstado === "cancelados") return p.estado === "CANCELADO" || p.estado === "RECHAZADO" || p.estado === "EXPIRADO"
    return true
  })

  const toggleDetalle = (pedidoId: string) => {
    setExpandido((prev) => (prev === pedidoId ? null : pedidoId))
    setConfirmando(null)
    setErrorLocal(null)
  }

  const handleCancelarItem = async (itemId: string) => {
    setCancelando(itemId)
    setErrorLocal(null)
    try {
      const res = await fetch("/api/pedidos/cancelar-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoItemId: itemId }),
      })
      const data = await res.json()
      if (!data.success) {
        setErrorLocal(data.error || "Error al cancelar")
        return
      }
      // Refresh optimista: recargar la página
      startTransition(() => {
        window.location.reload()
      })
    } catch {
      setErrorLocal("Error de conexión. Intenta nuevamente.")
    } finally {
      setCancelando(null)
      setConfirmando(null)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">
          Historial
        </h1>
        <p className="font-sans text-body text-foreground-secondary mt-1">
          {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} en total
        </p>
      </div>

      {/* Filtros */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} strokeWidth={1.5} className="text-foreground-secondary" />
          <div className="flex gap-2">
            {([["todos", "Todos"], ["pagados", "Pagados"], ["cancelados", "Cancelados"]] as const).map(
              ([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFiltroEstado(value)}
                  className={`px-3 py-1.5 rounded-full font-display text-small font-medium transition-all duration-200 ${
                    filtroEstado === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-glass text-foreground-secondary border border-border"
                  }`}
                  type="button"
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {errorLocal && (
        <div className="px-5 mb-3">
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
            <p className="font-sans text-small text-warning">{errorLocal}</p>
          </div>
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="px-5 space-y-3">
        {pedidosFiltrados.length === 0 ? (
          <div className="rounded-xl bg-surface-glass border border-border p-8 text-center">
            <ClipboardList size={32} strokeWidth={1.5} className="text-foreground-disabled mx-auto mb-3" />
            <p className="font-display text-body font-semibold text-foreground-secondary">
              No hay pedidos{filtroEstado !== "todos" ? ` ${filtroEstado}` : ""}
            </p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => {
            const estadoToken = ESTADO_COLORS[pedido.estado] || {
              bg: "bg-foreground-disabled/16",
              text: "text-foreground-tertiary",
              label: pedido.estado,
            }
            const expandidoEste = expandido === pedido.id

            return (
              <div
                key={pedido.id}
                className="rounded-xl bg-surface-glass border border-border p-5"
              >
                {/* Header de la card */}
                <button
                  onClick={() => toggleDetalle(pedido.id)}
                  className="w-full text-left"
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-small text-foreground-secondary capitalize">
                        {pedido.fechaFormateada}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-caption font-display font-semibold ${estadoToken.bg} ${estadoToken.text}`}
                        >
                          {estadoToken.label}
                        </span>
                        <span className="font-display text-body font-bold text-foreground">
                          {formatCLP(pedido.total)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-foreground-secondary">
                      {expandidoEste ? (
                        <ChevronUp size={18} strokeWidth={1.5} />
                      ) : (
                        <ChevronDown size={18} strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Detalle expandible */}
                {expandidoEste && (
                  <div className="mt-4 pt-3 border-t border-border space-y-3">
                    {pedido.items.map((item) => (
                      <div key={item.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <span
                              className={`font-sans text-small text-foreground ${item.cancelado ? "line-through opacity-50" : ""}`}
                            >
                              {item.nombre} ×{item.cantidad}
                            </span>
                            {item.comensal && (
                              <span className="font-sans text-small text-foreground-secondary ml-1">
                                · {item.comensal}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-display text-small font-semibold ${item.cancelado ? "text-foreground-disabled line-through" : "text-foreground"}`}
                            >
                              {formatCLP(item.subtotal)}
                            </span>
                          </div>
                        </div>

                        {/* Item cancelado badge */}
                        {item.cancelado && item.creditoGenerado > 0 && (
                          <div className="flex items-center gap-1.5 pl-1">
                            <RotateCcw size={12} strokeWidth={1.5} className="text-success" />
                            <span className="font-display text-caption text-success">
                              Cancelado · Crédito: {formatCLP(item.creditoGenerado)}
                            </span>
                          </div>
                        )}

                        {/* Botón cancelar inline (NO modal) */}
                        {item.puedeCancelar && !item.cancelado && (
                          <div className="pl-1">
                            {confirmando === item.id ? (
                              <div className="flex items-center gap-2">
                                <span className="font-display text-caption text-warning">
                                  ¿Cancelar este item?
                                </span>
                                <button
                                  onClick={() => handleCancelarItem(item.id)}
                                  disabled={cancelando === item.id}
                                  className="px-2 py-0.5 rounded-full bg-warning/10 text-warning font-display text-caption font-semibold hover:bg-warning/20 transition-colors"
                                  type="button"
                                >
                                  {cancelando === item.id ? (
                                    <Loader2 size={12} strokeWidth={2} className="animate-spin" />
                                  ) : (
                                    "Sí, cancelar"
                                  )}
                                </button>
                                <button
                                  onClick={() => setConfirmando(null)}
                                  className="px-2 py-0.5 rounded-full bg-surface-glass text-foreground-secondary font-display text-caption font-medium border border-border hover:bg-surface-glass/80 transition-colors"
                                  type="button"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setConfirmando(item.id)
                                  setErrorLocal(null)
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/8 text-danger font-display text-caption font-medium hover:bg-danger/16 transition-colors"
                                type="button"
                              >
                                <XCircle size={12} strokeWidth={1.5} />
                                Cancelar
                              </button>
                            )}
                          </div>
                        )}

                        {/* Razón si no se puede cancelar */}
                        {!item.puedeCancelar && !item.cancelado && pedido.estado === "PAGADO" && item.razonNoCancelar && (
                          <p className="font-sans text-caption text-foreground-disabled pl-1">
                            {item.razonNoCancelar}
                          </p>
                        )}
                      </div>
                    ))}

                    {pedido.creditoAplicado > 0 && (
                      <div className="flex justify-between pt-2">
                        <span className="font-sans text-small text-success">Crédito aplicado</span>
                        <span className="font-display text-small font-semibold text-success">
                          -{formatCLP(pedido.creditoAplicado)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-display text-small font-bold text-foreground">Total pagado</span>
                      <span className="font-display text-small font-bold text-primary">
                        {formatCLP(pedido.totalPagado)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
