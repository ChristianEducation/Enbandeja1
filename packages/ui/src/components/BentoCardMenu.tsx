// ═══════════════════════════════════════════════════════════════════
// BentoCardMenu — Card de opción de menú (Bento style)
// ═══════════════════════════════════════════════════════════════════
// Material: Liquid Glass radius 24px padding 20px
// Variant hero: ancho completo, foto 16:9, nombre heading, descripción body
// Variant small: foto pequeña, nombre 2 líneas max, precio abajo
// Estado seleccionado: border primary + shadow-glow-primary
// Estado agotado: opacity 0.4 + overlay "Agotado"
// Server Component compatible (sin "use client" cuando no hay handlers)
// ═══════════════════════════════════════════════════════════════════

import React from "react"
import { formatCLP } from "@enbandeja/shared"

// ───────────────────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────────────────

export interface OpcionMenuCard {
  nombre: string
  descripcion?: string | null
  fotoUrl?: string | null
  precio: number
}

export type BentoCardVariant = "hero" | "small"
export type BentoCardEstado = "disponible" | "seleccionado" | "agotado"

export interface BentoCardMenuProps {
  opcion: OpcionMenuCard
  variant?: BentoCardVariant
  estado?: BentoCardEstado
  /** Callback opcional — si se pasa, el componente necesita "use client" en el padre */
  onSeleccionar?: () => void
}

// ───────────────────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────────────────

export function BentoCardMenu({
  opcion,
  variant = "hero",
  estado = "disponible",
  onSeleccionar,
}: BentoCardMenuProps) {
  const agotado = estado === "agotado"
  const seleccionado = estado === "seleccionado"

  // Clases base comunes
  const baseClasses = `
    relative overflow-hidden rounded-xl p-5
    bg-surface-glass border
    transition-all duration-200 ease-out
    ${seleccionado
      ? "border-primary shadow-glow-primary"
      : "border-border hover:border-border-strong"
    }
    ${agotado ? "opacity-40" : ""}
  `

  if (variant === "hero") {
    return (
      <div
        className={`${baseClasses} cursor-pointer`}
        onClick={agotado ? undefined : onSeleccionar}
        role={onSeleccionar ? "button" : undefined}
        tabIndex={onSeleccionar ? 0 : undefined}
        onKeyDown={onSeleccionar ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSeleccionar()
          }
        } : undefined}
      >
        {/* Foto 16:9 */}
        {opcion.fotoUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
            <img
              src={opcion.fotoUrl}
              alt={opcion.nombre}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Overlay agotado */}
            {agotado && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <span className="font-display text-heading font-bold text-foreground">
                  Agotado
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl bg-surface-elevated mb-4 flex items-center justify-center">
            <span className="text-foreground-tertiary text-small font-sans">Sin foto</span>
          </div>
        )}

        {/* Nombre */}
        <h3 className="font-display text-heading font-semibold text-foreground tracking-tight leading-tight">
          {opcion.nombre}
        </h3>

        {/* Descripción */}
        {opcion.descripcion && (
          <p className="font-sans text-body text-foreground-secondary mt-1 line-clamp-2">
            {opcion.descripcion}
          </p>
        )}

        {/* Precio */}
        <p className="font-display text-heading font-bold text-primary mt-3">
          {formatCLP(opcion.precio)}
        </p>
      </div>
    )
  }

  // Variant small
  return (
    <div
      className={`${baseClasses} cursor-pointer`}
      onClick={agotado ? undefined : onSeleccionar}
      role={onSeleccionar ? "button" : undefined}
      tabIndex={onSeleccionar ? 0 : undefined}
      onKeyDown={onSeleccionar ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSeleccionar()
        }
      } : undefined}
    >
      {/* Foto pequeña */}
      {opcion.fotoUrl ? (
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
          <img
            src={opcion.fotoUrl}
            alt={opcion.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {agotado && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="font-display text-small font-bold text-foreground">
                Agotado
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-[4/3] rounded-xl bg-surface-elevated mb-3 flex items-center justify-center">
          <span className="text-foreground-tertiary text-caption font-sans">—</span>
        </div>
      )}

      {/* Nombre 2 líneas max */}
      <h4 className="font-display text-subheading font-semibold text-foreground tracking-tight leading-snug line-clamp-2">
        {opcion.nombre}
      </h4>

      {/* Precio */}
      <p className="font-display text-subheading font-bold text-primary mt-2">
        {formatCLP(opcion.precio)}
      </p>
    </div>
  )
}
