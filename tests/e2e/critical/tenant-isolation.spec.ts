import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════════
// Test crítico: Aislamiento de tenants (RLS)
// ═══════════════════════════════════════════════════════════════════
// Valida que un usuario autenticado en Tenant A NO puede ver datos
// de Tenant B. Este es el test más importante de todo el sistema.
//
// Regla 1 del CLAUDE.md:
// "Si el WHERE de mi query está mal escrito, ¿puede Tenant A
//  ver datos de Tenant B?"
//
// Prerequisitos:
// - Base de datos con seed ejecutado (2 tenants de prueba)
// - RLS policies aplicadas (migration manual §6.3)
// ═══════════════════════════════════════════════════════════════════

test.describe('Aislamiento de tenants', () => {
  test('un apoderado del Tenant A no ve pedidos del Tenant B', async ({ page }) => {
    // TODO: implementar cuando exista el flujo de login y pedidos (Fase 1)
    // 1. Login como apoderado del Tenant A
    // 2. Navegar a historial de pedidos
    // 3. Verificar que solo aparecen pedidos del Tenant A
    // 4. Intentar acceder por URL directa a un pedido del Tenant B
    // 5. Verificar respuesta 403 o redirect
    test.skip()
  })

  test('un operador del Tenant A no ve menús del Tenant B', async ({ page }) => {
    // TODO: implementar cuando exista el panel del operador (Fase 2)
    test.skip()
  })

  test('un owner del Tenant A no ve métricas del Tenant B', async ({ page }) => {
    // TODO: implementar cuando exista el dashboard del owner (Fase 3)
    test.skip()
  })

  test('las policies RLS bloquean queries directas cross-tenant', async ({ page }) => {
    // TODO: test a nivel de base de datos (no E2E puro)
    // 1. Conectar a Postgres con set_config de Tenant A
    // 2. Intentar SELECT en Pedido donde tenantId = Tenant B
    // 3. Verificar que retorna 0 filas
    test.skip()
  })
})
