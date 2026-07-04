// ═══════════════════════════════════════════════════════════════════
// getPaymentProviderConfig — Obtener configuración de pasarela por tenant
// ═══════════════════════════════════════════════════════════════════
// Recibe: db (TenantClient), provider (PaymentProvider enum)
// Busca la configuración activa del tenant para el provider indicado.
// RLS filtra automáticamente por tenantId gracias a createTenantClient.
//
// NOTA DE DISEÑO: Este archivo retorna los valores almacenados
// (cifrados o PLAIN:). La descifración se hace en la capa de
// aplicación (apps/web) usando decrypt() de encryption.ts.
// Esto respeta la Regla 3 del CLAUDE.md: packages no importan
// desde apps/web. La función wrapper que descifra vive en
// apps/web/src/lib/payments/provider.ts
// ═══════════════════════════════════════════════════════════════════

// Tipo genérico para aceptar tanto PrismaClient como el cliente extendido
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TenantClient = any

export class PaymentProviderNotConfiguredError extends Error {
  constructor(provider: string, tenantId: string) {
    super(
      `No existe configuración activa para el provider ${provider} en el tenant ${tenantId}. ` +
        `Configure las credenciales de pago antes de procesar transacciones.`
    )
    this.name = "PaymentProviderNotConfiguredError"
  }
}

export interface PaymentProviderConfigRaw {
  id: string
  commerceCode: string
  apiKeyEncrypted: string
  secretKeyEncrypted: string
  environment: string
}

/**
 * Obtiene la configuración RAW de pasarela de pago activa para un tenant y provider.
 * Retorna valores almacenados (cifrados o PLAIN:).
 * La descifración se hace en apps/web/src/lib/payments/provider.ts
 *
 * @throws PaymentProviderNotConfiguredError si no hay config activa
 */
export async function getPaymentProviderConfig(
  db: TenantClient,
  provider: string
): Promise<PaymentProviderConfigRaw> {
  const config = await db.paymentProviderConfig.findFirst({
    where: {
      provider,
      isActive: true,
      deletedAt: null,
    },
  })

  if (!config) {
    throw new PaymentProviderNotConfiguredError(provider, "current-tenant")
  }

  return {
    id: config.id,
    commerceCode: config.commerceCode,
    apiKeyEncrypted: config.apiKeyEncrypted,
    secretKeyEncrypted: config.secretKeyEncrypted,
    environment: config.environment,
  }
}
