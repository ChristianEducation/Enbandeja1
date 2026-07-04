"use client"

// ═══════════════════════════════════════════════════════════════════
// BottomNav — Navegación inferior del apoderado
// ═══════════════════════════════════════════════════════════════════
// 4 items: Inicio, Pedir, Historial, Perfil
// Active state: píldora radius 9999px con bg rgba(59,91,254,0.16)
// Height 72px, fixed bottom, Liquid Glass
// Íconos: @enbandeja/ui/icons, stroke 1.5px size 20
//
// Vive en apps/web (no en packages/ui) porque importa next/link
// y next/navigation — Regla 3 del CLAUDE.md.
// ═══════════════════════════════════════════════════════════════════

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  ShoppingCart,
  ClipboardList,
  User,
} from "@enbandeja/ui/icons"

// ───────────────────────────────────────────────────────────────────
// CONFIG
// ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/home", label: "Inicio", icon: Home },
  { href: "/pedir", label: "Pedir", icon: ShoppingCart },
  { href: "/historial", label: "Historial", icon: ClipboardList },
  { href: "/perfil", label: "Perfil", icon: User },
] as const

// ───────────────────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        h-[72px] flex items-center justify-around
        bg-surface-glass
        border-t border-border
      "
      aria-label="Navegación principal"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href

        return (
          <Link
            key={href}
            href={href}
            className={`
              flex flex-col items-center justify-center gap-1
              px-4 py-2 rounded-full
              transition-all duration-200 ease-out
              min-w-[64px]
              ${isActive
                ? "bg-primary/16 text-primary-hover"
                : "text-foreground-secondary hover:text-foreground"
              }
            `}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              strokeWidth={1.5}
              size={20}
              className={isActive ? "text-primary-hover" : "text-foreground-secondary"}
            />
            <span className="font-display text-caption font-medium tracking-wide">
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
