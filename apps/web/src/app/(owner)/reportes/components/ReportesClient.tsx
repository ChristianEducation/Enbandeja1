"use client"
// ═══════════════════════════════════════════════════════════════════
// ReportesClient — Reportes y exportaciones avanzadas
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react"
import {
  FileText,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from "@enbandeja/ui/icons"

interface ReporteItem {
  id: string
  periodo: string
  tipo: string
  estado: string
  colegioNombre: string
  fileName: string | null
  fileSizeBytes: number | null
  generadoAt: string | null
  expiraAt: string | null
  createdAt: string
}

interface ReportesClientProps {
  colegios: { id: string; nombre: string }[]
  reportes: ReporteItem[]
}

const ESTADO_BADGE: Record<string, { label: string; color: string; icon: any }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-warning/16 text-warning", icon: Clock },
  GENERANDO: { label: "Generando", color: "bg-primary/16 text-primary", icon: Loader2 },
  LISTO: { label: "Listo", color: "bg-success/16 text-success", icon: CheckCircle2 },
  ERROR: { label: "Error", color: "bg-warning/16 text-warning", icon: XCircle },
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ReportesClient({ colegios, reportes }: ReportesClientProps) {
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [colegioId, setColegioId] = useState("")
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [lista, setLista] = useState(reportes)
  const [descargando, setDescargando] = useState<string | null>(null)

  const handleGenerar = async () => {
    setGenerando(true)
    setError(null)
    setMensaje(null)
    try {
      const res = await fetch("/api/reportes/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodo,
          colegioId: colegioId || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMensaje("✅ Reporte generado. Se descargará automáticamente.")
        // Refrescar lista
        const listRes = await fetch("/api/reportes/listar")
        const listData = await listRes.json()
        if (listData.success) setLista(listData.reportes)
        // Descargar automáticamente
        if (data.reporteId) {
          handleDescargar(data.reporteId)
        }
      } else {
        setError(data.error || "Error al generar")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setGenerando(false)
    }
  }

  const handleDescargar = async (reporteId: string) => {
    setDescargando(reporteId)
    try {
      const res = await fetch(`/api/reportes/descargar?reporteId=${reporteId}`)
      const data = await res.json()
      if (data.success && data.url) {
        window.open(data.url, "_blank")
      } else {
        setError(data.error || "Error al descargar")
      }
    } catch {
      setError("Error de conexión al descargar")
    } finally {
      setDescargando(null)
    }
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      <h1 className="font-display text-title font-bold text-foreground tracking-tight">
        Reportes
      </h1>

      {/* Formulario generar reporte */}
      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
        <h2 className="font-display text-heading font-semibold text-foreground flex items-center gap-2">
          <FileText size={18} strokeWidth={1.5} className="text-primary" />
          Generar reporte Excel
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Selector de período */}
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">
              Período (mes)
            </label>
            <input
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Selector de colegio */}
          <div>
            <label className="font-display text-small font-semibold text-foreground mb-1 block">
              Colegio
            </label>
            <select
              value={colegioId}
              onChange={(e) => setColegioId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Todos los colegios (consolidado)</option>
              {colegios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Botón generar */}
          <div className="flex items-end">
            <button
              onClick={handleGenerar}
              disabled={generando || !periodo}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-display text-body font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
              type="button"
            >
              {generando ? (
                <Loader2 size={18} strokeWidth={2} className="animate-spin" />
              ) : (
                <FileText size={18} strokeWidth={1.5} />
              )}
              {generando ? "Generando..." : "Generar reporte"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30">
            <AlertTriangle size={16} strokeWidth={1.5} className="text-warning" />
            <p className="font-sans text-small text-warning">{error}</p>
          </div>
        )}
        {mensaje && (
          <p className="font-sans text-small text-success">{mensaje}</p>
        )}
      </div>

      {/* Lista de reportes generados */}
      <div className="space-y-2">
        <h2 className="font-display text-heading font-semibold text-foreground">
          Reportes generados
        </h2>

        {lista.length === 0 ? (
          <div className="rounded-xl bg-surface-glass border border-border p-8 text-center">
            <FileText size={48} strokeWidth={1.5} className="text-foreground-disabled mx-auto mb-4" />
            <p className="font-sans text-body text-foreground-secondary">
              No hay reportes generados aún. Genera tu primer reporte arriba.
            </p>
          </div>
        ) : (
          lista.map((r) => {
            const badge = ESTADO_BADGE[r.estado] ?? ESTADO_BADGE.ERROR!
            const BadgeIcon: any = badge.icon
            return (
              <div
                key={r.id}
                className="rounded-xl bg-surface-glass border border-border p-4 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-body font-semibold text-foreground truncate">
                    {r.periodo} · {r.colegioNombre}
                  </p>
                  <p className="font-sans text-small text-foreground-secondary">
                    {formatFileSize(r.fileSizeBytes)}
                    {r.generadoAt && ` · Generado: ${new Date(r.generadoAt).toLocaleDateString("es-CL")}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-caption font-display font-semibold flex items-center gap-1 ${badge.color}`}>
                    <BadgeIcon
                      size={12}
                      strokeWidth={2}
                      className={r.estado === "GENERANDO" ? "animate-spin" : ""}
                    />
                    {badge.label}
                  </span>
                  {r.estado === "LISTO" && (
                    <button
                      onClick={() => handleDescargar(r.id)}
                      disabled={descargando === r.id}
                      className="p-2 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50"
                      type="button"
                    >
                      {descargando === r.id ? (
                        <Loader2 size={16} strokeWidth={2} className="animate-spin text-primary" />
                      ) : (
                        <Download size={16} strokeWidth={1.5} className="text-primary" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
