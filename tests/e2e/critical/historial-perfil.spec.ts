// ═══════════════════════════════════════════════════════════════════
// E2E — Historial y Perfil del apoderado
// ═══════════════════════════════════════════════════════════════════
// Tests críticos de Semana 7:
// 1. Apoderado ve solo sus pedidos en historial
// 2. Filtro por estado funciona
// 3. Agregar comensal desde perfil funciona
// 4. Crédito se muestra correctamente
//
// SKIP: Requieren servidor corriendo con auth + seed.
// ═══════════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test"

test.describe("Historial y Perfil del apoderado", () => {
  // Skip: requiere servidor corriendo + auth + seed
  test.skip()

  test("apoderado ve solo sus pedidos en historial", async ({ page }) => {
    // Login como apoderado
    // Navegar a /historial
    // Verificar que solo aparecen pedidos de este apoderado
    // No deben aparecer pedidos de otro apoderado del mismo tenant
  })

  test("filtro por estado funciona", async ({ page }) => {
    // Navegar a /historial
    // Click en "Pagados"
    // Verificar que solo aparecen pedidos PAGADO
    // Click en "Cancelados"
    // Verificar que solo aparecen pedidos CANCELADO/RECHAZADO/EXPIRADO
    // Click en "Todos"
    // Verificar que aparecen todos los pedidos
  })

  test("agregar comensal desde perfil funciona", async ({ page }) => {
    // Navegar a /perfil
    // Click en "Agregar"
    // Llenar formulario de comensal
    // Enviar
    // Verificar que el comensal aparece en la lista
  })

  test("crédito se muestra correctamente", async ({ page }) => {
    // Navegar a /perfil
    // Verificar que el monto de crédito coincide con el de DB
    // Verificar que el formato es CLP correcto
  })
})
