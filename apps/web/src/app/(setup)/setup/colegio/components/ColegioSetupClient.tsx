"use client"

import React, { useState } from "react"
import { Loader2, Store, CheckCircle2 } from "@enbandeja/ui/icons"
import { useRouter } from "next/navigation"

interface Props {
  colegioExistente: { id: string; nombre: string; codigoCasino: string } | null
}

export function ColegioSetupClient({ colegioExistente }: Props) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nombre, setNombre] = useState(colegioExistente?.nombre || "")
  const [creado, setCreado] = useState(!!colegioExistente)

  const handleCrear = async () => {
    if (!nombre) { setError("El nombre es obligatorio"); return }
    setGuardando(true)
    setError(null)
    try {
      const res = await fetch("/api/colegios/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, horaCorte: "09:00" }),
      })
      const data = await res.json()
      if (data.success) {
        // Marcar paso
        await fetch("/api/setup/avanzar-paso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paso: "primerColegio" }),
        })
        setCreado(true)
      } else {
        setError(data.error || "Error al crear colegio")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setGuardando(false)
    }
  }

  const handleContinuar = async () => {
    if (!colegioExistente && !creado) return
    router.push("/setup/pasarela")
  }

  return (
    <div className="p-5 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Store size={24} strokeWidth={1.5} className="text-primary" />
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            Tu primer colegio
          </h2>
          <p className="font-sans text-body text-foreground-secondary">
            Agrega el colegio donde operarás.
          </p>
        </div>
      </div>

      {creado && colegioExistente ? (
        <div className="rounded-xl bg-success/10 border border-success/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} strokeWidth={1.5} className="text-success" />
            <p className="font-display text-heading font-semibold text-success">Colegio creado</p>
          </div>
          <p className="font-sans text-body text-foreground">{colegioExistente.nombre}</p>
          <p className="font-sans text-small text-foreground-secondary mt-1">
            Código casino: <span className="font-mono text-foreground">{colegioExistente.codigoCasino}</span>
          </p>
          <button onClick={handleContinuar} className="mt-4 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors" type="button">
            Continuar
          </button>
        </div>
      ) : creado ? (
        <div className="rounded-xl bg-success/10 border border-success/30 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} strokeWidth={1.5} className="text-success" />
            <p className="font-display text-heading font-semibold text-success">¡Colegio creado!</p>
          </div>
          <button onClick={handleContinuar} className="mt-4 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors" type="button">
            Continuar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">Nombre del colegio *</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Colegio San Esteban" className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          {error && <p className="font-sans text-small text-warning">{error}</p>}
          <button onClick={handleCrear} disabled={guardando} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50" type="button">
            {guardando ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : null}
            Crear colegio
          </button>
        </div>
      )}
    </div>
  )
}
