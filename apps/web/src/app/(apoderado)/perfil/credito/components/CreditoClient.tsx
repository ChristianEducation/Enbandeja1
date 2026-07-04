"use client"
// ═══════════════════════════════════════════════════════════════════
// CreditoClient — Movimientos de crédito del apoderado
// ═══════════════════════════════════════════════════════════════════
// Bento Card hero: saldo actual (Plus Jakarta display grande)
// Lista Bento por cada movimiento:
//   - Fecha (Inter small)
//   - Concepto (Inter body)
//   - Monto (+verde o -ámbar)
// ═══════════════════════════════════════════════════════════════════
import React from "react"
import { formatCLP } from "@enbandeja/shared"
import { Wallet, ArrowDownLeft, ArrowUpRight, ChevronLeft } from "@enbandeja/ui/icons"
import { useRouter } from "next/navigation"
import type { MovimientoCredito } from "../page"

interface CreditoClientProps {
  saldoActual: number
  movimientos: MovimientoCredito[]
}

export function CreditoClient({ saldoActual, movimientos }: CreditoClientProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={() => router.push("/perfil")}
          className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-4"
          type="button"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
          <span className="font-display text-small font-medium">Mi perfil</span>
        </button>
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">
          Mi crédito
        </h1>
      </div>

      <div className="px-5 space-y-4">
        {/* Card: Saldo actual */}
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={18} strokeWidth={1.5} className="text-success" />
            <h2 className="font-display text-heading font-semibold text-foreground">
              Saldo disponible
            </h2>
          </div>
          <p className="font-display text-[2rem] font-bold text-success leading-none">
            {formatCLP(saldoActual)}
          </p>
          <p className="font-sans text-small text-foreground-secondary mt-2">
            Se aplica automáticamente en tus próximos pedidos
          </p>
        </div>

        {/* Lista de movimientos */}
        {movimientos.length === 0 ? (
          <div className="rounded-xl bg-surface-glass border border-border p-8 text-center">
            <Wallet size={32} strokeWidth={1.5} className="text-foreground-disabled mx-auto mb-3" />
            <p className="font-display text-body font-semibold text-foreground-secondary">
              Sin movimientos aún
            </p>
            <p className="font-sans text-small text-foreground-tertiary mt-1">
              Los movimientos aparecen al cancelar items o usar crédito
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {movimientos.map((mov) => {
              const esPositivo = mov.monto > 0
              return (
                <div
                  key={mov.id}
                  className="rounded-xl bg-surface-glass border border-border p-4 flex items-center gap-3"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      esPositivo ? "bg-success/16" : "bg-warning/16"
                    }`}
                  >
                    {esPositivo ? (
                      <ArrowDownLeft
                        size={18}
                        strokeWidth={1.5}
                        className="text-success"
                      />
                    ) : (
                      <ArrowUpRight
                        size={18}
                        strokeWidth={1.5}
                        className="text-warning"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-body text-foreground truncate">
                      {mov.concepto}
                    </p>
                    <p className="font-sans text-small text-foreground-secondary">
                      {mov.fechaFormateada}
                    </p>
                  </div>
                  <p
                    className={`font-display text-body font-bold ${
                      esPositivo ? "text-success" : "text-warning"
                    }`}
                  >
                    {esPositivo ? "+" : ""}{formatCLP(mov.monto)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
