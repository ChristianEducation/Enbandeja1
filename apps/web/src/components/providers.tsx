'use client'

import { SessionProvider } from 'next-auth/react'

// ═══════════════════════════════════════════════════════════════════
// SessionProvider wrapper — necesario para que signIn() de
// next-auth/react funcione en Client Components.
// ═══════════════════════════════════════════════════════════════════

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
