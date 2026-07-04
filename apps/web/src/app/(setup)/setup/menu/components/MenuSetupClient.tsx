"use client"

import React from "react"
import { UtensilsCrossed, CheckCircle2, ChevronRight } from "@enbandeja/ui/icons"
import { useRouter } from "next/navigation"

interface Props {
  tieneMenu: boolean
  completado: boolean
}

export function MenuSetupClient({ tieneMenu, completado }: Props) {
  const router = useRouter()

  const handleCompletar = async () => {
    await fetch("/api/setup/avanzar-paso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paso: "primerMenuPublicado" }),
    })
    router.push("/owner/dashboard")
  }

  const handleCrearMenu = () => {
    router.push("/operador/menu/nuevo")
  }

  if (completado) {
    return (
      <div className="p-5 md:p-8 max-w-lg mx-auto space-y-6">
        <div className="rounded-xl bg-success/10 border border-success/30 p-8 text-center">
          <ChevronRight size={48} strokeWidth={1.5} className="text-success mx-auto mb-4" />
          <h2 className="font-display text-title font-bold text-foreground">
            ¡Setup completo!
          </h2>
          <p className="font-sans text-body text-foreground-secondary mt-2">
            Tu cuenta está configurada y lista para operar. Serás redirigido al dashboard.
          </p>
          <button onClick={() => router.push("/owner/dashboard")} className="mt-4 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors" type="button">
            Ir al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <UtensilsCrossed size={24} strokeWidth={1.5} className="text-primary" />
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            Tu primer menú
          </h2>
          <p className="font-sans text-body text-foreground-secondary">
            Publica tu primer menú para que los apoderados puedan empezar a pedir.
          </p>
        </div>
      </div>

      {tieneMenu ? (
        <div className="rounded-xl bg-success/10 border border-success/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} strokeWidth={1.5} className="text-success" />
            <p className="font-display text-heading font-semibold text-success">Ya tienes menú</p>
          </div>
          <p className="font-sans text-body text-foreground-secondary">
            Puedes gestionar tus menús desde /operador/menu.
          </p>
          <button onClick={handleCompletar} className="mt-4 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors" type="button">
            Completar setup
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-sans text-body text-foreground-secondary">
            Desde el panel del operador podrás crear menús con opciones y precios.
            Te llevamos ahí ahora.
          </p>
          <button onClick={handleCrearMenu} className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors" type="button">
            Crear primer menú
          </button>
          <button onClick={handleCompletar} className="w-full px-4 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors" type="button">
            Lo haré después
          </button>
        </div>
      )}
    </div>
  )
}
