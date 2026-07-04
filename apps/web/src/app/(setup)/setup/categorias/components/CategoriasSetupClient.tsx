"use client"

import React from "react"
import { SlidersHorizontal, CheckCircle2, Loader2 } from "@enbandeja/ui/icons"
import { useRouter } from "next/navigation"

interface Props {
  colegios: { id: string; nombre: string; CategoriasPrecio: { id: string; nombre: string }[] }[]
}

export function CategoriasSetupClient({ colegios }: Props) {
  const router = useRouter()

  const handleContinuar = async () => {
    await fetch("/api/setup/avanzar-paso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paso: "categoriasPrecios" }),
    })
    router.push("/setup/menu")
  }

  return (
    <div className="p-5 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SlidersHorizontal size={24} strokeWidth={1.5} className="text-primary" />
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            Categorías de precio
          </h2>
          <p className="font-sans text-body text-foreground-secondary">
            Cada colegio tiene una categoría &ldquo;General&rdquo; por defecto. Puedes agregar más desde el panel del Owner.
          </p>
        </div>
      </div>

      {/* Mostrar categorías existentes */}
      {colegios.map((c) => (
        <div key={c.id} className="rounded-xl bg-surface-glass border border-border p-4">
          <p className="font-display text-body font-semibold text-foreground">{c.nombre}</p>
          <div className="mt-2 space-y-1">
            {c.CategoriasPrecio.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <CheckCircle2 size={14} strokeWidth={1.5} className="text-success" />
                <span className="font-sans text-small text-foreground">{cat.nombre}</span>
              </div>
            ))}
            {c.CategoriasPrecio.length === 0 && (
              <p className="font-sans text-small text-foreground-secondary">Sin categorías configuradas</p>
            )}
          </div>
        </div>
      ))}

      <p className="font-sans text-small text-foreground-secondary text-center">
        Puedes agregar categorías adicionales (ej: Funcionario, Becado) desde el panel del Owner más adelante.
      </p>

      <button onClick={handleContinuar} className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors" type="button">
        Continuar
      </button>
    </div>
  )
}
