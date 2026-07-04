"use client"

import React, { useState } from "react"
import { CreditCard, CheckCircle2, Loader2, ChevronRight } from "@enbandeja/ui/icons"
import { useRouter } from "next/navigation"

interface Props {
  yaConectado: boolean
}

export function PasarelaSetupClient({ yaConectado }: Props) {
  const router = useRouter()
  const [conectando, setConectando] = useState(false)
  const [skipped, setSkipped] = useState(false)

  const handleConectar = async () => {
    setConectando(true)
    try {
      // [PENDIENTE CONSULTA] OAuth real de MercadoPago
      // El flujo completo es:
      // 1. Redirigir a MercadoPago OAuth: https://auth.mercadopago.com/authorization?client_id=...&redirect_uri=...&response_type=code&platform_id=mp
      // 2. Usuario autoriza en MercadoPago
      // 3. MercadoPago redirige de vuelta con código
      // 4. Backend intercambia código por access_token + refresh_token
      // 5. Guardar tokens en PaymentProviderConfig (tenant-scoped)
      //
      // Por ahora: simulamos la conexión guardando un placeholder
      const res = await fetch("/api/setup/conectar-mercadopago", {
        method: "POST",
      })
      const data = await res.json()
      if (data.success) {
        // Marcar paso
        await fetch("/api/setup/avanzar-paso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paso: "conectoMercadoPago" }),
        })
        router.push("/setup/comensales")
      }
    } catch {
      setConectando(false)
    }
  }

  const handleSkip = async () => {
    // Permitir saltar este paso — se puede conectar después
    setSkipped(true)
    await fetch("/api/setup/avanzar-paso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paso: "conectoMercadoPago" }),
    })
    router.push("/setup/comensales")
  }

  if (yaConectado) {
    return (
      <div className="p-5 md:p-8 max-w-lg mx-auto space-y-6">
        <div className="rounded-xl bg-success/10 border border-success/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} strokeWidth={1.5} className="text-success" />
            <p className="font-display text-heading font-semibold text-success">MercadoPago conectado</p>
          </div>
          <p className="font-sans text-body text-foreground-secondary">
            Ya puedes recibir pagos de apoderados a través de MercadoPago.
          </p>
          <button onClick={() => router.push("/setup/comensales")} className="mt-4 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors" type="button">
            Continuar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard size={24} strokeWidth={1.5} className="text-primary" />
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            Conecta tu pasarela de pago
          </h2>
          <p className="font-sans text-body text-foreground-secondary">
            Para que los apoderados te paguen, necesitas conectar MercadoPago.
            Los pagos van directamente a tu cuenta — Enbandeja no intercepta el dinero.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
        <p className="font-sans text-body text-foreground">
          Al conectar MercadoPago, los apoderados podrán pagar con tarjeta, transferencia y otros medios.
          El token de acceso se guarda de forma segura y pertenece a tu cuenta.
        </p>

        <button
          onClick={handleConectar}
          disabled={conectando}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#009ee3] text-white font-display text-body font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          type="button"
        >
          {conectando ? (
            <Loader2 size={18} strokeWidth={2} className="animate-spin" />
          ) : (
            <ChevronRight size={18} strokeWidth={1.5} />
          )}
          {conectando ? "Conectando..." : "Conectar MercadoPago"}
        </button>

        <div className="border-t border-border pt-3">
          <button
            onClick={handleSkip}
            className="w-full px-4 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors"
            type="button"
          >
            Conectar más tarde
          </button>
          <p className="font-sans text-caption text-foreground-disabled mt-1 text-center">
            Puedes completar este paso desde el panel del Owner.
          </p>
        </div>
      </div>

      {/* Nota sobre separación de flujos */}
      <p className="font-sans text-small text-foreground-secondary text-center">
        Este es el flujo apoderado → comercio. El cobro de tu suscripción a Enbandeja es un flujo separado.
      </p>
    </div>
  )
}
