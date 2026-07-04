// ═══════════════════════════════════════════════════════════════════
// Extensión de tipos NextAuth — Enbandeja
// ═══════════════════════════════════════════════════════════════════
// Extiende los tipos de NextAuth para incluir activeTenantId en
// la sesión. Necesario porque NextAuth v5 con strategy:database
// no incluye campos custom por defecto.
// ═══════════════════════════════════════════════════════════════════

import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
    activeTenantId?: string | null
  }
}
