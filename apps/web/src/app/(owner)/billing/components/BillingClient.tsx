"use client"
// ═══════════════════════════════════════════════════════════════════
// BillingClient — Estado de suscripción, historial, cambio de plan,
// cancelación voluntaria. Panel /owner/billing.
// ═══════════════════════════════════════════════════════════════════
import React, { useState } from "react"
import {
  CreditCard, AlertTriangle, CheckCircle2, Clock, XCircle,
  Shield, TrendingUp, ArrowUpCircle, ArrowDownCircle, Ban,
} from "@enbandeja/ui/icons"

interface PlanData {
  nombre: string
  tipo: string
  maxColegios: number | null
  maxUsuarios: number | null
  precioMensual: number | null
  precioAnual: number | null
}

interface SuscripcionData {
  estado: string
  tipo: string
  periodoInicio: string
  periodoFin: string
  vencidoAt: string | null
  suspendidoAt: string | null
  canceladoAt: string | null
  plan: PlanData
}

interface PagoData {
  id: string
  monto: number
  metodo: string | null
  estado: string
  referencia: string | null
  createdAt: string
}

interface LimitesData {
  maxColegios: number | null
  maxUsuarios: number | null
  planNombre: string
  estado: string | null
}

interface BillingClientProps {
  suscripcion: SuscripcionData | null
  pagos: PagoData[]
  limites: LimitesData
  recursos: { colegiosActivos: number; usuariosActivos: number }
  planes: { id: string; nombre: string; tipo: string; precioMensual: number | null; precioAnual: number | null; maxColegios: number | null; maxUsuarios: number | null }[]
}

function formatCLP(valor: number | null): string {
  if (valor === null) return "Cotizar"
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(valor)
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  ACTIVA: { label: "Activa", color: "bg-success/16 text-success", icon: CheckCircle2, desc: "Tu suscripción está activa." },
  PERIODO_GRACIA: { label: "Período de gracia", color: "bg-warning/16 text-warning", icon: AlertTriangle, desc: "Tu suscripción venció. Tienes tiempo para regularizar el pago." },
  SUSPENDIDA: { label: "Suspendida", color: "bg-warning/16 text-warning", icon: XCircle, desc: "Tu suscripción está suspendida por falta de pago. Contacta al equipo Enbandeja." },
  CANCELADA: { label: "Cancelada", color: "bg-foreground-disabled/16 text-foreground-secondary", icon: XCircle, desc: "Tu suscripción fue cancelada." },
  ARCHIVADA: { label: "Archivada", color: "bg-foreground-disabled/16 text-foreground-tertiary", icon: Clock, desc: "Esta cuenta está archivada." },
}

export function BillingClient({ suscripcion, pagos, limites, recursos, planes }: BillingClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCancelarModal, setShowCancelarModal] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [planTipo, setPlanTipo] = useState<"MENSUAL" | "ANUAL">("MENSUAL")
  const [cancelarConfirm, setCancelarConfirm] = useState("")

  const clearFeedback = () => { setError(null); setSuccessMsg(null) }

  async function apiCall(url: string, body: Record<string, unknown>) {
    setLoading(true); clearFeedback()
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || "Error desconocido")
        return null
      }
      setSuccessMsg(data.mensaje || "Operación exitosa")
      setTimeout(() => window.location.reload(), 2000)
      return data
    } catch {
      setError("Error de conexión")
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarPlan = () =>
    apiCall("/api/billing/cambiar-plan", { planId: selectedPlanId, tipo: planTipo })

  const handleCancelar = () =>
    apiCall("/api/billing/cancelar", { confirmacion: cancelarConfirm })

  if (!suscripcion) {
    return (
      <div className="p-5 md:p-8 space-y-6">
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">Suscripción</h1>
        <div className="rounded-xl bg-warning/10 border border-warning/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} strokeWidth={1.5} className="text-warning" />
            <p className="font-display text-heading font-semibold text-warning">Sin suscripción</p>
          </div>
          <p className="font-sans text-body text-foreground-secondary">
            No tienes una suscripción activa. Contacta al equipo Enbandeja para activar tu plan.
          </p>
        </div>
      </div>
    )
  }

  const estado = ESTADO_CONFIG[suscripcion.estado] ?? ESTADO_CONFIG.CANCELADA!
  const EstadoIcon = estado.icon
  const esActiva = suscripcion.estado === "ACTIVA" || suscripcion.estado === "PERIODO_GRACIA"
  const limiteColegios = limites.maxColegios
  const limiteUsuarios = limites.maxUsuarios
  const sobreLimiteColegios = limiteColegios !== null && recursos.colegiosActivos > limiteColegios
  const sobreLimiteUsuarios = limiteUsuarios !== null && recursos.usuariosActivos > limiteUsuarios

  return (
    <div className="p-5 md:p-8 space-y-6">
      <h1 className="font-display text-title font-bold text-foreground tracking-tight">Suscripción</h1>

      {error && (
        <div className="rounded-xl bg-warning/10 border border-warning/30 p-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning" />
          <p className="font-sans text-small text-warning">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-success/10 border border-success/30 p-4 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-success" />
          <p className="font-sans text-small text-success">{successMsg}</p>
        </div>
      )}

      {/* Estado */}
      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-heading font-semibold text-foreground flex items-center gap-2">
            <CreditCard size={18} strokeWidth={1.5} className="text-primary" /> Estado
          </h2>
          <span className={`px-3 py-1 rounded-full text-small font-display font-semibold flex items-center gap-1 ${estado.color}`}>
            <EstadoIcon size={14} strokeWidth={2} /> {estado.label}
          </span>
        </div>
        <p className="font-sans text-body text-foreground-secondary">{estado.desc}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
          <div><p className="font-sans text-small text-foreground-secondary">Plan</p><p className="font-display text-body font-semibold text-foreground">{suscripcion.plan.nombre}</p></div>
          <div><p className="font-sans text-small text-foreground-secondary">Ciclo</p><p className="font-display text-body font-semibold text-foreground">{suscripcion.tipo === "MENSUAL" ? "Mensual" : "Anual"}</p></div>
          <div><p className="font-sans text-small text-foreground-secondary">Precio</p><p className="font-display text-body font-semibold text-foreground">{suscripcion.tipo === "MENSUAL" ? formatCLP(suscripcion.plan.precioMensual) + "/mes" : formatCLP(suscripcion.plan.precioAnual) + "/año"}</p></div>
          <div><p className="font-sans text-small text-foreground-secondary">Vencimiento</p><p className="font-display text-body font-semibold text-foreground">{new Date(suscripcion.periodoFin).toLocaleDateString("es-CL")}</p></div>
        </div>
      </div>

      {/* Límites */}
      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
        <h2 className="font-display text-heading font-semibold text-foreground flex items-center gap-2"><Shield size={18} strokeWidth={1.5} className="text-primary" /> Límites del plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["colegios", "usuarios"] as const).map((metric) => {
            const actual = metric === "colegios" ? recursos.colegiosActivos : recursos.usuariosActivos
            const limite = metric === "colegios" ? limiteColegios : limiteUsuarios
            const excedido = metric === "colegios" ? sobreLimiteColegios : sobreLimiteUsuarios
            return (
              <div key={metric} className="rounded-xl bg-background border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-small text-foreground-secondary capitalize">{metric}</span>
                  {excedido && <span className="flex items-center gap-1 text-caption text-warning font-display font-semibold"><AlertTriangle size={12} strokeWidth={2} /> Excedido</span>}
                </div>
                <p className="font-display text-display font-bold text-foreground">{actual}<span className="font-sans text-body text-foreground-secondary font-normal"> / {limite ?? "∞"}</span></p>
                <div className="mt-2 h-2 rounded-full bg-foreground-disabled/20"><div className={`h-2 rounded-full ${excedido ? "bg-warning" : "bg-primary"}`} style={{ width: limite ? `${Math.min((actual / limite) * 100, 100)}%` : "100%" }} /></div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Acciones owner */}
      {esActiva && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowPlanModal(true)} disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-primary text-white font-display text-small font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            <ArrowUpCircle size={14} strokeWidth={2} /> Cambiar plan
          </button>
          <button onClick={() => setShowCancelarModal(true)} disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/30 font-display text-small font-semibold text-warning hover:bg-warning/20 disabled:opacity-50 flex items-center gap-2">
            <Ban size={14} strokeWidth={2} /> Cancelar suscripción
          </button>
        </div>
      )}

      {/* Historial de pagos */}
      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
        <h2 className="font-display text-heading font-semibold text-foreground flex items-center gap-2"><TrendingUp size={18} strokeWidth={1.5} className="text-primary" /> Historial de pagos</h2>
        {pagos.length === 0 ? (
          <p className="font-sans text-body text-foreground-secondary">No hay pagos registrados aún.</p>
        ) : (
          <div className="space-y-2">
            {pagos.map((p) => (
              <div key={p.id} className="rounded-xl bg-background border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-body font-semibold text-foreground">{formatCLP(p.monto)}</p>
                  <p className="font-sans text-small text-foreground-secondary">{new Date(p.createdAt).toLocaleDateString("es-CL")}{p.metodo && ` · ${p.metodo}`}{p.referencia && ` · Ref: ${p.referencia}`}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-caption font-display font-semibold ${p.estado === "CONFIRMADO" ? "bg-success/16 text-success" : "bg-foreground-disabled/16 text-foreground-secondary"}`}>{p.estado === "CONFIRMADO" ? "Confirmado" : p.estado}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Cambiar Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-surface-glass border border-border p-6 space-y-4">
            <h3 className="font-display text-heading font-bold text-foreground">Cambiar plan</h3>
            <p className="font-sans text-small text-foreground-secondary">Upgrade: inmediato con prorrateo. Downgrade: al próximo ciclo.</p>
            <div>
              <label className="font-sans text-small text-foreground-secondary">Nuevo plan</label>
              <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:border-primary">
                <option value="">Seleccionar…</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id} disabled={suscripcion.plan.nombre === p.nombre}>
                    {p.nombre} — {formatCLP(p.precioMensual)}/mes · {formatCLP(p.precioAnual)}/año
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-sans text-small text-foreground-secondary">Ciclo</label>
              <select value={planTipo} onChange={(e) => setPlanTipo(e.target.value as "MENSUAL" | "ANUAL")}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:border-primary">
                <option value="MENSUAL">Mensual</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCambiarPlan} disabled={loading || !selectedPlanId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-display text-small font-semibold hover:bg-primary/90 disabled:opacity-50">
                {loading ? "Procesando…" : "Cambiar plan"}
              </button>
              <button onClick={() => setShowPlanModal(false)} className="px-4 py-2.5 rounded-xl border border-border font-display text-small font-semibold text-foreground hover:bg-surface-glass">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancelar — requiere "CANCELAR" literal */}
      {showCancelarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-surface-glass border border-border p-6 space-y-4">
            <h3 className="font-display text-heading font-bold text-warning">Cancelar suscripción</h3>
            <p className="font-sans text-body text-foreground-secondary">
              Esta acción cancelará tu suscripción. Los operadores y owners serán bloqueados. Los apoderados pueden seguir operando.
            </p>
            <p className="font-sans text-small text-warning font-semibold">
              Escribe &ldquo;CANCELAR&rdquo; para confirmar:
            </p>
            <input type="text" value={cancelarConfirm} onChange={(e) => setCancelarConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-warning/30 font-sans text-body text-foreground focus:outline-none focus:border-warning"
              placeholder="Escribe CANCELAR" />
            <div className="flex gap-2">
              <button onClick={handleCancelar} disabled={loading || cancelarConfirm !== "CANCELAR"}
                className="flex-1 px-4 py-2.5 rounded-xl bg-warning text-white font-display text-small font-semibold hover:bg-warning/90 disabled:opacity-50">
                {loading ? "Procesando…" : "Cancelar suscripción"}
              </button>
              <button onClick={() => { setShowCancelarModal(false); setCancelarConfirm("") }}
                className="px-4 py-2.5 rounded-xl border border-border font-display text-small font-semibold text-foreground hover:bg-surface-glass">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
