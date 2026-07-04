"use client"
// ═══════════════════════════════════════════════════════════════════
// PerfilClient — Perfil del apoderado
// ═══════════════════════════════════════════════════════════════════
// Bento Card: datos del apoderado (nombre, email)
// Bento Card: comensales (lista) + botón "Agregar comensal"
// Bento Card: crédito disponible
// Botón: "Cerrar sesión"
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react"
import { formatCLP } from "@enbandeja/shared"
import {
  User,
  Users,
  Wallet,
  Plus,
  LogOut,
  X,
  ChevronRight,
} from "@enbandeja/ui/icons"
import { FormComensal } from "@enbandeja/ui"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { ComensalPerfil } from "../page"

interface PerfilClientProps {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  comensales: ComensalPerfil[]
  creditoDisponible: number
  colegioId: string
  colegioNombre: string
}

export function PerfilClient({ user, comensales, creditoDisponible, colegioId, colegioNombre }: PerfilClientProps) {
  const router = useRouter()
  const [mostrarAgregar, setMostrarAgregar] = useState(false)

  const handleCerrarSesion = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">
          Mi perfil
        </h1>
      </div>

      <div className="px-5 space-y-4">
        {/* Card: Datos del apoderado */}
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/16 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={24} strokeWidth={1.5} className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-heading font-semibold text-foreground truncate">
                {user.name || "Sin nombre"}
              </p>
              <p className="font-sans text-small text-foreground-secondary truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Card: Comensales */}
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} strokeWidth={1.5} className="text-primary" />
              <h2 className="font-display text-heading font-semibold text-foreground">
                Comensales
              </h2>
            </div>
            <button
              onClick={() => setMostrarAgregar(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-display text-small font-medium hover:bg-primary/20 transition-colors"
              type="button"
            >
              <Plus size={14} strokeWidth={1.5} />
              Agregar
            </button>
          </div>

          {comensales.length === 0 ? (
            <p className="font-sans text-body text-foreground-secondary text-center py-4">
              No hay comensales registrados
            </p>
          ) : (
            <div className="space-y-3">
              {comensales.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
                >
                  <div className="h-10 w-10 rounded-full bg-surface-glass flex items-center justify-center overflow-hidden">
                    {c.avatarUrl ? (
                      <img
                        src={c.avatarUrl}
                        alt={c.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={16} strokeWidth={1.5} className="text-foreground-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-body font-semibold text-foreground truncate">
                      {c.nombre} {c.apellido}
                    </p>
                    {c.curso && (
                      <p className="font-sans text-small text-foreground-secondary">
                        {c.curso}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card: Crédito disponible */}
        <div className="rounded-xl bg-surface-glass border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={18} strokeWidth={1.5} className="text-success" />
            <h2 className="font-display text-heading font-semibold text-foreground">
              Crédito disponible
            </h2>
          </div>
          <p className="font-display text-[2rem] font-bold text-success leading-none">
            {formatCLP(creditoDisponible)}
          </p>
          <button
            onClick={() => router.push("/perfil/credito")}
            className="flex items-center gap-1 mt-3 font-display text-small font-medium text-primary hover:text-primary-hover transition-colors"
            type="button"
          >
            Ver movimientos
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Botón: Cerrar sesión */}
        <button
          onClick={handleCerrarSesion}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-display text-body font-semibold bg-danger/10 text-danger hover:bg-danger/20 transition-all duration-200 ease-out"
          type="button"
        >
          <LogOut size={18} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </div>

      {/* Drawer: Agregar comensal */}
      {mostrarAgregar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-t-3xl bg-surface-glass border-t border-border p-6 pb-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-heading font-semibold text-foreground">
                Agregar comensal
              </h3>
              <button
                onClick={() => setMostrarAgregar(false)}
                className="p-2 rounded-full hover:bg-surface-glass transition-colors"
                type="button"
              >
                <X size={20} strokeWidth={1.5} className="text-foreground-secondary" />
              </button>
            </div>
            <FormComensal
              colegioId={colegioId}
              colegioNombre={colegioNombre}
              submitLabel="Agregar comensal"
              onSuccess={() => {
                setMostrarAgregar(false)
                router.refresh()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
