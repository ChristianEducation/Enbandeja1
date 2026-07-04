// ═══════════════════════════════════════════════════════════════════
// NextAuth v5 Route Handler — Compatible con Next.js 15
// ═══════════════════════════════════════════════════════════════════
// next-auth@5.0.0-beta.30 maneja internamente los params de
// Next.js 15. Re-exportar handlers directamente es suficiente.
// ═══════════════════════════════════════════════════════════════════

import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
