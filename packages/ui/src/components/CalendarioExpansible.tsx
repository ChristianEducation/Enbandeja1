"use client"

// ═══════════════════════════════════════════════════════════════════
// CalendarioExpansible — Calendario Samsung-style (Zona A mobile)
// ═══════════════════════════════════════════════════════════════════
// Patrón: swipe-down expande de semana a mes completo
// Micro-líneas bajo cada número (NO texto bajo días)
// Material: Liquid Glass con border inferior
// Fuente: Plus Jakarta Sans (font-display)
// Estilos: Tailwind CSS con tokens del design-system
// ═══════════════════════════════════════════════════════════════════

import React, { useCallback, useRef, useState } from "react"
import { calendarioIndicadores } from "../lib/design-system"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "../icons"

// ───────────────────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────────────────

export type EstadoDia = "pedido" | "disponible" | "proximo-corte" | null

export interface CalendarioExpansibleProps {
  /** Día seleccionado actualmente (ISO date string YYYY-MM-DD) */
  diaSeleccionado: string
  /** Callback al seleccionar un día */
  onDiaSeleccionado: (fecha: string) => void
  /** Mapa de fecha → estado del día para las micro-líneas */
  estadosPorDia: Record<string, EstadoDia>
}

// ───────────────────────────────────────────────────────────────────
// UTILIDADES DE FECHA
// ───────────────────────────────────────────────────────────────────

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"] as const
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const

function parseFecha(fecha: string): Date {
  const partes = fecha.split("-").map(Number)
  const y = partes[0] ?? 0
  const m = partes[1] ?? 1
  const d = partes[2] ?? 1
  return new Date(y, m - 1, d)
}

function formatFecha(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getHoy(): string {
  return formatFecha(new Date())
}

/** Retorna el lunes de la semana que contiene `date` */
function getLunesSemana(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Genera 7 días a partir de `lunes` */
function getSemana(lunes: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    return d
  })
}

/** Genera todas las semanas de un mes */
function getSemanasMes(year: number, month: number): Date[][] {
  const primerDia = new Date(year, month, 1)
  const lunesInicio = getLunesSemana(primerDia)
  const semanas: Date[][] = []
  let current = lunesInicio

  while (semanas.length <= 6) {
    semanas.push(getSemana(current))
    const siguiente = new Date(current)
    siguiente.setDate(current.getDate() + 7)
    if (siguiente.getMonth() !== month && current.getMonth() !== month) break
    current = siguiente
  }

  return semanas
}

// ───────────────────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────────────────

export function CalendarioExpansible({
  diaSeleccionado,
  onDiaSeleccionado,
  estadosPorDia,
}: CalendarioExpansibleProps) {
  const [expandido, setExpandido] = useState(false)
  const [semanaOffset, setSemanaOffset] = useState(0)
  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date()
    return { year: hoy.getFullYear(), month: hoy.getMonth() }
  })

  // Touch tracking para swipe vertical
  const touchStartY = useRef(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches[0]) touchStartY.current = e.touches[0].clientY
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0]
      if (!touch) return
      const deltaY = touch.clientY - touchStartY.current
      if (deltaY > 40 && !expandido) setExpandido(true)
      else if (deltaY < -40 && expandido) setExpandido(false)
    },
    [expandido]
  )

  const hoy = getHoy()
  const fechaSeleccionada = parseFecha(diaSeleccionado)

  // Vista compacta: semana con offset
  const lunesActual = getLunesSemana(new Date())
  const lunesOffset = new Date(lunesActual)
  lunesOffset.setDate(lunesActual.getDate() + semanaOffset * 7)
  const diasSemana = getSemana(lunesOffset)

  // Vista expandida: mes completo
  const semanasMes = getSemanasMes(mesActual.year, mesActual.month)

  // Color de micro-línea según estado
  const getMicroLineColor = (estado: EstadoDia): string | null => {
    if (estado === "pedido") return calendarioIndicadores.pedidoConfirmado
    if (estado === "disponible") return calendarioIndicadores.disponible
    if (estado === "proximo-corte") return calendarioIndicadores.cercaCorte
    return null
  }

  // Render de un día
  const renderDia = (date: Date) => {
    const fecha = formatFecha(date)
    const esHoy = fecha === hoy
    const seleccionado = fecha === diaSeleccionado
    const estado = estadosPorDia[fecha] ?? null
    const pasado = fecha < hoy
    const microColor = getMicroLineColor(estado)

    return (
      <button
        key={fecha}
        onClick={() => !pasado && onDiaSeleccionado(fecha)}
        disabled={pasado}
        type="button"
        className={`
          relative flex flex-col items-center justify-center
          w-10 h-11 mx-auto rounded-xl
          transition-all duration-200 ease-out border
          ${seleccionado
            ? "border-white/30 bg-primary/8"
            : esHoy
              ? "bg-surface border-transparent"
              : "border-transparent"
          }
          ${pasado ? "opacity-40 cursor-default" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            font-display text-[15px] leading-none
            ${seleccionado
              ? "text-primary font-bold"
              : pasado
                ? "text-foreground-disabled font-medium"
                : "text-foreground font-medium"
            }
          `}
        >
          {date.getDate()}
        </span>
        {/* Micro-línea de estado */}
        {microColor && !pasado && (
          <span
            className="absolute bottom-1 left-[15%] w-[70%] h-[2px] rounded-sm"
            style={{ backgroundColor: microColor }}
          />
        )}
      </button>
    )
  }

  return (
    <div
      className="
        bg-surface-glass
        border-b border-border-subtle rounded-xl
        p-4 mx-5 select-none overflow-hidden
      "
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        maxHeight: expandido ? 350 : 120,
        transition: "max-height 300ms cubic-bezier(0, 0, 0.2, 1)",
      }}
    >
      {/* Header con mes/semana y navegación */}
      <div className="flex items-center mb-3">
        <div className="flex-1 flex items-center justify-between">
          {expandido ? (
            <>
              <button
                onClick={() =>
                  setMesActual((m) =>
                    m.month === 0
                      ? { year: m.year - 1, month: 11 }
                      : { year: m.year, month: m.month - 1 }
                  )
                }
                className="p-2 text-primary hover:text-primary-hover transition-colors"
                type="button"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
              <span className="font-display text-subheading font-semibold text-foreground tracking-tight">
                {MESES[mesActual.month]} {mesActual.year}
              </span>
              <button
                onClick={() =>
                  setMesActual((m) =>
                    m.month === 11
                      ? { year: m.year + 1, month: 0 }
                      : { year: m.year, month: m.month + 1 }
                  )
                }
                className="p-2 text-primary hover:text-primary-hover transition-colors"
                type="button"
                aria-label="Mes siguiente"
              >
                <ChevronRight size={20} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setSemanaOffset((o) => o - 1)}
                className="p-2 text-primary hover:text-primary-hover transition-colors"
                type="button"
                aria-label="Semana anterior"
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
              <span className="font-display text-subheading font-semibold text-foreground tracking-tight">
                {MESES[fechaSeleccionada.getMonth()]} {fechaSeleccionada.getFullYear()}
              </span>
              <button
                onClick={() => setSemanaOffset((o) => o + 1)}
                className="p-2 text-primary hover:text-primary-hover transition-colors"
                type="button"
                aria-label="Semana siguiente"
              >
                <ChevronRight size={20} strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Encabezados de días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS_SEMANA.map((d) => (
          <span
            key={d}
            className="font-display text-caption font-medium text-foreground-tertiary text-center"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Vista compacta: 1 semana */}
      {!expandido && (
        <div className="grid grid-cols-7">
          {diasSemana.map((date) => renderDia(date))}
        </div>
      )}

      {/* Vista expandida: mes completo */}
      {expandido && (
        <div className="max-h-[240px] overflow-y-auto">
          {semanasMes.map((semana, i) => (
            <div key={i} className="grid grid-cols-7">
              {semana.map((date) => renderDia(date))}
            </div>
          ))}
        </div>
      )}

      {/* Toggle de expansión */}
      <button
        onClick={() => setExpandido((prev) => !prev)}
        className="flex items-center justify-center w-full pt-1.5"
        type="button"
        aria-label={expandido ? "Contraer calendario" : "Expandir calendario"}
      >
        {expandido ? (
          <ChevronUp size={16} strokeWidth={1.5} className="text-foreground-tertiary" />
        ) : (
          <ChevronDown size={16} strokeWidth={1.5} className="text-foreground-tertiary" />
        )}
      </button>
    </div>
  )
}
