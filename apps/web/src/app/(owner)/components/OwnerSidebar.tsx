"use client"
// ═══════════════════════════════════════════════════════════════════
// OwnerSidebar — Navegación lateral del owner
// ═══════════════════════════════════════════════════════════════════
// Sidebar 240px Liquid Glass desktop, bottom nav mobile
// Ítems: Dashboard, Empresa, Colegios, Usuarios, Reportes
// Vive en apps/web (importa next/link)
// ═══════════════════════════════════════════════════════════════════
import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Building2,
  Store,
  Users,
  FileText,
  CreditCard,
} from "@enbandeja/ui/icons"

const NAV_ITEMS = [
  { href: "/owner/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/owner/empresa", label: "Empresa", icon: Building2 },
  { href: "/owner/colegios", label: "Colegios", icon: Store },
  { href: "/owner/usuarios", label: "Usuarios", icon: Users },
  { href: "/owner/reportes", label: "Reportes", icon: FileText },
  { href: "/owner/billing", label: "Billing", icon: CreditCard },
] as const

export function OwnerSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop/Tablet sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col bg-surface-glass border-r border-border z-40">
        <div className="px-5 py-6 border-b border-border">
          <h1 className="font-display text-heading font-bold text-foreground">
            Enbandeja
          </h1>
          <p className="font-sans text-small text-foreground-secondary mt-0.5">
            Owner
          </p>
        </div>
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
        aria-label="Navegación owner"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-full transition-all duration-200 ease-out min-w-[56px] ${
                isActive
                  ? "bg-primary/16 text-primary"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon strokeWidth={1.5} size={20} className={isActive ? "text-primary" : "text-foreground-secondary"} />
              <span className="font-display text-caption font-medium tracking-wide">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
