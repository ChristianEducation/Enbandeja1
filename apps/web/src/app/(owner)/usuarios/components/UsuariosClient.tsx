"use client"
// ═══════════════════════════════════════════════════════════════════
// UsuariosClient — Gestión de usuarios internos e invitaciones
// ═══════════════════════════════════════════════════════════════════
import React, { useState } from "react"
import { Plus, Users, Mail, Loader2, Clock } from "@enbandeja/ui/icons"
import type { UsuarioInterno, InvitacionItem } from "../page"

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  OWNER: { label: "Owner", color: "bg-primary/16 text-primary" },
  OPERADOR: { label: "Operador", color: "bg-success/16 text-success" },
  COCINA: { label: "Cocina", color: "bg-warning/16 text-warning" },
  APODERADO: { label: "Apoderado", color: "bg-foreground-disabled/16 text-foreground-secondary" },
}

const INVITATION_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-warning/16 text-warning" },
  ACCEPTED: { label: "Aceptada", color: "bg-success/16 text-success" },
  EXPIRED: { label: "Expirada", color: "bg-foreground-disabled/16 text-foreground-tertiary" },
  CANCELLED: { label: "Cancelada", color: "bg-danger/16 text-danger" },
}

interface UsuariosClientProps {
  usuarios: UsuarioInterno[]
  invitaciones: InvitacionItem[]
  colegios: { id: string; nombre: string }[]
}

export function UsuariosClient({ usuarios, invitaciones, colegios }: UsuariosClientProps) {
  const [mostrarInvitar, setMostrarInvitar] = useState(false)
  const [invitando, setInvitando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: "",
    role: "OPERADOR",
    colegioId: "",
  })

  const handleInvitar = async () => {
    setInvitando(true)
    setError(null)
    try {
      const res = await fetch("/api/invitaciones/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setMostrarInvitar(false)
        setForm({ email: "", role: "OPERADOR", colegioId: "" })
        window.location.reload()
      } else {
        setError(data.error || "Error al invitar")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setInvitando(false)
    }
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-title font-bold text-foreground tracking-tight">Usuarios</h1>
          <p className="font-sans text-body text-foreground-secondary mt-1">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} en el tenant
          </p>
        </div>
        <button
          onClick={() => { setMostrarInvitar(true); setError(null) }}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-small font-semibold hover:bg-primary-hover transition-colors"
          type="button"
        >
          <Plus size={16} strokeWidth={1.5} />
          Invitar usuario
        </button>
      </div>

      {/* Formulario invitar */}
      {mostrarInvitar && (
        <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-3">
          <h3 className="font-display text-heading font-semibold text-foreground flex items-center gap-2">
            <Mail size={18} strokeWidth={1.5} className="text-primary" />
            Invitar usuario
          </h3>
          <input
            type="email" placeholder="Email del usuario" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="OPERADOR">Operador</option>
              <option value="COCINA">Cocina</option>
            </select>
            {colegios.length > 0 && (
              <select
                value={form.colegioId}
                onChange={(e) => setForm({ ...form, colegioId: e.target.value })}
                className="px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Sin colegio específico</option>
                {colegios.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            )}
          </div>
          {error && <p className="font-sans text-small text-warning">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={handleInvitar} disabled={invitando}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-small font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
              type="button"
            >
              {invitando ? <Loader2 size={14} strokeWidth={2} className="animate-spin" /> : null}
              Enviar invitación
            </button>
            <button
              onClick={() => setMostrarInvitar(false)}
              className="px-4 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors"
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div>
        <h2 className="font-display text-heading font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users size={18} strokeWidth={1.5} className="text-primary" />
          Usuarios actuales
        </h2>
        <div className="space-y-2">
          {usuarios.map((u) => {
            const roleToken = ROLE_LABELS[u.role] || { label: u.role, color: "bg-foreground-disabled/16 text-foreground-secondary" }
            return (
              <div key={u.id} className="rounded-xl bg-surface-glass border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-body font-semibold text-foreground">{u.nombre || "Sin nombre"}</p>
                  <p className="font-sans text-small text-foreground-secondary">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.colegioNombre && (
                    <span className="font-sans text-small text-foreground-secondary">{u.colegioNombre}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-caption font-display font-semibold ${roleToken.color}`}>
                    {roleToken.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invitaciones */}
      {invitaciones.length > 0 && (
        <div>
          <h2 className="font-display text-heading font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock size={18} strokeWidth={1.5} className="text-foreground-secondary" />
            Invitaciones
          </h2>
          <div className="space-y-2">
            {invitaciones.map((inv) => {
              const statusToken = INVITATION_STATUS[inv.status] || { label: inv.status, color: "bg-foreground-disabled/16 text-foreground-tertiary" }
              return (
                <div key={inv.id} className="rounded-xl bg-surface-glass border border-border p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-body font-semibold text-foreground">{inv.email}</p>
                    <p className="font-sans text-small text-foreground-secondary">
                      {(ROLE_LABELS[inv.role]?.label || inv.role)}
                      {inv.colegioNombre ? ` · ${inv.colegioNombre}` : ""}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-caption font-display font-semibold ${statusToken.color}`}>
                    {statusToken.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
