"use client"
// ═══════════════════════════════════════════════════════════════════
// TenantBillingClient — Panel de billing SaaS del Super Admin
// ═══════════════════════════════════════════════════════════════════
// Acciones: confirmar pago, cambiar plan, cancelar, reactivar.
// Toda acción va por API /api/super-admin/billing/*.
// BILLING SaaS (comercio → Enbandeja), NO pagos de apoderados.
// ═══════════════════════════════════════════════════════════════════
import React, { useState } from "react"
import Link from "next/link"
import {
  CreditCard, ArrowLeft, CheckCircle2, AlertTriangle, XCircle,
  Clock, Shield, TrendingUp, ArrowUpCircle, ArrowDownCircle,
  RefreshCw, Ban, Building2,
} from "@enbandeja/ui/icons"

// ── Types ──
interface TenantData {
  id: string; name: string; slug: string; email: string
  phone: string | null; status: string; timezone: string
}
interface PlanData {
  id: string; nombre: string; tipo: string
  precioMensual: number | null; precioAnual: number | null
  maxColegios: number | null; maxUsuarios: number | null
}
interface SuscripcionData {
  id: string; estado: string; tipo: string
  periodoInicio: string; periodoFin: string
  vencidoAt: string | null; suspendidoAt: string | null; canceladoAt: string | null
  plan: PlanData
}
interface PagoData {
  id: string; monto: number; metodo: string | null
  estado: string; referencia: string | null; createdAt: string
}
interface AuditData {
  id: string; action: string
  changes: Record<string, unknown> | null; createdAt: string
}

interface Props {
  tenant: TenantData
  suscripcion: SuscripcionData | null
  pagos: PagoData[]
  recursos: { colegiosActivos: number; usuariosActivos: number }
  planes: PlanData[]
  auditLogs: AuditData[]
}

function formatCLP(v: number | null): string {
  if (v === null) return "Cotizar"
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(v)
}

const ESTADO_CFG: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  ACTIVA: { label: "Activa", color: "bg-success/16 text-success", icon: CheckCircle2, desc: "Suscripción activa y operativa." },
  PERIODO_GRACIA: { label: "Gracia", color: "bg-warning/16 text-warning", icon: AlertTriangle, desc: "Vencida pero aún operativa. Regularizar pago." },
  SUSPENDIDA: { label: "Suspendida", color: "bg-warning/16 text-warning", icon: XCircle, desc: "Suspendida por falta de pago." },
  CANCELADA: { label: "Cancelada", color: "bg-foreground-disabled/16 text-foreground-tertiary", icon: XCircle, desc: "Suscripción cancelada." },
  ARCHIVADA: { label: "Archivada", color: "bg-foreground-disabled/16 text-foreground-tertiary", icon: Clock, desc: "Cuenta archivada." },
}

// ── Component ──
export function TenantBillingClient({
  tenant, suscripcion, pagos, recursos, planes, auditLogs,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Modal states
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCancelarModal, setShowCancelarModal] = useState(false)
  const [showReactivarModal, setShowReactivarModal] = useState(false)

  // Form states
  const [pagoMonto, setPagoMonto] = useState("")
  const [pagoTipo, setPagoTipo] = useState<"MENSUAL" | "ANUAL">("MENSUAL")
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [planTipo, setPlanTipo] = useState<"MENSUAL" | "ANUAL">("MENSUAL")
  const [cancelarConfirm, setCancelarConfirm] = useState("")
  const [reactivarPlanId, setReactivarPlanId] = useState("")
  const [reactivarTipo, setReactivarTipo] = useState<"MENSUAL" | "ANUAL">("MENSUAL")
  const [reactivarMonto, setReactivarMonto] = useState("")

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
      // Refresh page after short delay
      setTimeout(() => window.location.reload(), 1500)
      return data
    } catch {
      setError("Error de conexión")
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmarPago = () =>
    apiCall("/api/super-admin/billing/confirmar-pago", {
      tenantId: tenant.id,
      monto: parseInt(pagoMonto),
      tipo: pagoTipo,
      metodoPago: "MANUAL",
    })

  const handleCambiarPlan = () =>
    apiCall("/api/super-admin/billing/cambiar-plan", {
      tenantId: tenant.id,
      planId: selectedPlanId,
      tipo: planTipo,
    })

  const handleCancelar = () =>
    apiCall("/api/super-admin/billing/cancelar", {
      tenantId: tenant.id,
      confirmacion: cancelarConfirm,
    })

  const handleReactivar = () =>
    apiCall("/api/super-admin/billing/reactivar", {
      tenantId: tenant.id,
      planId: reactivarPlanId,
      tipo: reactivarTipo,
      monto: parseInt(reactivarMonto),
      metodoPago: "MANUAL",
    })

  const estadoCfg = suscripcion
    ? (ESTADO_CFG[suscripcion.estado] ?? ESTADO_CFG.CANCELADA!)
    : null
  const EstadoIcon = estadoCfg?.icon ?? XCircle
  const esActiva = suscripcion?.estado === "ACTIVA" || suscripcion?.estado === "PERIODO_GRACIA"
  const esCancelada = suscripcion?.estado === "CANCELADA" || suscripcion?.estado === "ARCHIVADA"

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/super-admin/tenants" className="p-2 rounded-xl hover:bg-surface-glass transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-foreground-secondary" />
        </Link>
        <div>
          <h1 className="font-display text-title font-bold text-foreground tracking-tight">
            {tenant.name}
          </h1>
          <p className="font-sans text-small text-foreground-secondary">
            {tenant.email} · {tenant.slug}
          </p>
        </div>
      </div>

      {/* Feedback */}
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

      {/* Sin suscripción */}
      {!suscripcion && (
        <div className="rounded-xl bg-warning/10 border border-warning/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-warning" />
            <p className="font-display text-heading font-semibold text-warning">Sin suscripción</p>
          </div>
          <p className="font-sans text-body text-foreground-secondary mb-4">
            Este tenant no tiene suscripción. Confirma un pago para activarla.
          </p>
          <button
            onClick={() => setShowPagoModal(true)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-display text-body font-semibold hover:bg-primary/90 transition-colors"
          >
            Confirmar pago manual
          </button>
        </div>
      )}

      {/* Estado de suscripción */}
      {suscripcion && estadoCfg && (
        <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-heading font-semibold text-foreground flex items-center gap-2">
              <CreditCard size={18} strokeWidth={1.5} className="text-primary" />
              Estado de suscripción
            </h2>
            <span className={`px-3 py-1 rounded-full text-small font-display font-semibold flex items-center gap-1 ${estadoCfg.color}`}>
              <EstadoIcon size={14} strokeWidth={2} />
              {estadoCfg.label}
            </span>
          </div>
          <p className="font-sans text-body text-foreground-secondary">{estadoCfg.desc}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
            <div>
              <p className="font-sans text-small text-foreground-secondary">Plan</p>
              <p className="font-display text-body font-semibold text-foreground">{suscripcion.plan.nombre}</p>
            </div>
            <div>
              <p className="font-sans text-small text-foreground-secondary">Ciclo</p>
              <p className="font-display text-body font-semibold text-foreground">{suscripcion.tipo === "MENSUAL" ? "Mensual" : "Anual"}</p>
            </div>
            <div>
              <p className="font-sans text-small text-foreground-secondary">Precio</p>
              <p className="font-display text-body font-semibold text-foreground">
                {suscripcion.tipo === "MENSUAL"
                  ? formatCLP(suscripcion.plan.precioMensual) + "/mes"
                  : formatCLP(suscripcion.plan.precioAnual) + "/año"}
              </p>
            </div>
            <div>
              <p className="font-sans text-small text-foreground-secondary">Vencimiento</p>
              <p className="font-display text-body font-semibold text-foreground">
                {new Date(suscripcion.periodoFin).toLocaleDateString("es-CL")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Límites */}
      {suscripcion && (
        <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
          <h2 className="font-display text-heading font-semibold text-foreground flex items-center gap-2">
            <Shield size={18} strokeWidth={1.5} className="text-primary" />
            Recursos vs límites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["colegios", "usuarios"] as const).map((metric) => {
              const actual = metric === "colegios" ? recursos.colegiosActivos : recursos.usuariosActivos
              const limite = metric === "colegios" ? suscripcion.plan.maxColegios : suscripcion.plan.maxUsuarios
              const excedido = limite !== null && actual > limite
              return (
                <div key={metric} className="rounded-xl bg-background border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-small text-foreground-secondary capitalize">{metric}</span>
                    {excedido && (
                      <span className="flex items-center gap-1 text-caption text-warning font-display font-semibold">
                        <AlertTriangle size={12} strokeWidth={2} /> Excedido
                      </span>
                    )}
                  </div>
                  <p className="font-display text-display font-bold text-foreground">
                    {actual}
                    <span className="font-sans text-body text-foreground-secondary font-normal"> / {limite ?? "∞"}</span>
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-foreground-disabled/20">
                    <div
                      className={`h-2 rounded-full ${excedido ? "bg-warning" : "bg-primary"}`}
                      style={{ width: limite ? `${Math.min((actual / limite) * 100, 100)}%` : "100%" }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-3">
        <h2 className="font-display text-heading font-semibold text-foreground">Acciones</h2>
        <div className="flex flex-wrap gap-2">
          {esActiva && (
            <>
              <button onClick={() => setShowPagoModal(true)} disabled={loading}
                className="px-4 py-2 rounded-xl bg-primary text-white font-display text-small font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                <CreditCard size={14} strokeWidth={2} /> Confirmar pago
              </button>
              <button onClick={() => setShowPlanModal(true)} disabled={loading}
                className="px-4 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-semibold text-foreground hover:bg-primary/10 transition-colors disabled:opacity-50 flex items-center gap-2">
                <ArrowUpCircle size={14} strokeWidth={2} /> Cambiar plan
              </button>
              <button onClick={() => setShowCancelarModal(true)} disabled={loading}
                className="px-4 py-2 rounded-xl bg-warning/10 border border-warning/30 font-display text-small font-semibold text-warning hover:bg-warning/20 transition-colors disabled:opacity-50 flex items-center gap-2">
                <Ban size={14} strokeWidth={2} /> Cancelar
              </button>
            </>
          )}
          {esCancelada && (
            <button onClick={() => setShowReactivarModal(true)} disabled={loading}
              className="px-4 py-2 rounded-xl bg-success/10 border border-success/30 font-display text-small font-semibold text-success hover:bg-success/20 transition-colors disabled:opacity-50 flex items-center gap-2">
              <RefreshCw size={14} strokeWidth={2} /> Reactivar
            </button>
          )}
          {suscripcion?.estado === "SUSPENDIDA" && (
            <>
              <button onClick={() => setShowPagoModal(true)} disabled={loading}
                className="px-4 py-2 rounded-xl bg-primary text-white font-display text-small font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                <CreditCard size={14} strokeWidth={2} /> Confirmar pago
              </button>
              <button onClick={() => setShowReactivarModal(true)} disabled={loading}
                className="px-4 py-2 rounded-xl bg-success/10 border border-success/30 font-display text-small font-semibold text-success hover:bg-success/20 transition-colors disabled:opacity-50 flex items-center gap-2">
                <RefreshCw size={14} strokeWidth={2} /> Reactivar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Historial de pagos */}
      <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
        <h2 className="font-display text-heading font-semibold text-foreground flex items-center gap-2">
          <TrendingUp size={18} strokeWidth={1.5} className="text-primary" />
          Historial de pagos
        </h2>
        {pagos.length === 0 ? (
          <p className="font-sans text-body text-foreground-secondary">Sin pagos registrados.</p>
        ) : (
          <div className="space-y-2">
            {pagos.map((p) => (
              <div key={p.id} className="rounded-xl bg-background border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-body font-semibold text-foreground">{formatCLP(p.monto)}</p>
                  <p className="font-sans text-small text-foreground-secondary">
                    {new Date(p.createdAt).toLocaleDateString("es-CL")}
                    {p.metodo && ` · ${p.metodo}`}
                    {p.referencia && ` · Ref: ${p.referencia}`}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-caption font-display font-semibold ${
                  p.estado === "CONFIRMADO" ? "bg-success/16 text-success" : "bg-foreground-disabled/16 text-foreground-secondary"
                }`}>
                  {p.estado === "CONFIRMADO" ? "Confirmado" : p.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log */}
      {auditLogs.length > 0 && (
        <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-4">
          <h2 className="font-display text-heading font-semibold text-foreground">Registro de acciones</h2>
          <div className="space-y-2">
            {auditLogs.map((a) => (
              <div key={a.id} className="rounded-xl bg-background border border-border p-3">
                <p className="font-display text-small font-semibold text-foreground">{a.action.replace(/_/g, " ")}</p>
                <p className="font-sans text-caption text-foreground-secondary">
                  {new Date(a.createdAt).toLocaleString("es-CL")}
                  {a.changes && ` · ${JSON.stringify(a.changes).slice(0, 80)}…`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MODALES ═══ */}

      {/* Modal: Confirmar Pago */}
      {showPagoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-surface-glass border border-border p-6 space-y-4">
            <h3 className="font-display text-heading font-bold text-foreground">Confirmar pago manual</h3>
            <div>
              <label className="font-sans text-small text-foreground-secondary">Monto (CLP)</label>
              <input type="number" value={pagoMonto} onChange={(e) => setPagoMonto(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:border-primary"
                placeholder="49000" />
            </div>
            <div>
              <label className="font-sans text-small text-foreground-secondary">Tipo</label>
              <select value={pagoTipo} onChange={(e) => setPagoTipo(e.target.value as "MENSUAL" | "ANUAL")}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:border-primary">
                <option value="MENSUAL">Mensual</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleConfirmarPago} disabled={loading || !pagoMonto}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-display text-small font-semibold hover:bg-primary/90 disabled:opacity-50">
                {loading ? "Procesando…" : "Confirmar pago"}
              </button>
              <button onClick={() => setShowPagoModal(false)} className="px-4 py-2.5 rounded-xl border border-border font-display text-small font-semibold text-foreground hover:bg-surface-glass">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-surface-glass border border-border p-6 space-y-4">
            <h3 className="font-display text-heading font-bold text-foreground">Cambiar plan</h3>
            <p className="font-sans text-small text-foreground-secondary">
              Upgrade: inmediato con prorrateo. Downgrade: al próximo ciclo.
            </p>
            <div>
              <label className="font-sans text-small text-foreground-secondary">Nuevo plan</label>
              <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:border-primary">
                <option value="">Seleccionar…</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id} disabled={suscripcion?.plan.id === p.id}>
                    {p.nombre} — {formatCLP(p.precioMensual)}/mes · {formatCLP(p.precioAnual)}/año
                    {p.maxColegios !== null ? ` · ${p.maxColegios} colegios` : " · ∞ colegios"}
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
              <button onClick={() => setShowPlanModal(false)} className="px-4 py-2.5 rounded-xl border border-border font-display text-small font-semibold text-foreground hover:bg-surface-glass">
                Cerrar
              </button>
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
              Esta acción cancelará la suscripción de <strong>{tenant.name}</strong>. El tenant dejará de operar inmediatamente.
            </p>
            <p className="font-sans text-small text-warning font-semibold">
              Escribe &ldquo;CANCELAR&rdquo; para confirmar:
            </p>
            <input type="text" value={cancelarConfirm} onChange={(e) => setCancelarConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-warning/30 font-sans text-body text-foreground focus:outline-none focus:border-warning"
              placeholder='Escribe CANCELAR' />
            <div className="flex gap-2">
              <button onClick={handleCancelar} disabled={loading || cancelarConfirm !== "CANCELAR"}
                className="flex-1 px-4 py-2.5 rounded-xl bg-warning text-white font-display text-small font-semibold hover:bg-warning/90 disabled:opacity-50">
                {loading ? "Procesando…" : "Cancelar suscripción"}
              </button>
              <button onClick={() => { setShowCancelarModal(false); setCancelarConfirm("") }}
                className="px-4 py-2.5 rounded-xl border border-border font-display text-small font-semibold text-foreground hover:bg-surface-glass">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reactivar */}
      {showReactivarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-surface-glass border border-border p-6 space-y-4">
            <h3 className="font-display text-heading font-bold text-success">Reactivar suscripción</h3>
            <div>
              <label className="font-sans text-small text-foreground-secondary">Plan</label>
              <select value={reactivarPlanId} onChange={(e) => setReactivarPlanId(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:border-primary">
                <option value="">Seleccionar…</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} — {formatCLP(p.precioMensual)}/mes</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-sans text-small text-foreground-secondary">Ciclo</label>
              <select value={reactivarTipo} onChange={(e) => setReactivarTipo(e.target.value as "MENSUAL" | "ANUAL")}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:border-primary">
                <option value="MENSUAL">Mensual</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>
            <div>
              <label className="font-sans text-small text-foreground-secondary">Monto pago (CLP)</label>
              <input type="number" value={reactivarMonto} onChange={(e) => setReactivarMonto(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:border-primary"
                placeholder="49000" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleReactivar} disabled={loading || !reactivarPlanId || !reactivarMonto}
                className="flex-1 px-4 py-2.5 rounded-xl bg-success text-white font-display text-small font-semibold hover:bg-success/90 disabled:opacity-50">
                {loading ? "Procesando…" : "Reactivar"}
              </button>
              <button onClick={() => setShowReactivarModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border font-display text-small font-semibold text-foreground hover:bg-surface-glass">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
