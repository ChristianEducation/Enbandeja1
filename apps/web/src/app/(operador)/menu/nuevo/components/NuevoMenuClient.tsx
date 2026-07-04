"use client"
// ═══════════════════════════════════════════════════════════════════
// NuevoMenuClient — Formulario para crear menú del día
// ═══════════════════════════════════════════════════════════════════
// Selección de fecha, colegio, opciones con precios por categoría
// Guardar como BORRADOR o PUBLICAR directamente
// ═══════════════════════════════════════════════════════════════════
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Loader2,
} from "@enbandeja/ui/icons"
import { formatCLP } from "@enbandeja/shared"

interface CategoriaPrecio {
  id: string
  nombre: string
  esDefault: boolean
}

interface ColegioOption {
  id: string
  nombre: string
}

interface OpcionForm {
  nombre: string
  descripcion: string
  categoria: string
  stockMax: string
  precios: Record<string, string> // categoriaPrecioId → precio
}

interface NuevoMenuClientProps {
  colegios: ColegioOption[]
  categorias: CategoriaPrecio[]
  fechaPreseleccionada: string
}

export function NuevoMenuClient({
  colegios,
  categorias,
  fechaPreseleccionada,
}: NuevoMenuClientProps) {
  const router = useRouter()
  const [fecha, setFecha] = useState(fechaPreseleccionada)
  const [colegioId, setColegioId] = useState(colegios[0]?.id || "")
  const [opciones, setOpciones] = useState<OpcionForm[]>([
    { nombre: "", descripcion: "", categoria: "", stockMax: "", precios: {} },
  ])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addOpcion = () => {
    setOpciones([
      ...opciones,
      { nombre: "", descripcion: "", categoria: "", stockMax: "", precios: {} } as OpcionForm,
    ])
  }

  const removeOpcion = (index: number) => {
    if (opciones.length <= 1) return
    setOpciones(opciones.filter((_, i) => i !== index))
  }

  const updateOpcion = (index: number, field: string, value: string) => {
    const updated = [...opciones]
    const item = updated[index]!
    ;(item as unknown as Record<string, unknown>)[field] = value
    setOpciones(updated)
  }

  const updatePrecio = (opcionIndex: number, catId: string, value: string) => {
    const updated = [...opciones]
    updated[opcionIndex] = {
      ...updated[opcionIndex]!,
      precios: { ...updated[opcionIndex]!.precios, [catId]: value },
    }
    setOpciones(updated)
  }

  const handleGuardar = async (publicar: boolean) => {
    setGuardando(true)
    setError(null)

    try {
      const body = {
        fecha,
        colegioId,
        estado: publicar ? "PUBLICADO" : "BORRADOR",
        opciones: opciones.map((op) => ({
          nombre: op.nombre,
          descripcion: op.descripcion || null,
          categoria: op.categoria || null,
          stockMax: op.stockMax ? parseInt(op.stockMax) : null,
          precios: Object.entries(op.precios).map(([categoriaPrecioId, precioStr]) => ({
            categoriaPrecioId,
            precio: parseInt(precioStr) || 0,
          })),
        })),
      }

      const res = await fetch("/api/menu/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Error al guardar")
        return
      }

      router.push("/operador/menu")
    } catch {
      setError("Error de conexión")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/operador/menu")}
          className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-4"
          type="button"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
          <span className="font-display text-small font-medium">Volver</span>
        </button>
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">
          Nuevo menú
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
          <p className="font-sans text-small text-warning">{error}</p>
        </div>
      )}

      {/* Fecha y colegio */}
      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
        <div>
          <label className="font-display text-small font-semibold text-foreground mb-1 block">
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        {colegios.length > 1 && (
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">
              Colegio
            </label>
            <select
              value={colegioId}
              onChange={(e) => setColegioId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {colegios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Opciones de menú */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-heading font-semibold text-foreground">
            Opciones del menú
          </h2>
          <button
            onClick={addOpcion}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-display text-small font-medium hover:bg-primary/20 transition-colors"
            type="button"
          >
            <Plus size={14} strokeWidth={1.5} />
            Agregar
          </button>
        </div>

        {opciones.map((op, index) => (
          <div
            key={index}
            className="rounded-xl bg-surface-glass border border-border p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-small font-semibold text-foreground-secondary">
                Opción {index + 1}
              </span>
              {opciones.length > 1 && (
                <button
                  onClick={() => removeOpcion(index)}
                  className="p-1.5 rounded-full hover:bg-danger/10 transition-colors"
                  type="button"
                >
                  <Trash2 size={16} strokeWidth={1.5} className="text-danger" />
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Nombre (ej: Pollo arroz)"
              value={op.nombre}
              onChange={(e) => updateOpcion(index, "nombre", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={op.descripcion}
              onChange={(e) => updateOpcion(index, "descripcion", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Categoría (ej: Principal)"
                value={op.categoria}
                onChange={(e) => updateOpcion(index, "categoria", e.target.value)}
                className="px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                type="number"
                placeholder="Stock máximo"
                value={op.stockMax}
                onChange={(e) => updateOpcion(index, "stockMax", e.target.value)}
                className="px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Precios por categoría */}
            {categorias.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <span className="font-display text-small font-semibold text-foreground-secondary">
                  Precios por categoría
                </span>
                {categorias.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="font-sans text-small text-foreground w-32 truncate">
                      {cat.nombre}
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={op.precios[cat.id] || ""}
                      onChange={(e) => updatePrecio(index, cat.id, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-background border border-border font-sans text-small text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <span className="font-sans text-small text-foreground-disabled">CLP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleGuardar(false)}
          disabled={guardando}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-glass border border-border font-display text-body font-semibold text-foreground hover:bg-surface-glass/80 transition-colors disabled:opacity-50"
          type="button"
        >
          <Save size={18} strokeWidth={1.5} />
          Guardar borrador
        </button>
        <button
          onClick={() => handleGuardar(true)}
          disabled={guardando}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          type="button"
        >
          {guardando ? (
            <Loader2 size={18} strokeWidth={2} className="animate-spin" />
          ) : (
            <Send size={18} strokeWidth={1.5} />
          )}
          Publicar
        </button>
      </div>
    </div>
  )
}
