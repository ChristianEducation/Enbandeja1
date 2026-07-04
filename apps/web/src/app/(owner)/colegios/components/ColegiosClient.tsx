"use client"
// ═══════════════════════════════════════════════════════════════════
// ColegiosClient — Gestión de colegios del tenant
// ═══════════════════════════════════════════════════════════════════
import React, { useState } from "react"
import { Plus, Edit3, Store, Loader2, AlertTriangle } from "@enbandeja/ui/icons"

interface ColegioItem {
  id: string
  nombre: string
  codigoCasino: string
  direccion: string | null
  horaCorte: string
  kioscoActivo: boolean
  isActive: boolean
}

interface ColegiosClientProps {
  colegios: ColegioItem[]
  colegiosActivos: number
  maxColegios: number | null
  planNombre: string
}

export function ColegiosClient({ colegios, colegiosActivos, maxColegios, planNombre }: ColegiosClientProps) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    horaCorte: "09:00",
    kioscoActivo: false,
  })

  const limiteAlcanzado = maxColegios !== null && colegiosActivos >= maxColegios

  const resetForm = () => {
    setForm({ nombre: "", direccion: "", horaCorte: "09:00", kioscoActivo: false })
    setEditando(null)
    setMostrarForm(false)
    setError(null)
  }

  const handleGuardar = async () => {
    setGuardando(true)
    setError(null)

    if (!editando && limiteAlcanzado) {
      setError(`Has alcanzado el límite de ${maxColegios} colegios del plan ${planNombre}. Actualiza tu plan para agregar más.`)
      setGuardando(false)
      return
    }

    try {
      const url = editando ? "/api/colegios/actualizar" : "/api/colegios/crear"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editando || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        resetForm()
        window.location.reload()
      } else {
        setError(data.error || "Error al guardar")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (colegio: ColegioItem) => {
    setForm({
      nombre: colegio.nombre,
      direccion: colegio.direccion || "",
      horaCorte: colegio.horaCorte,
      kioscoActivo: colegio.kioscoActivo,
    })
    setEditando(colegio.id)
    setMostrarForm(true)
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-title font-bold text-foreground tracking-tight">Colegios</h1>
          <p className="font-sans text-body text-foreground-secondary mt-1">
            {colegiosActivos} activo{colegiosActivos !== 1 ? "s" : ""}
            {maxColegios ? ` de ${maxColegios}` : ""} · Plan {planNombre}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setMostrarForm(true) }}
          disabled={limiteAlcanzado}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-small font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          type="button"
        >
          <Plus size={16} strokeWidth={1.5} />
          Agregar colegio
        </button>
      </div>

      {/* Aviso límite */}
      {limiteAlcanzado && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30">
          <AlertTriangle size={18} strokeWidth={1.5} className="text-warning" />
          <p className="font-sans text-small text-warning">
            Has alcanzado el límite de {maxColegios} colegios. Actualiza tu plan para agregar más.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
          <p className="font-sans text-small text-warning">{error}</p>
        </div>
      )}

      {/* Formulario */}
      {mostrarForm && (
        <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-3">
          <h3 className="font-display text-heading font-semibold text-foreground">
            {editando ? "Editar colegio" : "Nuevo colegio"}
          </h3>
          <input
            type="text" placeholder="Nombre del colegio" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="text" placeholder="Dirección (opcional)" value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-display text-small font-semibold text-foreground mb-1 block">Hora de corte</label>
              <input
                type="time" value={form.horaCorte}
                onChange={(e) => setForm({ ...form, horaCorte: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.kioscoActivo}
                  onChange={(e) => setForm({ ...form, kioscoActivo: e.target.checked })}
                  className="w-5 h-5 rounded border-border"
                />
                <span className="font-sans text-body text-foreground">Kiosco activo</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGuardar} disabled={guardando}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-small font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
              type="button"
            >
              {guardando ? <Loader2 size={14} strokeWidth={2} className="animate-spin" /> : null}
              Guardar
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors"
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de colegios */}
      <div className="space-y-2">
        {colegios.map((colegio) => (
          <div
            key={colegio.id}
            className={`rounded-xl bg-surface-glass border border-border p-4 flex items-center gap-4 ${!colegio.isActive ? "opacity-50" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-display text-body font-semibold text-foreground truncate">{colegio.nombre}</p>
              <p className="font-sans text-small text-foreground-secondary">
                Código: {colegio.codigoCasino} · Corte: {colegio.horaCorte}
                {colegio.kioscoActivo ? " · Kiosco ✅" : ""}
              </p>
              {colegio.direccion && (
                <p className="font-sans text-small text-foreground-secondary truncate">{colegio.direccion}</p>
              )}
            </div>
            <button
              onClick={() => handleEditar(colegio)}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              type="button"
            >
              <Edit3 size={16} strokeWidth={1.5} className="text-primary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
