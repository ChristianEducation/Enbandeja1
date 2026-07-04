"use client"
// ═══════════════════════════════════════════════════════════════════
// CocinaClient — Vista de cocina (solo lectura)
// ═══════════════════════════════════════════════════════════════════
// Tipografía 50% más grande para lectura a 3 metros
// Agrupado por opción de menú (qué preparar)
// Lista de pedidos con estado retirado
// NO hay botones de escritura (rol COCINA)
// Auto-refresh cada 30 segundos (en vez de Realtime por ahora)
// [PENDIENTE CONSULTA] Realtime con Supabase requiere client lib setup
// ═══════════════════════════════════════════════════════════════════
import React, { useEffect, useState } from "react"
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  ChefHat,
} from "@enbandeja/ui/icons"
import type { OpcionPreparar, PedidoCocina } from "../page"

interface CocinaClientProps {
  opcionesPreparar: OpcionPreparar[]
  pedidos: PedidoCocina[]
  hoyDisplay: string
  tenantName: string
  tenantId: string
}

export function CocinaClient({
  opcionesPreparar,
  pedidos,
  hoyDisplay,
  tenantName,
  tenantId,
}: CocinaClientProps) {
  // Auto-refresh cada 30 segundos
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Recargar datos al hacer tick
  useEffect(() => {
    // Solo recargar si ya pasaron 30 segundos
    const shouldRefresh = document.visibilityState === "visible"
    if (shouldRefresh && Date.now() % 30000 < 1000) {
      window.location.reload()
    }
  }, [])

  const totalPendientes = opcionesPreparar.reduce((acc, op) => acc + op.cantidadPendiente, 0)
  const totalRetirados = opcionesPreparar.reduce((acc, op) => acc + op.cantidadRetirada, 0)

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-8">
      {/* Header — tipografía grande */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[2rem] md:text-[2.5rem] font-bold text-foreground tracking-tight">
            Cocina
          </h1>
          <p className="font-sans text-lg md:text-xl text-foreground-secondary capitalize mt-1">
            {hoyDisplay} · {tenantName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-warning">{totalPendientes}</p>
            <p className="font-sans text-sm text-foreground-secondary">Pendientes</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-success">{totalRetirados}</p>
            <p className="font-sans text-sm text-foreground-secondary">Retirados</p>
          </div>
        </div>
      </div>

      {/* Qué preparar — agrupado por opción */}
      <div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <ChefHat size={24} strokeWidth={1.5} className="text-primary" />
          Qué preparar
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {opcionesPreparar.map((op) => (
            <div
              key={op.nombre}
              className={`rounded-xl p-5 border ${
                op.cantidadPendiente > 0
                  ? "bg-surface-glass border-border"
                  : "bg-success/8 border-success/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed size={20} strokeWidth={1.5} className="text-primary" />
                <p className="font-display text-lg font-bold text-foreground truncate">
                  {op.nombre}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-display text-3xl font-bold text-warning">
                    {op.cantidadPendiente}
                  </p>
                  <p className="font-sans text-sm text-foreground-secondary">Pendientes</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-success">
                    {op.cantidadRetirada}
                  </p>
                  <p className="font-sans text-sm text-foreground-secondary">Retirados</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de pedidos */}
      <div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock size={24} strokeWidth={1.5} className="text-foreground-secondary" />
          Pedidos del día
        </h2>
        <div className="space-y-2">
          {pedidos.map((pedido) => {
            const retirado = pedido.estado === "RETIRADO"
            return (
              <div
                key={pedido.id}
                className={`rounded-xl p-4 border ${
                  retirado
                    ? "bg-success/8 border-success/20 opacity-60"
                    : "bg-surface-glass border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {retirado && (
                      <CheckCircle2 size={20} strokeWidth={1.5} className="text-success" />
                    )}
                    <div>
                      <p className={`font-display text-lg font-bold ${retirado ? "text-success" : "text-foreground"}`}>
                        {pedido.comensal}
                      </p>
                      {pedido.curso && (
                        <p className="font-sans text-sm text-foreground-secondary">
                          {pedido.curso}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {pedido.items.map((item, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full font-display text-base font-semibold ${
                          item.retirado
                            ? "bg-success/16 text-success"
                            : "bg-warning/16 text-warning"
                        }`}
                      >
                        {item.nombre} ×{item.cantidad}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
