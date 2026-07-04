"use client"
// ═══════════════════════════════════════════════════════════════════
// EmpresaClient — Gestión de datos del tenant
// ═══════════════════════════════════════════════════════════════════
import React, { useState } from "react"
import { Loader2, Save, Building2 } from "@enbandeja/ui/icons"

interface TenantData {
  id: string
  name: string
  slug: string
  rut: string | null
  email: string
  phone: string | null
  timezone: string
  status: string
}

interface SuscripcionData {
  id: string
  estado: string
  tipo: string
  periodoInicio: string | null
  periodoFin: string | null
  Plan: { nombre: string; tipo: string; maxColegios: number | null } | null
}

interface EmpresaClientProps {
  tenant: TenantData | null
  suscripcion: SuscripcionData | null
}

export function EmpresaClient({ tenant, suscripcion }: EmpresaClientProps) {
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: tenant?.name || "",
    rut: tenant?.rut || "",
    email: tenant?.email || "",
    phone: tenant?.phone || "",
    timezone: tenant?.timezone || "America/Santiago",
  })

  const handleGuardar = async () => {
    setGuardando(true)
    setMensaje(null)
    try {
      const res = await fetch("/api/tenant/actualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setMensaje("✅ Datos actualizados")
      } else {
        setMensaje(`❌ ${data.error}`)
      }
    } catch {
      setMensaje("❌ Error de conexión")
    } finally {
      setGuardando(false)
    }
  }

  if (!tenant) {
    return <div className="p-5 md:p-8"><p className="text-foreground-secondary">No se encontraron datos del tenant</p></div>
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      <h1 className="font-display text-title font-bold text-foreground tracking-tight">
        Mi empresa
      </h1>

      {/* Suscripción */}
      {suscripcion && (
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <h2 className="font-display text-heading font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 size={18} strokeWidth={1.5} className="text-primary" />
            Suscripción
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="font-sans text-small text-foreground-secondary">Plan</p>
              <p className="font-display text-body font-semibold text-foreground">
                {suscripcion.Plan?.nombre || "Sin plan"}
              </p>
            </div>
            <div>
              <p className="font-sans text-small text-foreground-secondary">Estado</p>
              <p className="font-display text-body font-semibold text-foreground">
                {suscripcion.estado}
              </p>
            </div>
            <div>
              <p className="font-sans text-small text-foreground-secondary">Máx. colegios</p>
              <p className="font-display text-body font-semibold text-foreground">
                {suscripcion.Plan?.maxColegios ?? "Ilimitado"}
              </p>
            </div>
            <div>
              <p className="font-sans text-small text-foreground-secondary">Período</p>
              <p className="font-display text-body font-semibold text-foreground">
                {suscripcion.periodoFin
                  ? new Date(suscripcion.periodoFin).toLocaleDateString("es-CL")
                  : "Activa"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
        <h2 className="font-display text-heading font-semibold text-foreground">
          Datos de la empresa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">Nombre</label>
            <input
              type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">RUT</label>
            <input
              type="text" value={form.rut} placeholder="76.xxx.xxx-x"
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">Email</label>
            <input
              type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">Teléfono</label>
            <input
              type="tel" value={form.phone || ""} placeholder="+56 9 xxxx xxxx"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">Timezone</label>
            <select
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="America/Santiago">America/Santiago</option>
              <option value="America/Punta_Arenas">America/Punta_Arenas</option>
              <option value="Pacific/Easter">Pacific/Easter</option>
            </select>
          </div>
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">Slug</label>
            <p className="px-4 py-3 rounded-xl bg-foreground-disabled/10 border border-border font-sans text-body text-foreground-disabled">
              {tenant.slug} (no editable)
            </p>
          </div>
        </div>

        {mensaje && (
          <p className="font-sans text-small text-foreground">{mensaje}</p>
        )}

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          type="button"
        >
          {guardando ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : <Save size={18} strokeWidth={1.5} />}
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
