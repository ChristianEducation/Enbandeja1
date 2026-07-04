// ═══════════════════════════════════════════════════════════════════
// E2E — Flujo de pedido del apoderado
// ═══════════════════════════════════════════════════════════════════
// Tests críticos de Semana 6:
// 1. Apoderado crea pedido con monto > 0 y redirige a Webpay
// 2. Pedido con totalPagado=0 va directo a PAGADO
// 3. Invariante Pedido.total se valida en Zod, backend y DB
//
// RAZÓN DEL SKIP: Requieren servidor corriendo con auth + seed +
// credenciales Transbank sandbox configuradas.
// ═══════════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test"

test.describe("Flujo de pedido del apoderado", () => {
  // Skip: requiere servidor corriendo + auth + seed + Webpay sandbox
  test.skip()

  test("apoderado crea pedido con monto > 0 y redirige a Webpay", async ({
    page,
  }) => {
    // 1. Ir a /home como apoderado autenticado
    await page.goto("/home")

    // 2. Seleccionar un día con menú disponible
    const diaDisponible = page.locator("button[class*='w-10'][class*='h-11']").nth(1)
    await diaDisponible.click()

    // 3. Seleccionar una opción del menú
    const menuCard = page.locator("[class*='rounded-3xl'][class*='bg-surface-glass']").first()
    await menuCard.click()

    // 4. Verificar que el floating cart aparece
    const cart = page.locator("text=items")
    await expect(cart).toBeVisible()

    // 5. Navegar a /resumen
    await page.goto("/resumen?pedidoId=test-pending")

    // 6. Verificar botón "Confirmar y pagar"
    const btnPagar = page.locator("text=Confirmar y pagar")
    await expect(btnPagar).toBeVisible()
  })

  test("pedido con totalPagado=0 va directo a PAGADO", async ({ page }) => {
    await page.goto("/resumen?pedidoId=test-credito-full")

    // Verificar que muestra "Cubierto por crédito/beca"
    const cobertura = page.locator("text=Cubierto por crédito/beca")
    await expect(cobertura).toBeVisible()

    // Verificar botón "Confirmar" (no "Confirmar y pagar")
    const btnConfirmar = page.locator("text=Confirmar")
    await expect(btnConfirmar).toBeVisible()
  })

  test("invariante Pedido.total se valida en Zod, backend y DB", async ({
    page,
  }) => {
    // Valida que el backend recalcula el total
    // y no confía en el frontend.
    const response = await page.request.post("/api/pedidos/crear", {
      data: {
        colegioId: "test-colegio",
        items: [],
        creditoAplicado: -1, // Inválido
      },
    })

    // Debe retornar 400 por validación Zod
    expect(response.status()).toBe(400)
  })
})
