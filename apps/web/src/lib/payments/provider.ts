// ═══════════════════════════════════════════════════════════════════
// provider.ts — Wrapper que descifra credenciales de pasarela
// ═══════════════════════════════════════════════════════════════════
// Respeta Regla 3 del CLAUDE.md: decrypt() vive en apps/web,
// getPaymentProviderConfig() (raw) vive en packages/database.
// Esta función une ambos mundos.
// ═══════════════════════════════════════════════════════════════════

import {
  getPaymentProviderConfig,
  type PaymentProviderConfigRaw,
} from "@enbandeja/database"
import { decrypt } from "./encryption"

export interface PaymentProviderCredentials {
  id: string
  commerceCode: string
  apiKey: string
  secretKey: string
  environment: string
}

/**
 * Obtiene la configuración de pasarela de pago del tenant y descifra
 * las credenciales. Retorna todo listo para instanciar el SDK.
 */
export async function getDecryptedPaymentConfig(
  db: any, // TenantClient
  provider: string
): Promise<PaymentProviderCredentials> {
  const raw = await getPaymentProviderConfig(db, provider)

  return {
    id: raw.id,
    commerceCode: raw.commerceCode,
    apiKey: decrypt(raw.apiKeyEncrypted),
    secretKey: decrypt(raw.secretKeyEncrypted),
    environment: raw.environment,
  }
}
