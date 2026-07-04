// ═══════════════════════════════════════════════════════════════════
// Webpay — Integración con Transbank Webpay Plus SDK
// ═══════════════════════════════════════════════════════════════════
// Credenciales se leen desde PaymentProviderConfig del tenant,
// NO desde env vars globales. La única env var global es
// PAYMENT_ENCRYPTION_KEY para descifrar apiKey/secretKey.
//
// Flujo oficial Webpay Plus:
// 1. crearTransaccion → url + token → redirigir browser
// 2. Usuario paga en Webpay
// 3. Webpay redirige de vuelta con token_ws
// 4. commit(token_ws) → confirmar → actualizar Pedido
// ═══════════════════════════════════════════════════════════════════

import type { PaymentProviderCredentials } from "./provider"
import { WebpayPlus } from "transbank-sdk"

export interface WebpayTransactionResult {
  token: string
  url: string
}

export interface WebpayCommitResult {
  vci: string
  amount: number
  status: string
  buyOrder: string
  sessionId: string
  cardNumber: string
  accountingDate: string
  transactionDate: string
  authorizationCode: string
  paymentTypeCode: string
  responseCode: number
  installmentsNumber: number
}

/**
 * Crea una instancia configurada de WebpayPlus con las credenciales del tenant.
 */
function createWebpayInstance(config: PaymentProviderCredentials) {
  const commerceCode = config.commerceCode
  const apiKey = config.apiKey
  const environment = config.environment as "integration" | "production"

  const tx = new WebpayPlus.Transaction({
    commerceCode,
    apiKey,
    environment,
  })

  return tx
}

/**
 * Inicia una transacción Webpay Plus.
 *
 * @param orderId - Identificador único del pedido (buyOrder)
 * @param sessionId - ID del pedido para correlación (sessionId)
 * @param amount - Monto en CLP enteros
 * @param returnUrl - URL de retorno después del pago (${APP_URL}/api/payment/webpay/return)
 * @param providerConfig - Credenciales descifradas del tenant
 * @returns Token y URL de redirección para el browser del apoderado
 */
export async function iniciarTransaccionWebpay(
  orderId: string,
  sessionId: string,
  amount: number,
  returnUrl: string,
  providerConfig: PaymentProviderCredentials
): Promise<WebpayTransactionResult> {
  const tx = createWebpayInstance(providerConfig)

  const response = await tx.create(
    orderId, // buyOrder
    sessionId, // sessionId
    amount, // amount (CLP enteros)
    returnUrl // returnUrl
  )

  return {
    token: response.token,
    url: response.url,
  }
}

/**
 * Confirma una transacción Webpay Plus con commit(token_ws).
 * Se llama DESPUÉS de que Webpay redirige al comercio con token_ws.
 *
 * @param token_ws - Token recibido en el return de Webpay
 * @param providerConfig - Credenciales descifradas del tenant
 * @returns Datos de confirmación de la transacción
 */
export async function confirmarTransaccionWebpay(
  token_ws: string,
  providerConfig: PaymentProviderCredentials
): Promise<WebpayCommitResult> {
  const tx = createWebpayInstance(providerConfig)

  const response = await tx.commit(token_ws)

  return {
    vci: response.vci ?? "",
    amount: response.amount,
    status: response.status,
    buyOrder: response.buy_order,
    sessionId: response.session_id,
    cardNumber: response.card_detail?.card_number ?? "",
    accountingDate: response.accounting_date ?? "",
    transactionDate: response.transaction_date ?? "",
    authorizationCode: response.authorization_code ?? "",
    paymentTypeCode: response.payment_type_code ?? "",
    responseCode: response.response_code ?? -1,
    installmentsNumber: response.installments_number ?? 0,
  }
}
