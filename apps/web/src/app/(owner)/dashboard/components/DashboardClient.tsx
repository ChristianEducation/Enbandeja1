"use client"
// ═══════════════════════════════════════════════════════════════════
// DashboardClient — Dashboard del Owner con KpiSnapshot
// ═══════════════════════════════════════════════════════════════════
// Cards de métricas + gráficos Recharts
// Vista consolidada de TODOS los colegios
// Drill-down: selector de colegio → vista por colegio
// ═══════════════════════════════════════════════════════════════════

import React from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  ArrowLeft,
} from "@enbandeja/ui/icons"
import type { LucideIcon } from "@enbandeja/ui/icons"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts"

// ─── Tipos ────────────────────────────────────────────────────────

interface ConsolidadoDia {
  fecha: string
  totalPedidos: number
  totalPagados: number
  totalCancelados: number
  totalExpirados: number
  totalRetirados: number
  totalNoRetirados: number
  totalIngresos: number
  totalCreditos: number
  ticketPromedio: number
  porColegio: {
    colegioId: string
    colegioNombre: string
    totalPedidos: number
    totalPagados: number
    totalIngresos: number
    totalRetirados: number
    totalNoRetirados: number
    ticketPromedio: number
  }[]
}

interface SnapshotColegio {
  fecha: string
  totalPedidos: number
  totalPagados: number
  totalCancelados: number
  totalExpirados: number
  totalRetirados: number
  totalNoRetirados: number
  totalIngresos: number
  totalCreditos: number
  ticketPromedio: number
  distribucionOpciones: Record<string, number>
  distribucionKiosco: Record<string, number>
}

interface DashboardClientProps {
  consolidado: ConsolidadoDia[] | null
  snapshotsColegio: SnapshotColegio[] | null
  colegios: { id: string; nombre: string }[]
  colegioSeleccionado: string | null
  colegioNombre: string
  rangoDesde: string
  rangoHasta: string
}

// ─── Helper ───────────────────────────────────────────────────────

function formatCLP(valor: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor)
}

function formatDateCorto(fecha: string): string {
  const parts = fecha.split("-")
  if (parts.length !== 3) return fecha
  return `${parts[2]}/${parts[1]}`
}

// ─── Componente ───────────────────────────────────────────────────

export function DashboardClient({
  consolidado,
  snapshotsColegio,
  colegios,
  colegioSeleccionado,
  colegioNombre,
  rangoDesde,
  rangoHasta,
}: DashboardClientProps) {
  const router = useRouter()

  const datos = colegioSeleccionado ? snapshotsColegio : consolidado
  const esConsolidado = !colegioSeleccionado

  if (!datos || datos.length === 0) {
    return (
      <div className="p-5 md:p-8 space-y-6">
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">
          Dashboard
        </h1>
        <div className="rounded-xl bg-surface-glass border border-border p-8 text-center">
          <BarChart3 size={48} strokeWidth={1.5} className="text-foreground-disabled mx-auto mb-4" />
          <p className="font-display text-heading font-semibold text-foreground">
            Sin datos aún
          </p>
          <p className="font-sans text-body text-foreground-secondary mt-2 max-w-md mx-auto">
            Los datos del dashboard se generan automáticamente cada hora.
            Cuando tengas pedidos procesados, las métricas aparecerán aquí.
          </p>
        </div>
      </div>
    )
  }

  // Último día disponible para las cards
  const ultimo = datos[datos.length - 1]!
  // Totales del período
  const totalPeriodo = datos.reduce(
    (acc, d) => ({
      pedidos: acc.pedidos + d.totalPedidos,
      pagados: acc.pagados + d.totalPagados,
      ingresos: acc.ingresos + d.totalIngresos,
      retirados: acc.retirados + d.totalRetirados,
      noRetirados: acc.noRetirados + d.totalNoRetirados,
    }),
    { pedidos: 0, pagados: 0, ingresos: 0, retirados: 0, noRetirados: 0 }
  )

  // Datos para gráfico de ingresos
  const chartData = datos.map((d) => ({
    fecha: formatDateCorto(d.fecha),
    Ingresos: d.totalIngresos,
    Pedidos: d.totalPagados,
  }))

  // Datos para gráfico de comparativa por colegio (solo consolidado)
  const comparativaColegios = esConsolidado && consolidado
    ? consolidado
        .flatMap((d) => d.porColegio)
        .reduce<Record<string, { nombre: string; ingresos: number; pedidos: number }>>(
          (acc, c) => {
            const entry = acc[c.colegioId] ?? { nombre: c.colegioNombre, ingresos: 0, pedidos: 0 }
            entry.ingresos += c.totalIngresos
            entry.pedidos += c.totalPagados
            acc[c.colegioId] = entry
            return acc
          },
          {} as Record<string, { nombre: string; ingresos: number; pedidos: number }>
        )
    : null

  const comparativaData = comparativaColegios
    ? Object.values(comparativaColegios)
    : []

  // Distribución de opciones (solo vista colegio)
  const distribucionOpciones = !esConsolidado && snapshotsColegio
    ? snapshotsColegio.reduce<Record<string, number>>((acc, s) => {
        for (const [nombre, cant] of Object.entries(s.distribucionOpciones)) {
          acc[nombre] = (acc[nombre] || 0) + cant
        }
        return acc
      }, {})
    : null

  const distribucionData = distribucionOpciones
    ? Object.entries(distribucionOpciones)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
    : []

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-title font-bold text-foreground tracking-tight">
            {esConsolidado ? "Dashboard" : colegioNombre}
          </h1>
          <p className="font-sans text-body text-foreground-secondary mt-1">
            {formatDateCorto(rangoDesde)} — {formatDateCorto(rangoHasta)} ·{" "}
            {datos.length} días con datos
          </p>
        </div>

        {/* Selector de colegio */}
        <div className="flex items-center gap-2">
          {colegioSeleccionado && (
            <button
              onClick={() => router.push("/owner/dashboard")}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors"
              type="button"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              Todos
            </button>
          )}
          <select
            value={colegioSeleccionado || ""}
            onChange={(e) => {
              const val = e.target.value
              router.push(val ? `/owner/dashboard?colegioId=${val}` : "/owner/dashboard")
            }}
            className="px-4 py-2 rounded-xl bg-surface-glass border border-border font-sans text-small text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos los colegios</option>
            {colegios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de métricas del último día */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={DollarSign}
          label="Ingresos hoy"
          value={formatCLP(ultimo.totalIngresos)}
          accent="primary"
        />
        <MetricCard
          icon={ShoppingCart}
          label="Pedidos hoy"
          value={`${ultimo.totalPagados}`}
          sublabel={`${ultimo.totalPedidos} total`}
          accent="primary"
        />
        <MetricCard
          icon={Users}
          label="Retirados"
          value={`${ultimo.totalRetirados}`}
          sublabel={`${ultimo.totalNoRetirados} pendientes`}
          accent={ultimo.totalNoRetirados > 0 ? "warning" : "primary"}
        />
        <MetricCard
          icon={TrendingUp}
          label="Ticket prom."
          value={formatCLP(ultimo.ticketPromedio)}
          accent="primary"
        />
      </div>

      {/* Cards de métricas del período */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={DollarSign}
          label="Ingresos período"
          value={formatCLP(totalPeriodo.ingresos)}
          accent="primary"
          compact
        />
        <MetricCard
          icon={ShoppingCart}
          label="Pedidos período"
          value={`${totalPeriodo.pagados}`}
          accent="primary"
          compact
        />
        <MetricCard
          icon={Package}
          label="Retirados período"
          value={`${totalPeriodo.retirados}`}
          sublabel={`${totalPeriodo.noRetirados} pend.`}
          accent="primary"
          compact
        />
        <MetricCard
          icon={TrendingUp}
          label="Ticket prom. período"
          value={formatCLP(
            totalPeriodo.pagados > 0
              ? Math.round(totalPeriodo.ingresos / totalPeriodo.pagados)
              : 0
          )}
          accent="primary"
          compact
        />
      </div>

      {/* Gráfico de tendencia ingresos */}
      <div className="rounded-xl bg-surface-glass border border-border p-5">
        <h2 className="font-display text-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 size={18} strokeWidth={1.5} className="text-primary" />
          Tendencia de ingresos
        </h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="fecha"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1D2E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value, name) => {
                  const v = Number(value)
                  const n = String(name)
                  return [n === "Ingresos" ? formatCLP(v) : v, n]
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Ingresos"
                stroke="#3B5BFE"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de pedidos por día */}
      <div className="rounded-xl bg-surface-glass border border-border p-5">
        <h2 className="font-display text-heading font-semibold text-foreground mb-4">
          Pedidos por día
        </h2>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="fecha"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1D2E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="Pedidos" fill="#3B5BFE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativa por colegio (solo vista consolidada) */}
      {esConsolidado && comparativaData.length > 1 && (
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <h2 className="font-display text-heading font-semibold text-foreground mb-4">
            Comparativa por colegio
          </h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  type="number"
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1D2E",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value, name) => {
                    const v = Number(value)
                    const n = String(name)
                    return [n === "ingresos" ? formatCLP(v) : v, n === "ingresos" ? "Ingresos" : "Pedidos"]
                  }}
                />
                <Bar dataKey="ingresos" fill="#3B5BFE" radius={[0, 4, 4, 0]} name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Links de drill-down */}
          <div className="mt-4 space-y-2">
            {colegios.map((c) => {
              const cData = comparativaColegios ? comparativaColegios[c.id] : undefined
              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/owner/dashboard?colegioId=${c.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
                  type="button"
                >
                  <span className="font-display text-body font-semibold text-foreground">
                    {c.nombre}
                  </span>
                  {cData && (
                    <span className="font-sans text-small text-foreground-secondary">
                      {formatCLP(cData.ingresos)} · {cData.pedidos} pedidos
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Distribución de opciones (solo vista colegio) */}
      {!esConsolidado && distribucionData.length > 0 && (
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <h2 className="font-display text-heading font-semibold text-foreground mb-4">
            Distribución por opción de menú
          </h2>
          <div className="space-y-2">
            {distribucionData.map(({ nombre, cantidad }) => (
              <div
                key={nombre}
                className="flex items-center justify-between p-3 rounded-xl bg-background border border-border"
              >
                <span className="font-display text-body font-medium text-foreground">
                  {nombre}
                </span>
                <span className="font-sans text-body font-semibold text-primary">
                  {cantidad} pedidos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent = "primary",
  compact = false,
}: {
  icon: LucideIcon
  label: string
  value: string
  sublabel?: string
  accent?: "primary" | "warning"
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-xl bg-surface-glass border border-border ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon
          size={compact ? 14 : 18}
          strokeWidth={1.5}
          className={accent === "warning" ? "text-warning" : "text-primary"}
        />
        <span className="font-sans text-small text-foreground-secondary">{label}</span>
      </div>
      <p
        className={`font-display ${compact ? "text-heading" : "text-display"} font-bold text-foreground tracking-tight`}
      >
        {value}
      </p>
      {sublabel && (
        <p className="font-sans text-caption text-foreground-secondary mt-0.5">{sublabel}</p>
      )}
    </div>
  )
}
