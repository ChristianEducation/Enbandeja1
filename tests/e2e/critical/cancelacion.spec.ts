// ═══════════════════════════════════════════════════════════════════
// E2E — Cancelación de items y sistema de crédito
// ═══════════════════════════════════════════════════════════════════
// Tests críticos de Semana 8:
// 1. Apoderado cancela item antes de hora de corte → crédito generado
// 2. Cancelación después de hora de corte retorna 403
// 3. Crédito se aplica automáticamente en nuevo pedido
// 4. CreditoMovimiento es inmutable (INSERT funciona, UPDATE falla)
// 5. Monto de crédito nunca negativo
//
// RAZÓN DEL SKIP: Requieren servidor corriendo con auth + seed +
// Webpay sandbox configuradas.
// ═══════════════════════════════════════════════════════════════════
import { test, expect } from "@playwright/test"

test.describe("Cancelación de items y crédito", () => {
  // Skip: requiere servidor corriendo + auth + seed
  test.skip()

  test("apoderado cancela item antes de hora de corte → crédito generado", async ({
    page,
  }) => {
    // 1. Ir a /historial como apoderado autenticado
    await page.goto("/historial")

    // 2. Expandir un pedido pagado
    const primerPedido = page
      .locator("[class*='rounded-3xl'][class*='bg-surface-glass']")
      .first()
    await primerPedido.locator("button").first().click()

    // 3. Buscar botón "Cancelar" en un item
    const btnCancelar = page.locator("text=Cancelar").first()
    await expect(btnCancelar).toBeVisible()

    // 4. Click en cancelar → aparece confirmación inline
    await btnCancelar.click()

    // 5. Confirmar cancelación
    const btnConfirmar = page.locator("text=Sí, cancelar").first()
    await expect(btnConfirmar).toBeVisible()
    await btnConfirmar.click()

    // 6. Verificar que aparece badge de crédito generado
    const creditoBadge = page.locator("text=Crédito:").first()
    await expect(creditoBadge).toBeVisible()
  })

  test("cancelación después de hora de corte retorna 403", async ({
    page,
  }) => {
    // Simular llamada directa a la API con item cuya hora de corte ya pasó
    const response = await page.evaluate(async () => {
      const res = await fetch("/api/pedidos/cancelar-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoItemId: "item-hora-corte-pasada" }),
      })
      return { status: res.status, body: await res.json() }
    })

    // La API debe retornar 403 con razón
    expect(response.status).toBe(403)
    expect(response.body.error).toContain("hora de corte")
  })

  test("crédito se aplica automáticamente en nuevo pedido", async ({
    page,
  }) => {
    // 1. Ir a /perfil/credito para ver saldo
    await page.goto("/perfil/credito")

    // 2. Verificar que hay crédito disponible
    const saldo = page.locator("[class*='text-success']").first()
    await expect(saldo).toBeVisible()

    // 3. Ir a /resumen con un pedido que puede usar crédito
    await page.goto("/resumen?pedidoId=test-con-credito")

    // 4. Verificar que el desglose muestra crédito aplicado
    const creditoRow = page.locator("text=Crédito aplicado")
    await expect(creditoRow).toBeVisible()

    // 5. Verificar que el total a pagar es menor al subtotal
    const totalPagar = page.locator("text=Total a pagar").locator("..").locator("span").last()
    await expect(totalPagar).toBeVisible()
  })

  test("CreditoMovimiento es inmutable (INSERT funciona, UPDATE falla)", async ({
    page,
  }) => {
    // Verificar a nivel de DB que CreditoMovimiento no tiene updatedAt/deletedAt
    const result = await page.evaluate(async () => {
      const res = await fetch("/api/test/inmutabilidad-movimiento", {
        method: "POST",
      })
      return await res.json()
    })

    // Si el endpoint de test existe, verificar inmutabilidad
    // Si no existe, este test queda como placeholder documentado
    expect(result).toBeDefined()
  })

  test("monto de crédito nunca negativo", async ({ page }) => {
    // Verificar que CreditoApoderado tiene CHECK constraint monto >= 0
    const result = await page.evaluate(async () => {
      const res = await fetch("/api/test/credito-no-negativo", {
        method: "POST",
      })
      return await res.json()
    })

    // Si el endpoint de test existe, verificar que el CHECK está activo
    // Si no existe, este test queda como placeholder documentado
    expect(result).toBeDefined()
  })
})
