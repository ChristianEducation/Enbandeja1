"use client"
// ═══════════════════════════════════════════════════════════════════
// FormComensal — Formulario reutilizable para crear comensal
// ═══════════════════════════════════════════════════════════════════
// Extraído de onboarding/comensal-form.tsx (Semana 4).
// Reutilizable en:
//   - /onboarding/comensal (con props de onboarding)
//   - /perfil drawer (Semana 7)
//
// REGLA: NO permite editar categoriaPrecio (eso lo hace el operador).
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react"
import { crearComensalSchema } from "@enbandeja/shared"

const vinculoOptions = [
  { value: "PADRE", label: "Padre" },
  { value: "MADRE", label: "Madre" },
  { value: "ADULTO_RESPONSABLE", label: "Adulto responsable" },
  { value: "ESTUDIANTE", label: "Estudiante (yo mismo)" },
] as const

interface FormComensalProps {
  colegioId: string
  colegioNombre?: string
  onSuccess?: () => void
  submitLabel?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function FormComensal({
  colegioId,
  colegioNombre = "tu colegio",
  onSuccess,
  submitLabel = "Vincular comensal",
  showBackButton = false,
  onBack,
}: FormComensalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const raw = {
      colegioId,
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      curso: formData.get("curso") as string,
      nivel: (formData.get("nivel") as string) || undefined,
      vinculo: formData.get("vinculo") as string,
    }

    const parsed = crearComensalSchema.safeParse(raw)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0])
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/comensales/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setGlobalError(data.error ?? "Error al crear el comensal")
        return
      }
      onSuccess?.()
    } catch {
      setGlobalError("Error de conexión. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {colegioNombre && (
        <div className="space-y-2">
          <h3 className="font-display text-heading font-semibold text-foreground">
            Datos del comensal
          </h3>
          <p className="font-sans text-body text-foreground-secondary">
            Ingresa los datos de tu hijo/a en{" "}
            <span className="text-foreground font-medium">{colegioNombre}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vínculo */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-comensal-vinculo"
            className="block font-sans text-small text-foreground-secondary"
          >
            Tu relación
          </label>
          <select
            id="form-comensal-vinculo"
            name="vinculo"
            required
            className="flex h-12 w-full rounded-xl bg-surface border border-border px-4 py-2 font-sans text-body text-foreground focus:outline-none focus:border-primary focus:shadow-glow-primary transition-all duration-200 appearance-none"
            defaultValue=""
          >
            <option value="" disabled className="bg-surface text-foreground-tertiary">
              Selecciona...
            </option>
            {vinculoOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface">
                {opt.label}
              </option>
            ))}
          </select>
          {errors.vinculo && (
            <p className="font-sans text-small text-warning">{errors.vinculo}</p>
          )}
        </div>

        {/* Nombre */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-comensal-nombre"
            className="block font-sans text-small text-foreground-secondary"
          >
            Nombre
          </label>
          <input
            id="form-comensal-nombre"
            name="nombre"
            type="text"
            autoComplete="given-name"
            required
            className="flex h-12 w-full rounded-xl bg-surface border border-border px-4 py-2 font-sans text-body text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:shadow-glow-primary transition-all duration-200"
            placeholder="Nombre del comensal"
          />
          {errors.nombre && (
            <p className="font-sans text-small text-warning">{errors.nombre}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-comensal-apellido"
            className="block font-sans text-small text-foreground-secondary"
          >
            Apellido
          </label>
          <input
            id="form-comensal-apellido"
            name="apellido"
            type="text"
            autoComplete="family-name"
            required
            className="flex h-12 w-full rounded-xl bg-surface border border-border px-4 py-2 font-sans text-body text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:shadow-glow-primary transition-all duration-200"
            placeholder="Apellido del comensal"
          />
          {errors.apellido && (
            <p className="font-sans text-small text-warning">{errors.apellido}</p>
          )}
        </div>

        {/* Curso */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-comensal-curso"
            className="block font-sans text-small text-foreground-secondary"
          >
            Curso
          </label>
          <input
            id="form-comensal-curso"
            name="curso"
            type="text"
            required
            className="flex h-12 w-full rounded-xl bg-surface border border-border px-4 py-2 font-sans text-body text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:shadow-glow-primary transition-all duration-200"
            placeholder="Ej: 6°B"
          />
          {errors.curso && (
            <p className="font-sans text-small text-warning">{errors.curso}</p>
          )}
        </div>

        {/* Nivel (opcional) */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-comensal-nivel"
            className="block font-sans text-small text-foreground-secondary"
          >
            Nivel <span className="text-foreground-tertiary">(opcional)</span>
          </label>
          <input
            id="form-comensal-nivel"
            name="nivel"
            type="text"
            className="flex h-12 w-full rounded-xl bg-surface border border-border px-4 py-2 font-sans text-body text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary focus:shadow-glow-primary transition-all duration-200"
            placeholder="Ej: Básica, Media"
          />
        </div>

        {/* Error global */}
        {globalError && (
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
            <p className="font-sans text-small text-warning">{globalError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 h-12 font-display font-semibold text-body text-primary-foreground hover:bg-primary-hover hover:shadow-glow-primary active:bg-primary-pressed disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creando...
            </>
          ) : (
            submitLabel
          )}
        </button>

        {/* Back */}
        {showBackButton && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-transparent border border-border px-6 h-12 font-display font-semibold text-body text-foreground hover:bg-surface transition-all duration-200"
          >
            ← Volver
          </button>
        )}
      </form>
    </div>
  )
}
