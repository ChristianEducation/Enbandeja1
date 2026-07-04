"use client"
// ═══════════════════════════════════════════════════════════════════
// NotificationBadge — Badge de notificaciones no leídas
// ═══════════════════════════════════════════════════════════════════
// Query de notificaciones no leídas y muestra badge en ícono campana.
// Se integra en el layout del apoderado (top bar).
// ═══════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react"
import { Bell } from "@enbandeja/ui/icons"

interface NotificationBadgeProps {
  initialCount?: number
}

export function NotificationBadge({ initialCount = 0 }: NotificationBadgeProps) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notificaciones/count")
        if (res.ok) {
          const data = await res.json()
          setCount(data.count || 0)
        }
      } catch {
        // Silenciar error
      }
    }
    fetchCount()
  }, [])

  return (
    <div className="relative">
      <Bell size={20} strokeWidth={1.5} className="text-foreground-secondary" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-display text-[10px] font-bold text-danger-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </div>
  )
}
