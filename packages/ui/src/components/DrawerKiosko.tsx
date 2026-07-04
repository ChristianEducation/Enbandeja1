"use client"

// ═══════════════════════════════════════════════════════════════════
// DrawerKiosko — Bottom sheet para productos del kiosko
// ═══════════════════════════════════════════════════════════════════
// Bottom sheet con Liquid Glass, radius 24px top
// Lista de productos con foto, nombre, precio, botón +/-
// Estado local del drawer (items seleccionados)
// Botón "Agregar al pedido" que cierra y pasa selección al padre
// Solo se integra si colegio.kioscoActivo === true
//
// Regla: íconos desde @enbandeja/ui/icons. Utilidades desde @enbandeja/shared.
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react"
import { X, Plus, Minus } from "../icons"
import { formatCLP } from "@enbandeja/shared"

// ───────────────────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────────────────

export interface ProductoKioskoItem {
  id: string
  nombre: string
  descripcion?: string | null
  fotoUrl?: string | null
  precio: number
  stockActual?: number | null
}

export interface DrawerKioskoProps {
  productos: ProductoKioskoItem[]
  isOpen: boolean
  onClose: () => void
  onAgregar: (items: Array<{ productoId: string; nombre: string; precio: number; cantidad: number }>) => void
}

// ───────────────────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────────────────

export function DrawerKiosko({
  productos,
  isOpen,
  onClose,
  onAgregar,
}: DrawerKioskoProps) {
  // Estado local: cantidad por producto
  const [cantidades, setCantidades] = useState<Record<string, number>>({})

  const incrementar = (id: string) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }))
  }

  const decrementar = (id: string) => {
    setCantidades((prev) => {
      const current = prev[id] ?? 0
      if (current <= 1) {
        const { [id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: current - 1 }
    })
  }

  const totalItems = Object.values(cantidades).reduce((s, c) => s + c, 0)
  const totalPrecio = productos.reduce(
    (sum, p) => sum + (cantidades[p.id] ?? 0) * p.precio,
    0
  )

  const handleAgregar = () => {
    const items = Object.entries(cantidades)
      .filter(([, cant]) => cant > 0)
      .map(([id, cant]) => {
        const prod = productos.find((p) => p.id === id)!
        return {
          productoId: id,
          nombre: prod.nombre,
          precio: prod.precio,
          cantidad: cant,
        }
      })
    onAgregar(items)
    setCantidades({})
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/60 z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-50
          bg-surface-glass
          rounded-t-3xl border-t border-border
          max-h-[80vh] flex flex-col
          animate-slide-up
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <h3 className="font-display text-heading font-semibold text-foreground">
            Kiosko
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface transition-colors"
            type="button"
            aria-label="Cerrar kiosko"
          >
            <X size={20} strokeWidth={1.5} className="text-foreground-secondary" />
          </button>
        </div>

        {/* Lista de productos */}
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {productos.map((producto) => {
            const cantidad = cantidades[producto.id] ?? 0
            const sinStock =
              producto.stockActual !== null &&
              producto.stockActual !== undefined &&
              producto.stockActual <= 0

            return (
              <div
                key={producto.id}
                className={`
                  flex items-center gap-4 p-4 rounded-xl
                  bg-surface-elevated border border-border
                  ${sinStock ? "opacity-40" : ""}
                `}
              >
                {/* Foto */}
                {producto.fotoUrl ? (
                  <img
                    src={producto.fotoUrl}
                    alt={producto.nombre}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-surface flex-shrink-0 flex items-center justify-center">
                    <span className="text-foreground-tertiary text-caption font-sans">—</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-body font-semibold text-foreground truncate">
                    {producto.nombre}
                  </p>
                  {sinStock ? (
                    <p className="font-sans text-small text-foreground-tertiary mt-0.5">
                      Agotado
                    </p>
                  ) : (
                    <p className="font-display text-small font-bold text-primary mt-0.5">
                      {formatCLP(producto.precio)}
                    </p>
                  )}
                </div>

                {/* Controles +/- */}
                {!sinStock && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {cantidad > 0 && (
                      <>
                        <button
                          onClick={() => decrementar(producto.id)}
                          className="w-8 h-8 rounded-lg bg-surface border border-border
                            flex items-center justify-center
                            hover:border-border-strong transition-colors"
                          type="button"
                          aria-label="Quitar uno"
                        >
                          <Minus size={16} strokeWidth={1.5} className="text-foreground-secondary" />
                        </button>
                        <span className="font-display text-body font-bold text-foreground w-6 text-center">
                          {cantidad}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => incrementar(producto.id)}
                      className="w-8 h-8 rounded-lg bg-primary
                        flex items-center justify-center
                        hover:bg-primary-hover transition-colors"
                      type="button"
                      aria-label="Agregar uno"
                    >
                      <Plus size={16} strokeWidth={1.5} className="text-primary-foreground" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {productos.length === 0 && (
            <p className="font-sans text-body text-foreground-tertiary text-center py-8">
              No hay productos en el kiosko actualmente.
            </p>
          )}
        </div>

        {/* Footer con total y botón agregar */}
        {totalItems > 0 && (
          <div className="p-5 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-body text-foreground-secondary">
                {totalItems} item{totalItems > 1 ? "s" : ""}
              </span>
              <span className="font-display text-heading font-bold text-foreground">
                {formatCLP(totalPrecio)}
              </span>
            </div>
            <button
              onClick={handleAgregar}
              className="w-full py-3 rounded-xl bg-primary font-display text-body font-semibold
                text-primary-foreground hover:bg-primary-hover
                transition-colors duration-200 ease-out"
              type="button"
            >
              Agregar al pedido
            </button>
          </div>
        )}
      </div>
    </>
  )
}
