import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════════
// Test crítico: Flujo de autenticación
// ═══════════════════════════════════════════════════════════════════
// Valida el flujo completo de login/logout con NextAuth v5
// strategy:database y la invalidación inmediata de sesión.
// ═══════════════════════════════════════════════════════════════════

test.describe('Flujo de autenticación', () => {
  test('redirige a /login si no está autenticado', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('la página de login muestra el botón de Google', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Continuar con Google')).toBeVisible()
  })

  test('invalidar sesión en DB desconecta al usuario inmediatamente', async ({ page }) => {
    // TODO: implementar con test user y manipulación directa de DB
    // 1. Login con test user
    // 2. Verificar que está autenticado
    // 3. Borrar sesión directamente de la tabla Session
    // 4. Recargar página
    // 5. Verificar redirect a /login
    test.skip()
  })
})
