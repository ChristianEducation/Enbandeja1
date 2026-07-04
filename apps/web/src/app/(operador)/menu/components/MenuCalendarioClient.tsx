"use client"
// ═══════════════════════════════════════════════════════════════════
// MenuCalendarioClient — Calendario de menús del operador
// ═══════════════════════════════════════════════════════════════════
// Muestra calendario del mes con indicadores de estado por día
// Permite navegar a crear/editar menú
// Botón "copiar semana anterior"
// ═══════════════════════════════════════════════════════════════════
import React, { useState } from "react"
import Link from "next/link"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
} from "date-fns"
import { es } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  CalendarDays,
} from "@enbandeja/ui/icons"
import type { MenuCalendario } from "../page"

// Colores de estado para el calendario
const ESTADO_DOT: Record<string, string> = {
  BORRADOR: "bg-warning",
  PUBLICADO: "bg-success",
  CERRADO: "bg-foreground-disabled",
  ARCHIVADO: "bg-foreground-tertiary",
}

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: "Borrador",
  PUBLICADO: "Publicado",
  CERRADO: "Cerrado",
  ARCHIVADO: "Archivado",
}

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

interface MenuCalendarioClientProps {
  menus: MenuCalendario[]
  colegios: { id: string; nombre: string }[]
  timezone: string
}

export function MenuCalendarioClient({
  menus,
  colegios,
  timezone,
}: MenuCalendarioClientProps) {
  const [mesActual, setMesActual] = useState(new Date())
  const [copiando, setCopiando] = useState(false)
  const [mensajeCopia, setMensajeCopia] = useState<string | null>(null)

  // Construir mapa de menús por fecha
  const menuMap: Record<string, MenuCalendario> = {}
  for (const m of menus) {
    menuMap[m.fecha] = m
  }

  // Días del mes
  const inicioMes = startOfMonth(mesActual)
  const finMes = endOfMonth(mesActual)
  const diasDelMes = eachDayOfInterval({ start: inicioMes, end: finMes })
  const primerDiaSemana = getDay(inicioMes)
  // Ajustar para empezar en lunes (0=lunes)
  const offsetLunes = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1

  const handleCopiarSemana = async () => {
    setCopiando(true)
    setMensajeCopia(null)
    try {
      const res = await fetch("/api/menu/copiar-semana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.success) {
        setMensajeCopia(`✅ ${data.copiados} menús copiados`)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMensajeCopia(`❌ ${data.error}`)
      }
    } catch {
      setMensajeCopia("❌ Error de conexión")
    } finally {
      setCopiando(false)
    }
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-title font-bold text-foreground tracking-tight">
            Gestión de menús
          </h1>
          <p className="font-sans text-body text-foreground-secondary mt-1">
            Administra los menús del casino
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopiarSemana}
            disabled={copiando}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
            type="button"
          >
            <Copy size={16} strokeWidth={1.5} />
            Copiar semana
          </button>
          <Link
            href="/operador/menu/nuevo"
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-small font-semibold hover:bg-primary-hover transition-colors"
          >
            <Plus size={16} strokeWidth={1.5} />
            Nuevo menú
          </Link>
        </div>
      </div>

      {/* Mensaje de copia */}
      {mensajeCopia && (
        <div className="p-3 rounded-xl bg-surface-glass border border-border font-sans text-small text-foreground">
          {mensajeCopia}
        </div>
      )}

      {/* Leyenda de estados */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(ESTADO_LABEL).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${ESTADO_DOT[key]}`} />
            <span className="font-sans text-small text-foreground-secondary">{label}</span>
          </div>
        ))}
      </div>

      {/* Navegación del mes */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMesActual(subMonths(mesActual, 1))}
          className="p-2 rounded-xl hover:bg-surface-glass transition-colors"
          type="button"
        >
          <ChevronLeft size={20} strokeWidth={1.5} className="text-foreground-secondary" />
        </button>
        <h2 className="font-display text-heading font-semibold text-foreground capitalize">
          {format(mesActual, "MMMM yyyy", { locale: es })}
        </h2>
        <button
          onClick={() => setMesActual(addMonths(mesActual, 1))}
          className="p-2 rounded-xl hover:bg-surface-glass transition-colors"
          type="button"
        >
          <ChevronRight size={20} strokeWidth={1.5} className="text-foreground-secondary" />
        </button>
      </div>

      {/* Calendario grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Headers */}
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center font-display text-small font-medium text-foreground-secondary py-2">
            {d}
          </div>
        ))}

        {/* Espacios vacíos antes del primer día */}
        {Array.from({ length: offsetLunes }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Días del mes */}
        {diasDelMes.map((dia) => {
          const fechaStr = format(dia, "yyyy-MM-dd")
          const menu = menuMap[fechaStr]
          const esHoy = isSameDay(dia, new Date())

          return (
            <Link
              key={fechaStr}
              href={menu ? `/operador/menu/${fechaStr}` : `/operador/menu/nuevo?fecha=${fechaStr}`}
              className={`relative flex flex-col items-center py-3 rounded-xl transition-all duration-200 hover:bg-surface-glass ${
                esHoy ? "ring-2 ring-primary/40" : ""
              }`}
            >
              <span className={`font-display text-body font-semibold ${esHoy ? "text-primary" : "text-foreground"}`}>
                {format(dia, "d")}
              </span>
              {menu && (
                <div className={`h-1.5 w-1.5 rounded-full mt-1 ${ESTADO_DOT[menu.estado] || "bg-foreground-disabled"}`} />
              )}
            </Link>
          )
        })}
      </div>

      {/* Lista de menús del mes */}
      {menus.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-heading font-semibold text-foreground">
            Menús del mes
          </h3>
          {menus.map((menu) => (
            <Link
              key={menu.id}
              href={`/operador/menu/${menu.fecha}`}
              className="flex items-center justify-between p-4 rounded-xl bg-surface-glass border border-border hover:bg-surface-glass/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CalendarDays size={18} strokeWidth={1.5} className="text-foreground-secondary" />
                <div>
                  <p className="font-display text-body font-semibold text-foreground capitalize">
                    {format(parseISO(menu.fecha), "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="font-sans text-small text-foreground-secondary">
                    {menu.opcionesCount} opción{menu.opcionesCount !== 1 ? "es" : ""}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-caption font-display font-semibold ${
                  menu.estado === "PUBLICADO"
                    ? "bg-success/16 text-success"
                    : menu.estado === "BORRADOR"
                    ? "bg-warning/16 text-warning"
                    : "bg-foreground-disabled/16 text-foreground-tertiary"
                }`}
              >
                {ESTADO_LABEL[menu.estado] || menu.estado}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
