"use client"
// ═══════════════════════════════════════════════════════════════════
// SuperAdminSidebar — Navegación lateral del Super Admin
// ═══════════════════════════════════════════════════════════════════
import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Building2 } from "@enbandeja/ui/icons"

const NAV_ITEMS = [
  { href: "/super-admin/tenants", label: "Tenants", icon: Building2 },
] as const

export function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col bg-surface-glass border-r border-border z-40">
        <div className="px-5 py-6 border-b border-border">
          <h1 className="font-display text-heading font-bold text-foreground flex items-center gap-2">
            <ShieldCheck size={20} strokeWidth={1.5} className="text-primary" />
            Super Admin
          </h1>
          <p className="font-sans text-small text-foreground-secondary mt-0.5">
            Enbandeja
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

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[72px] flex items-center justify-around bg-surface-glass border-t border-border"
        aria-label="Navegación super admin"
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
            >
              <Icon strokeWidth={1.5} size={20} />
              <span className="font-display text-caption font-medium tracking-wide">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
