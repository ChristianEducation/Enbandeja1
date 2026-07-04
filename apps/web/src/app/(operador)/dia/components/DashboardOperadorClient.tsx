"use client"
// ═══════════════════════════════════════════════════════════════════
// DashboardOperadorClient — Dashboard del día del operador
// ═══════════════════════════════════════════════════════════════════
// Totales del día (Bento Cards hero)
// Lista de pedidos con comensal, curso, items
// Desglose por opción de menú
// Búsqueda por nombre de comensal
// Filtros por estado
// Botón "marcar como retirado" con actualización optimista
// ═══════════════════════════════════════════════════════════════════
import React, { useState, useTransition } from "react"
import { formatCLP } from "@enbandeja/shared"
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ClipboardList,
  TrendingUp,
  Loader2,
  UtensilsCrossed,
  XCircle,
} from "@enbandeja/ui/icons"
import type { PedidoDia, ResumenOpcion } from "../page"

// ── Tokens de estado ──
const ESTADO_TOKENS: Record<string, { bg: string; text: string; label: string }> = {
  PAGADO: { bg: "bg-warning/16", text: "text-warning", label: "Pendiente" },
  RETIRADO: { bg: "bg-success/16", text: "text-success", label: "Retirado" },
  NO_RETIRADO: { bg: "bg-warning/16", text: "text-warning", label: "No retirado" },
  CANCELADO: { bg: "bg-danger/16", text: "text-danger", label: "Cancelado" },
}

type FiltroEstado = "todos" | "pendientes" | "retirados" | "cancelados"

interface ColegioOption {
  id: string
  nombre: string
}

interface DashboardOperadorClientProps {
  pedidos: PedidoDia[]
  colegios: ColegioOption[]
  resumenOpciones: ResumenOpcion[]
  hoyDisplay: string
  totalPedidos: number
  totalMonto: number
  totalRetirados: number
  totalPendientes: number
}

export function DashboardOperadorClient({
  pedidos,
  colegios,
  resumenOpciones,
  hoyDisplay,
  totalPedidos,
  totalMonto,
  totalRetirados,
  totalPendientes,
}: DashboardOperadorClientProps) {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [marcandoRetirado, setMarcandoRetirado] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [pedidosLocal, setPedidosLocal] = useState<PedidoDia[]>(pedidos)

  // Filtrar pedidos
  const pedidosFiltrados = pedidosLocal.filter((p) => {
    // Filtro por estado
    if (filtroEstado === "pendientes" && p.estado !== "PAGADO" && p.estado !== "NO_RETIRADO") return false
    if (filtroEstado === "retirados" && p.estado !== "RETIRADO") return false
    if (filtroEstado === "cancelados" && p.estado !== "CANCELADO") return false

    // Búsqueda por nombre de comensal
    if (busqueda) {
      const nombre = `${p.comensal.nombre} ${p.comensal.apellido}`.toLowerCase()
      if (!nombre.includes(busqueda.toLowerCase())) return false
    }

    return true
  })

  // Marcar como retirado (actualización optimista)
  const [cerrando, setCerrando] = useState(false)
  const [colegioCerrar, setColegioCerrar] = useState("")

  const handleMarcarRetirado = async (pedidoId: string) => {
    setMarcandoRetirado(pedidoId)

    // Actualización optimista
    setPedidosLocal((prev) =>
      prev.map((p) =>
        p.id === pedidoId
          ? { ...p, estado: "RETIRADO", items: p.items.map((i) => ({ ...i, retirado: true })) }
          : p
      )
    )

    try {
      const res = await fetch("/api/pedidos/marcar-retirado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId }),
      })
      const data = await res.json()

      if (!data.success) {
        // Revertir optimista
        setPedidosLocal(pedidos)
        console.error("[marcar-retirado] Error:", data.error)
      }
    } catch {
      // Revertir optimista
      setPedidosLocal(pedidos)
    } finally {
      setMarcandoRetirado(null)
    }
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-title font-bold text-foreground tracking-tight">
            Dashboard del día
          </h1>
          <p className="font-sans text-body text-foreground-secondary mt-1 capitalize">
            {hoyDisplay}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {colegios.length > 1 && (
            <select
              value={colegioCerrar}
              onChange={(e) => setColegioCerrar(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-glass border border-border font-sans text-small text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Seleccionar colegio…</option>
              {colegios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}
          <button
            onClick={async () => {
              const colegioFinal = colegios.length === 1 ? colegios[0]!.id : colegioCerrar
              if (!colegioFinal) return
              setCerrando(true)
              try {
                const hoy = new Date().toISOString().split("T")[0]
                const res = await fetch("/api/menu/cerrar-dia", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fecha: hoy, colegioId: colegioFinal }),
                })
                const data = await res.json()
                if (!data.success) {
                  console.error("[cerrar-dia]", data.error)
                }
              } catch {
                // Silencioso
              } finally {
                setCerrando(false)
              }
            }}
            disabled={cerrando || (colegios.length > 1 && !colegioCerrar)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-warning/10 border border-warning/30 font-display text-small font-semibold text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
            type="button"
          >
            {cerrando ? (
              <Loader2 size={16} strokeWidth={2} className="animate-spin" />
            ) : (
              <XCircle size={16} strokeWidth={1.5} />
            )}
            Cerrar día
          </button>
        </div>
      </div>

      {/* Totales del día — Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-surface-glass border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={16} strokeWidth={1.5} className="text-primary" />
            <span className="font-sans text-small text-foreground-secondary">Pedidos</span>
          </div>
          <p className="font-display text-[1.75rem] font-bold text-foreground leading-none">
            {totalPedidos}
          </p>
        </div>
        <div className="rounded-xl bg-surface-glass border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} strokeWidth={1.5} className="text-success" />
            <span className="font-sans text-small text-foreground-secondary">Ingresos</span>
          </div>
          <p className="font-display text-[1.75rem] font-bold text-success leading-none">
            {formatCLP(totalMonto)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-glass border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} strokeWidth={1.5} className="text-success" />
            <span className="font-sans text-small text-foreground-secondary">Retirados</span>
          </div>
          <p className="font-display text-[1.75rem] font-bold text-foreground leading-none">
            {totalRetirados}
          </p>
        </div>
        <div className="rounded-xl bg-surface-glass border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} strokeWidth={1.5} className="text-warning" />
            <span className="font-sans text-small text-foreground-secondary">Pendientes</span>
          </div>
          <p className="font-display text-[1.75rem] font-bold text-warning leading-none">
            {totalPendientes}
          </p>
        </div>
      </div>

      {/* Desglose por opción */}
      {resumenOpciones.length > 0 && (
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <h2 className="font-display text-heading font-semibold text-foreground mb-4">
            Desglose por opción
          </h2>
          <div className="space-y-2">
            {resumenOpciones.map((op) => (
              <div key={op.nombre} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed size={14} strokeWidth={1.5} className="text-foreground-secondary" />
                  <span className="font-sans text-body text-foreground">{op.nombre}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-small font-semibold text-primary">
                    {op.cantidad}x
                  </span>
                  <span className="font-display text-small font-semibold text-foreground">
                    {formatCLP(op.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Búsqueda + Filtros */}
      <div className="space-y-3">
        {/* Búsqueda */}
        <div className="relative">
          <Search
            size={18}
            strokeWidth={1.5}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-secondary"
          />
          <input
            type="text"
            placeholder="Buscar por nombre de comensal..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-glass border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter size={16} strokeWidth={1.5} className="text-foreground-secondary" />
          <div className="flex gap-2 flex-wrap">
            {([["todos", "Todos"], ["pendientes", "Pendientes"], ["retirados", "Retirados"], ["cancelados", "Cancelados"]] as const).map(
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

      {/* Lista de pedidos */}
      <div className="space-y-2">
        {pedidosFiltrados.length === 0 ? (
          <div className="rounded-xl bg-surface-glass border border-border p-8 text-center">
            <ClipboardList size={32} strokeWidth={1.5} className="text-foreground-disabled mx-auto mb-3" />
            <p className="font-display text-body font-semibold text-foreground-secondary">
              No hay pedidos{filtroEstado !== "todos" ? ` ${filtroEstado}` : ""} hoy
            </p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => {
            const token = ESTADO_TOKENS[pedido.estado] || {
              bg: "bg-foreground-disabled/16",
              text: "text-foreground-tertiary",
              label: pedido.estado,
            }

            return (
              <div
                key={pedido.id}
                className="rounded-xl bg-surface-glass border border-border p-4 flex items-center gap-4"
              >
                {/* Info comensal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-body font-semibold text-foreground truncate">
                      {pedido.comensal.nombre} {pedido.comensal.apellido}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-caption font-display font-semibold ${token.bg} ${token.text}`}
                    >
                      {token.label}
                    </span>
                  </div>
                  {pedido.comensal.curso && (
                    <p className="font-sans text-small text-foreground-secondary mt-0.5">
                      {pedido.comensal.curso}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {pedido.items
                      .filter((i) => !i.cancelado)
                      .map((item) => (
                        <span
                          key={item.id}
                          className="font-sans text-small text-foreground-secondary"
                        >
                          {item.nombre} ×{item.cantidad}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Monto + acción */}
                <div className="flex flex-col items-end gap-2">
                  <span className="font-display text-body font-bold text-foreground">
                    {formatCLP(pedido.total)}
                  </span>
                  {/* Botón marcar retirado */}
                  {(pedido.estado === "PAGADO" || pedido.estado === "NO_RETIRADO") && (
                    <button
                      onClick={() => handleMarcarRetirado(pedido.id)}
                      disabled={marcandoRetirado === pedido.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-success/10 text-success font-display text-small font-semibold hover:bg-success/20 transition-colors disabled:opacity-50"
                      type="button"
                    >
                      {marcandoRetirado === pedido.id ? (
                        <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} strokeWidth={1.5} />
                      )}
                      Retirado
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
