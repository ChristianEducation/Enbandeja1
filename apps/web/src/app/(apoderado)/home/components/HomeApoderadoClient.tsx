"use client"

// ═══════════════════════════════════════════════════════════════════
// HomeApoderadoClient — Panel principal del apoderado (Client Component)
// ═══════════════════════════════════════════════════════════════════
// Estructura Master-Detail con 3 zonas:
// Zona A: CalendarioExpansible (semana/mes Samsung-style)
// Zona B: Scroll vertical con selector de comensal + Bento Grid del menú
// Zona C: Floating Cart placeholder
//
// Regla: NO importa @enbandeja/database ni lucide-react directamente.
// Íconos desde @enbandeja/ui/icons. Utilidades desde @enbandeja/shared.
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react"
import {
  CalendarioExpansible,
  type EstadoDia,
  BentoCardMenu,
} from "@enbandeja/ui"
import {
  CalendarX,
  ShoppingBag,
  CheckCircle2,
  Clock,
} from "@enbandeja/ui/icons"
import {
  formatCLP,
  formatFechaLarga,
  pasadoHoraCorte,
} from "@enbandeja/shared"

// ───────────────────────────────────────────────────────────────────
// TIPOS (coinciden con los del Server Component page.tsx)
// ───────────────────────────────────────────────────────────────────

import type {
  ComensalConColegio,
  DatosDia,
  OpcionConPrecio,
} from "../page"

// ───────────────────────────────────────────────────────────────────
// PROPS
// ───────────────────────────────────────────────────────────────────

export interface HomeApoderadoClientProps {
  comensales: ComensalConColegio[]
  datosPorDia: DatosDia[]
}

// ───────────────────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────────────────

export function HomeApoderadoClient({
  comensales,
  datosPorDia,
}: HomeApoderadoClientProps) {
  const timezone = comensales[0]?.colegio.timezone ?? "America/Santiago"

  const [diaSeleccionado, setDiaSeleccionado] = useState(() => {
    // Hoy en formato YYYY-MM-DD
    const ahora = new Date()
    const y = ahora.getFullYear()
    const m = String(ahora.getMonth() + 1).padStart(2, "0")
    const d = String(ahora.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  })

  const [comensalActivo, setComensalActivo] = useState(
    comensales[0]?.id ?? null
  )

  // Carrito local (estado React, NO se persiste — Semana 6)
  const [itemsCarrito, setItemsCarrito] = useState<
    Array<{
      opcionMenuId: string
      comensalId: string
      nombre: string
      precio: number
    }>
  >([])

  // ── Datos del día seleccionado ──
  const datosDia = datosPorDia.find((d) => d.fecha === diaSeleccionado)
  const menu = datosDia?.menu ?? null
  const pedido = datosDia?.pedido ?? null

  // Comensal activo
  const comensalActual = comensales.find((c) => c.id === comensalActivo)

  // Kiosco activo del colegio
  const kioscoActivo = comensalActual?.colegio.kioscoActivo ?? false

  // Hora de corte pasada?
  const cortePasado = comensalActual
    ? pasadoHoraCorte(comensalActual.colegio.horaCorte, timezone)
    : false

  // ── Estados del calendario ──
  const estadosPorDia = useMemo(() => {
    const map: Record<string, EstadoDia> = {}

    for (const dia of datosPorDia) {
      if (
        dia.pedido &&
        ["PENDIENTE_PAGO", "PAGADO"].includes(dia.pedido.estado)
      ) {
        map[dia.fecha] = "pedido"
      } else if (dia.menu) {
        // Verificar si está próximo a hora de corte (< 2h)
        const comensal = comensales[0]
        if (comensal) {
          const yaPaso = pasadoHoraCorte(
            comensal.colegio.horaCorte,
            timezone
          )
          if (yaPaso) {
            map[dia.fecha] = "proximo-corte"
          } else {
            // Verificar si queda menos de 2h para la hora de corte
            const ahora = new Date()
            const partesHora = comensal.colegio.horaCorte.split(":").map(Number)
            const h = partesHora[0] ?? 0
            const m = partesHora[1] ?? 0
            const fechaCorte = new Date(dia.fecha + "T00:00:00")
            fechaCorte.setHours(h ?? 0, m ?? 0, 0, 0)
            const horasRestantes =
              (fechaCorte.getTime() - ahora.getTime()) / (1000 * 60 * 60)
            if (horasRestantes > 0 && horasRestantes <= 2) {
              map[dia.fecha] = "proximo-corte"
            } else {
              map[dia.fecha] = "disponible"
            }
          }
        }
      }
      // Sin menú ni pedido → null (sin micro-línea)
    }
    return map
  }, [datosPorDia, comensales, timezone])

  // ── Agregar al carrito ──
  const agregarAlCarrito = useCallback(
    (opcion: OpcionConPrecio) => {
      if (!comensalActivo) return
      setItemsCarrito((prev) => [
        ...prev,
        {
          opcionMenuId: opcion.id,
          comensalId: comensalActivo,
          nombre: opcion.nombre,
          precio: opcion.precio,
        },
      ])
    },
    [comensalActivo]
  )

  // ── Formatear fecha legible ──
  const fechaLegible = useMemo(() => {
    const partes = diaSeleccionado.split("-").map(Number)
    const y = partes[0] ?? 0
    const m = partes[1] ?? 1
    const d = partes[2] ?? 1
    const date = new Date(y, m - 1, d)
    return formatFechaLarga(date, timezone)
  }, [diaSeleccionado, timezone])

  // ── Render ──
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ZONA A — Calendario expansible */}
      <div className="pt-4">
        <CalendarioExpansible
          diaSeleccionado={diaSeleccionado}
          onDiaSeleccionado={setDiaSeleccionado}
          estadosPorDia={estadosPorDia}
        />
      </div>

      {/* ZONA B — Contenido del día */}
      <div className="px-5 mt-6">
        {/* Selector de comensal (tabs horizontales si hay más de 1 hijo) */}
        {comensales.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {comensales.map((c) => (
              <button
                key={c.id}
                onClick={() => setComensalActivo(c.id)}
                type="button"
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full font-display text-small font-semibold
                  transition-all duration-200 ease-out border
                  ${c.id === comensalActivo
                    ? "bg-primary/16 text-primary-hover border-primary/30"
                    : "bg-surface-glass border-border text-foreground-secondary hover:text-foreground"
                  }
                `}
              >
                {c.nombre}
                {c.curso && (
                  <span className="ml-1 opacity-60">· {c.curso}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Nombre del día */}
        <h2 className="font-display text-title font-bold text-foreground tracking-tight mb-4">
          {fechaLegible}
        </h2>

        {/* Pasado la hora de corte — aviso */}
        {cortePasado && menu && (
          <div className="mb-4 p-4 rounded-xl bg-warning/10 border border-warning/30">
            <div className="flex items-center gap-2">
              <Clock size={18} strokeWidth={1.5} className="text-warning" />
              <p className="font-display text-small font-semibold text-warning">
                Pedidos cerrados
              </p>
            </div>
            <p className="font-sans text-small text-foreground-secondary mt-1">
              La hora de corte ya pasó. No se pueden hacer nuevos pedidos para hoy.
            </p>
          </div>
        )}

        {/* Sin menú publicado */}
        {!menu && (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl bg-surface-glass border border-border">
            <CalendarX size={48} strokeWidth={1.5} className="text-foreground-tertiary mb-4" />
            <p className="font-display text-heading font-semibold text-foreground text-center">
              Sin menú publicado
            </p>
            <p className="font-sans text-body text-foreground-secondary mt-1 text-center">
              Aún no hay menú publicado para este día.
            </p>
          </div>
        )}

        {/* Menú disponible */}
        {menu && !cortePasado && (
          <>
            {/* Pedido ya hecho */}
            {pedido &&
              ["PENDIENTE_PAGO", "PAGADO"].includes(pedido.estado) && (
                <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      strokeWidth={1.5}
                      className="text-success"
                    />
                    <p className="font-display text-small font-semibold text-success">
                      {pedido.estado === "PAGADO"
                        ? "Pedido confirmado"
                        : "Pedido pendiente de pago"}
                    </p>
                  </div>
                  <p className="font-sans text-small text-foreground-secondary mt-1">
                    {pedido.items
                      .filter((i) => i.comensalId === comensalActivo)
                      .map((i) => i.nombre)
                      .join(", ") || "Sin items para este comensal"}
                  </p>
                </div>
              )}

            {/* Opción principal (hero) — primera opción del menú */}
            {menu.opciones[0] && (
              <div className="mb-3">
                <BentoCardMenu
                  opcion={menu.opciones[0]}
                  variant="hero"
                  estado={
                    menu.opciones[0].estado === "AGOTADA"
                      ? "agotado"
                      : pedido
                        ? "seleccionado"
                        : "disponible"
                  }
                  onSeleccionar={
                    !pedido
                      ? () => agregarAlCarrito(menu.opciones[0]!)
                      : undefined
                  }
                />
              </div>
            )}

            {/* Opciones alternativas (grid 2 columnas) */}
            {menu.opciones.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {menu.opciones.slice(1).map((opcion) => (
                  <BentoCardMenu
                    key={opcion.id}
                    opcion={opcion}
                    variant="small"
                    estado={
                      opcion.estado === "AGOTADA"
                        ? "agotado"
                        : pedido
                          ? "seleccionado"
                          : "disponible"
                    }
                    onSeleccionar={
                      !pedido && opcion.estado !== "AGOTADA"
                        ? () => agregarAlCarrito(opcion)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            {/* Botón kiosko — placeholder (drawer se implementa completo después) */}
            {kioscoActivo && (
              <div className="mt-4 rounded-xl bg-surface-glass border border-border p-5 text-center">
                <p className="font-display text-body font-semibold text-primary">
                  Agregar del kiosko
                </p>
                <p className="font-sans text-small text-foreground-secondary mt-1">
                  Bebidas, snacks y más
                </p>
              </div>
            )}
          </>
        )}

        {/* Menú disponible pero corte pasado — cards con opacity */}
        {menu && cortePasado && (
          <div className="opacity-40 pointer-events-none space-y-3">
            {menu.opciones.map((opcion) => (
              <BentoCardMenu
                key={opcion.id}
                opcion={opcion}
                variant={opcion === menu.opciones[0] ? "hero" : "small"}
                estado="disponible"
              />
            ))}
          </div>
        )}
      </div>

      {/* ZONA C — Floating Cart placeholder */}
      {itemsCarrito.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 px-5 z-40">
          <div className="flex items-center justify-between p-4 rounded-xl bg-primary shadow-glow-primary">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} strokeWidth={1.5} className="text-primary-foreground" />
              <span className="font-display text-body font-semibold text-primary-foreground">
                {itemsCarrito.length} item{itemsCarrito.length > 1 ? "s" : ""}
              </span>
            </div>
            <span className="font-display text-heading font-bold text-primary-foreground">
              {formatCLP(itemsCarrito.reduce((sum, item) => sum + item.precio, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Sin comensales — estado vacío */}
      {comensales.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-5">
          <p className="font-display text-heading font-semibold text-foreground text-center">
            No tienes comensales registrados
          </p>
          <p className="font-sans text-body text-foreground-secondary mt-2 text-center">
            Vincula un comensal desde el perfil para ver los menús disponibles.
          </p>
        </div>
      )}
    </div>
  )
}
