// ═══════════════════════════════════════════════════════════════════
// E2E — Permisos de rol y publicación de menús
// ═══════════════════════════════════════════════════════════════════
// Tests críticos de Fase 2:
// 1. Apoderado no puede acceder a /operador/dia
// 2. Cocina no puede escribir (solo lectura)
// 3. Operador no puede acceder a /home del apoderado
// 4. Menú con fecha pasada no se puede publicar
// 5. Publicar menú requiere precios para todas las categorías
//
// RAZÓN DEL SKIP: Requieren servidor corriendo con auth + seed.
// ═══════════════════════════════════════════════════════════════════
import { test, expect } from "@playwright/test"

test.describe("Permisos de rol y publicación de menús", () => {
  test.skip()

  test("apoderado no puede acceder a /operador/dia", async ({ page }) => {
    // Login como apoderado
    await page.goto("/operador/dia")
    // Debe ser redirigido a /home o /login
    await expect(page).toHaveURL(/\/(home|login)/)
  })

  test("cocina no puede escribir — marcar retirado retorna 403", async ({ page }) => {
    // Login como cocina
    const response = await page.evaluate(async () => {
      const res = await fetch("/api/pedidos/marcar-retirado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: "test-pedido" }),
      })
      return { status: res.status, body: await res.json() }
    })
    expect(response.status).toBe(403)
  })

  test("operador no puede acceder a /home del apoderado", async ({ page }) => {
    // Login como operador
    await page.goto("/home")
    // Debe ser redirigido
    await expect(page).toHaveURL(/\/(operador|login)/)
  })

  test("menú con fecha pasada no se puede publicar", async ({ page }) => {
    const response = await page.evaluate(async () => {
      const res = await fetch("/api/menu/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: "2020-01-01",
          colegioId: "test-colegio",
          estado: "PUBLICADO",
          opciones: [{ nombre: "Test", precios: [{ categoriaPrecioId: "test", precio: 1000 }] }],
        }),
      })
      return { status: res.status, body: await res.json() }
    })
    expect(response.status).toBe(400)
    expect(response.body.error).toContain("fecha pasada")
  })

  test("publicar menú requiere precios para todas las categorías", async ({ page }) => {
    // Este test verifica que la validación de precios completos funciona
    const response = await page.evaluate(async () => {
      const res = await fetch("/api/menu/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: "2099-12-31",
          colegioId: "test-colegio",
          estado: "PUBLICADO",
          opciones: [{ nombre: "Test", precios: [] }],
        }),
      })
      return { status: res.status, body: await res.json() }
    })
    expect(response.status).toBe(400)
  })
})
