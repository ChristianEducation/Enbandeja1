// ═══════════════════════════════════════════════════════════════════
// Tipos compartidos — Enbandeja
// ═══════════════════════════════════════════════════════════════════
// Tipos de dominio reutilizables en toda la aplicación.
// NO importar @prisma/client aquí — este package no depende de Prisma.
// ═══════════════════════════════════════════════════════════════════

/** UUID de un Tenant */
export type TenantId = string

/** UUID de un User */
export type UserId = string

/** Código único del casino (ej: "HF-ANT-001") */
export type CodigoCasino = string

/** Resultado paginado genérico */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Respuesta estándar de API */
export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/** Contexto de sesión extraído por withAuth */
export interface SessionContext {
  userId: UserId
  tenantId: TenantId
  role: 'OWNER' | 'OPERADOR' | 'COCINA' | 'APODERADO'
  colegioId?: string
}
