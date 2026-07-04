"use client"

import React, { useState, useRef } from "react"
import { Users, Download, Upload, CheckCircle2, Loader2, AlertTriangle } from "@enbandeja/ui/icons"
import { useRouter } from "next/navigation"

interface Props {
  colegios: { id: string; nombre: string }[]
  comensalesCount: number
}

export function ComensalesSetupClient({ colegios, comensalesCount }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ creados: number; errores: string[] } | null>(null)

  const handleDescargarPlantilla = () => {
    // Generar CSV plantilla
    const csv = "nombre,apellido,curso,colegio\nJuan,Pérez,1° Básico A," + (colegios[0]?.nombre || "Nombre del colegio")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla-comensales.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSubir = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError("Selecciona un archivo"); return }
    setSubiendo(true)
    setError(null)
    setResultado(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/setup/importar-comensales", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setResultado({ creados: data.creados || 0, errores: data.errores || [] })
      } else {
        setError(data.error || "Error al importar")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setSubiendo(false)
    }
  }

  const handleContinuar = async () => {
    await fetch("/api/setup/avanzar-paso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paso: "comensalesCargados" }),
    })
    router.push("/setup/categorias")
  }

  const handleSkip = async () => {
    await fetch("/api/setup/avanzar-paso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paso: "comensalesCargados" }),
    })
    router.push("/setup/categorias")
  }

  return (
    <div className="p-5 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users size={24} strokeWidth={1.5} className="text-primary" />
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            Importar comensales
          </h2>
          <p className="font-sans text-body text-foreground-secondary">
            Sube una lista de alumnos para que los apoderados puedan vincularse.
            Actualmente tienes {comensalesCount} comensales.
          </p>
        </div>
      </div>

      {/* Descargar plantilla */}
      <button onClick={handleDescargarPlantilla} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-glass border border-border font-display text-body font-medium text-foreground hover:bg-primary/10 transition-colors" type="button">
        <Download size={18} strokeWidth={1.5} />
        Descargar plantilla CSV
      </button>

      {/* Subir archivo */}
      <div className="space-y-3">
        <label className="font-display text-small font-semibold text-foreground mb-1 block">
          Archivo CSV con comensales
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground"
        />
        <button onClick={handleSubir} disabled={subiendo} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50" type="button">
          {subiendo ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : <Upload size={18} strokeWidth={1.5} />}
          {subiendo ? "Importando..." : "Importar comensales"}
        </button>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="rounded-xl bg-success/10 border border-success/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} strokeWidth={1.5} className="text-success" />
            <p className="font-display text-body font-semibold text-success">
              {resultado.creados} comensales importados
            </p>
          </div>
          {resultado.errores.length > 0 && (
            <div className="space-y-1">
              {resultado.errores.slice(0, 5).map((err, i) => (
                <p key={i} className="font-sans text-small text-warning flex items-center gap-1">
                  <AlertTriangle size={12} strokeWidth={2} /> {err}
                </p>
              ))}
              {resultado.errores.length > 5 && (
                <p className="font-sans text-small text-foreground-secondary">
                  ...y {resultado.errores.length - 5} errores más
                </p>
              )}
            </div>
          )}
          <button onClick={handleContinuar} className="mt-2 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors" type="button">
            Continuar
          </button>
        </div>
      )}

      {error && <p className="font-sans text-small text-warning">{error}</p>}

      {/* Skip */}
      <div className="border-t border-border pt-3">
        <button onClick={handleSkip} className="w-full px-4 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors" type="button">
          Importar más tarde
        </button>
      </div>
    </div>
  )
}
