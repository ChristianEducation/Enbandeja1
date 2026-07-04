"use client"
// ═══════════════════════════════════════════════════════════════════
// OperadorSidebar — Navegación lateral del operador (tablet-first)
// ═══════════════════════════════════════════════════════════════════
// Sidebar 240px Liquid Glass en desktop/tablet
// Bottom nav en mobile (responsive)
// Ítems: Día, Menús, Kiosco, Reportes
// Vive en apps/web (no packages/ui) porque importa next/link
// ═══════════════════════════════════════════════════════════════════
import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  ClipboardList,
  CalendarDays,
  Store,
  BarChart3,
} from "@enbandeja/ui/icons"

const NAV_ITEMS = [
  { href: "/operador/dia", label: "Día", icon: ClipboardList },
  { href: "/operador/menu", label: "Menús", icon: CalendarDays },
  { href: "/operador/kiosco", label: "Kiosco", icon: Store },
  { href: "/operador/reportes", label: "Reportes", icon: BarChart3 },
] as const

export function OperadorSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop/Tablet sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col bg-surface-glass border-r border-border z-40">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-border">
          <h1 className="font-display text-heading font-bold text-foreground">
            Enbandeja
          </h1>
          <p className="font-sans text-small text-foreground-secondary mt-0.5">
            Operador
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-body font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/16 text-primary"
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface-glass"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon strokeWidth={1.5} size={20} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[72px] flex items-center justify-around bg-surface-glass border-t border-border"
        aria-label="Navegación operador"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-full transition-all duration-200 ease-out min-w-[64px] ${
                isActive
                  ? "bg-primary/16 text-primary"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                strokeWidth={1.5}
                size={20}
                className={isActive ? "text-primary" : "text-foreground-secondary"}
              />
              <span className="font-display text-caption font-medium tracking-wide">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
