import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════════
// Test crítico: Invariante contable del pedido
// ═══════════════════════════════════════════════════════════════════
// Regla 9 del CLAUDE.md:
// Pedido.total = Pedido.creditoAplicado + Pedido.totalPagado SIEMPRE
//
// Verificado en 3 niveles: Zod, Backend, Postgres CHECK constraint.
// ═══════════════════════════════════════════════════════════════════

test.describe('Invariante contable del pedido', () => {
  test('el API rechaza un pedido donde total != creditoAplicado + totalPagado', async ({ page }) => {
    // TODO: implementar cuando exista el endpoint de creación de pedido (Fase 1)
    // 1. Enviar POST /api/pedidos con total=10000, credito=3000, pagado=5000
    // 2. Verificar respuesta 400 con mensaje de invariante
    test.skip()
  })

  test('el CHECK constraint de Postgres rechaza violaciones', async ({ page }) => {
    // TODO: test a nivel de DB directo
    // 1. Intentar INSERT directo con valores que violen la invariante
    // 2. Verificar que Postgres lanza error de CHECK constraint
    test.skip()
  })
})
