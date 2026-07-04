"use client"
// ═══════════════════════════════════════════════════════════════════
// TenantsListClient — Lista de tenants con link a billing
// ═══════════════════════════════════════════════════════════════════
import React from "react"
import Link from "next/link"
import { Building2, CreditCard, CheckCircle2, XCircle, AlertTriangle, Clock } from "@enbandeja/ui/icons"

interface TenantData {
  id: string
  name: string
  slug: string
  email: string
  status: string
  createdAt: string
  suscripcion: {
    estado: string
    tipo: string
    periodoFin: string
    planNombre: string
  } | null
}

interface Props {
  tenants: TenantData[]
}

const ESTADO_BADGE: Record<string, { label: string; color: string; icon: any }> = {
  ACTIVA: { label: "Activa", color: "bg-success/16 text-success", icon: CheckCircle2 },
  PERIODO_GRACIA: { label: "Gracia", color: "bg-warning/16 text-warning", icon: AlertTriangle },
  SUSPENDIDA: { label: "Suspendida", color: "bg-warning/16 text-warning", icon: XCircle },
  CANCELADA: { label: "Cancelada", color: "bg-foreground-disabled/16 text-foreground-tertiary", icon: XCircle },
  ARCHIVADA: { label: "Archivada", color: "bg-foreground-disabled/16 text-foreground-tertiary", icon: Clock },
}

export function TenantsListClient({ tenants }: Props) {
  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">
          Tenants
        </h1>
        <span className="font-sans text-small text-foreground-secondary">
          {tenants.length} registrados
        </span>
      </div>

      {tenants.length === 0 ? (
        <div className="rounded-xl bg-surface-glass border border-border p-8 text-center">
          <Building2 size={32} strokeWidth={1.5} className="text-foreground-secondary mx-auto mb-3" />
          <p className="font-sans text-body text-foreground-secondary">
            No hay tenants registrados.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tenants.map((t) => {
            const sub = t.suscripcion
            const badge = sub ? (ESTADO_BADGE[sub.estado] ?? ESTADO_BADGE.CANCELADA!) : null
            const BadgeIcon = badge?.icon ?? XCircle

            return (
              <Link
                key={t.id}
                href={`/super-admin/tenants/${t.id}/billing`}
                className="block rounded-xl bg-surface-glass border border-border p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 size={18} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-body font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="font-sans text-small text-foreground-secondary">
                        {t.email} · {t.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {badge && sub ? (
                      <span className={`px-2 py-0.5 rounded-full text-caption font-display font-semibold flex items-center gap-1 ${badge.color}`}>
                        <BadgeIcon size={12} strokeWidth={2} />
                        {sub.planNombre} · {badge.label}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-caption font-display font-semibold bg-warning/16 text-warning">
                        Sin suscripción
                      </span>
                    )}
                    <CreditCard size={16} strokeWidth={1.5} className="text-foreground-secondary" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
