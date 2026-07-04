// ═══════════════════════════════════════════════════════════════════
// Cliente Prisma — Enbandeja
// ═══════════════════════════════════════════════════════════════════
// Cliente global: SOLO para seed, migraciones y operaciones de
// Super Admin. NUNCA usar en rutas de negocio.
//
// createTenantClient: OBLIGATORIO en toda ruta de negocio.
// Inyecta tenantId y userId en la sesión de Postgres para que
// las policies RLS filtren automáticamente.
// ═══════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
}

// Cliente global — SOLO para seed, migraciones, y operaciones de
// Super Admin. NUNCA usar en rutas de negocio.
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Cliente con contexto de tenant y user inyectado.
// OBLIGATORIO en toda ruta de negocio.
export function createTenantClient(tenantId: string, userId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Inyecta tenantId en la sesión de Postgres para RLS.
          // TRUE = solo esta transacción (local scope).
          await prisma.$executeRaw`
            SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)
          `
          // Inyecta userId también. Ajuste #2 del checklist:
          // NO usamos auth.uid() porque NextAuth database strategy
          // no emite JWTs de Supabase Auth.
          await prisma.$executeRaw`
            SELECT set_config('app.current_user_id', ${userId}, TRUE)
          `
          return query(args)
        }
      }
    }
  })
}
