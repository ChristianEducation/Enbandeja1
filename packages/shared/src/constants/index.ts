// ═══════════════════════════════════════════════════════════════════
// Constantes globales — Enbandeja
// ═══════════════════════════════════════════════════════════════════

/**
 * Límites por plan — basados en la tabla del Plan Maestro §8.2.
 * Los precios son orientativos (se cierran con validación beta en Fase 4).
 * Los límites de colegios y usuarios son contractuales.
 */
export const PLAN_LIMITS = {
  STARTER: {
    maxColegios: 1,
    maxUsuarios: 3,
    precioMensual: 49000,
    precioAnual: 490000,
  },
  PYME: {
    maxColegios: 3,
    maxUsuarios: 10,
    precioMensual: 129000,
    precioAnual: 1290000,
  },
  PRO: {
    maxColegios: null,
    maxUsuarios: null,
    precioMensual: 299000,
    precioAnual: 2990000,
  },
  ENTERPRISE: {
    maxColegios: null,
    maxUsuarios: null,
    precioMensual: null,
    precioAnual: null,
  },
} as const

/** Timezones soportados — Chile continental por ahora */
export const TIMEZONES = [
  'America/Santiago',
  'America/Punta_Arenas',
  'Pacific/Easter',
] as const

export type SupportedTimezone = (typeof TIMEZONES)[number]

/** Hora de corte por defecto para pedidos */
export const DEFAULT_HORA_CORTE = '09:00'

/** Duración del trial en días */
export const TRIAL_DURATION_DAYS = 14

/** Días de gracia tras vencimiento de suscripción */
export const GRACE_PERIOD_DAYS = 7

/** Máximo de items en bottom nav mobile */
export const MAX_BOTTOM_NAV_ITEMS = 4

/** Tamaño de página por defecto para paginación */
export const DEFAULT_PAGE_SIZE = 20

/** Duración mínima de un toast de éxito (ms) */
export const MIN_TOAST_DURATION_MS = 3000

/** Roles del sistema */
export const ROLES = ['OWNER', 'OPERADOR', 'COCINA', 'APODERADO'] as const
export type UserRole = (typeof ROLES)[number]

/** Estados del pedido */
export const ESTADOS_PEDIDO = [
  'PENDIENTE_PAGO',
  'PAGADO',
  'CANCELADO',
  'EXPIRADO',
  'RETIRADO',
  'NO_RETIRADO',
] as const

/** Estados del menú */
export const ESTADOS_MENU = [
  'BORRADOR',
  'PUBLICADO',
  'CERRADO',
  'ARCHIVADO',
] as const

/** Métodos de pago */
export const METODOS_PAGO = [
  'WEBPAY',
  'WEBPAY_ONECLICK',
  'MERCADOPAGO',
  'MERCADOPAGO_SUSCRIPCION',
  'MANUAL',
] as const
