// ═══════════════════════════════════════════════════════════════════
// E2E — Return/confirmación Webpay
// ═══════════════════════════════════════════════════════════════════
// Tests críticos de Semana 6:
// 1. Return Webpay sin token_ws redirige a error
// 2. Return con token_ws desconocido redirige a pago-error (pedido_no_encontrado)
// 3. Commit Webpay idempotente: segunda confirmación no duplica stock/crédito
// 4. Commit Webpay con stock insuficiente revierte y genera crédito
// 5. Commit Webpay exitoso actualiza pedido y decrementa stock
//
// RAZÓN DEL SKIP: Requieren servidor corriendo con credenciales
// Transbank sandbox válidas y seed de datos de prueba.
// ═══════════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test"

test.describe("Return/confirmación Webpay", () => {
  // Skip: requiere servidor corriendo + Webpay sandbox + seed
  test.skip()

  test("return Webpay sin token_ws redirige a error", async ({ page }) => {
    const response = await page.request.post("/api/payment/webpay/return", {
      data: {},
      headers: { "Content-Type": "application/json" },
    })

    // Debe redirigir a /pago-error?motivo=sin_token
    expect(response.status()).toBeLessThan(400)
  })

  test("return con token_ws desconocido redirige a pago-error", async ({
    page,
  }) => {
    const response = await page.request.post("/api/payment/webpay/return", {
      data: { token_ws: "token-falso-que-no-existe-12345" },
      headers: { "Content-Type": "application/json" },
    })

    // Debe redirigir a /pago-error?motivo=pedido_no_encontrado
    expect(response.status()).toBeLessThan(400)
    const location = response.headers()["location"] || ""
    expect(location).toContain("pedido_no_encontrado")
  })

  test("commit Webpay idempotente: segunda confirmación no duplica stock/crédito", async ({
    page,
  }) => {
    // Requiere: pedido en PENDIENTE_PAGO con webpayToken válido
    // Primera confirmación → PAGADO + stock decrementado
    // Segunda llamada con mismo token_ws → idempotente, no re-procesa
  })

  test("commit Webpay con stock insuficiente revierte y genera crédito", async ({
    page,
  }) => {
    // Requiere: pedido con creditoAplicado > 0 + stock agotado
    // Verificación: pedido queda CANCELADO + crédito se restaura
  })

  test("commit Webpay exitoso actualiza pedido y decrementa stock", async ({
    page,
  }) => {
    // Requiere: pedido en PENDIENTE_PAGO con webpayToken + stock suficiente
    // Verificación: pedido → PAGADO, stockActual decrementado
  })
})
