// Re-exporta todo lo necesario desde el package @enbandeja/database
export { prisma, createTenantClient } from './client'
export { PrismaClient } from '@prisma/client'
export type * from '@prisma/client'

// Queries de negocio
export {
  getPrecioParaComensal,
  PrecioNoConfiguradoError,
  ComensalNotFoundError,
  CategoriaDefaultNotFoundError,
} from './queries/precios'

export {
  getPaymentProviderConfig,
  PaymentProviderNotConfiguredError,
  type PaymentProviderConfigRaw,
} from './queries/payment-config'
