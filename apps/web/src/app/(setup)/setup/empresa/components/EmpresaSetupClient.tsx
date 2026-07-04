"use client"

import React, { useState } from "react"
import { Loader2, Building2 } from "@enbandeja/ui/icons"
import { useRouter } from "next/navigation"

interface Props {
  tenant: { name: string; rut: string | null; email: string; phone: string | null } | null
}

export function EmpresaSetupClient({ tenant }: Props) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: tenant?.name || "",
    rut: tenant?.rut || "",
    email: tenant?.email || "",
    phone: tenant?.phone || "",
  })

  const handleGuardar = async () => {
    if (!form.name || !form.email) {
      setError("Nombre y email son obligatorios")
      return
    }
    setGuardando(true)
    setError(null)
    try {
      // Actualizar datos del tenant
      const res1 = await fetch("/api/tenant/actualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data1 = await res1.json()
      if (!data1.success) {
        setError(data1.error || "Error al guardar")
        setGuardando(false)
        return
      }
      // Marcar paso completado
      const res2 = await fetch("/api/setup/avanzar-paso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paso: "datosEmpresa" }),
      })
      const data2 = await res2.json()
      if (data2.success) {
        router.push("/setup/colegio")
      } else {
        setError(data2.error || "Error al avanzar")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="p-5 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Building2 size={24} strokeWidth={1.5} className="text-primary" />
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            Datos de tu empresa
          </h2>
          <p className="font-sans text-body text-foreground-secondary">
            Cuéntanos sobre tu negocio de casino.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-display text-small font-semibold text-foreground mb-1 block">
            Nombre de la empresa *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="font-display text-small font-semibold text-foreground mb-1 block">
            RUT
          </label>
          <input
            type="text"
            value={form.rut}
            placeholder="76.xxx.xxx-x"
            onChange={(e) => setForm({ ...form, rut: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="font-display text-small font-semibold text-foreground mb-1 block">
            Email de contacto *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="font-display text-small font-semibold text-foreground mb-1 block">
            Teléfono
          </label>
          <input
            type="tel"
            value={form.phone || ""}
            placeholder="+56 9 xxxx xxxx"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {error && (
        <p className="font-sans text-small text-warning">{error}</p>
      )}

      <button
        onClick={handleGuardar}
        disabled={guardando}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
        type="button"
      >
        {guardando ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : null}
        Continuar
      </button>
    </div>
  )
}
