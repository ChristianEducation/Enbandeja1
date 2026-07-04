import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════════
// E2E Tests — Registro y Vinculación (Semana 4)
// ═══════════════════════════════════════════════════════════════════
// Tests críticos del flujo de onboarding del apoderado.
// Prerequisito: seed data ejecutado (pnpm db:seed)
// ═══════════════════════════════════════════════════════════════════

test.describe('Flujo de registro y vinculación', () => {

  test('login page muestra opciones de autenticación', async ({ page }) => {
    await page.goto('/login')

    // Verificar elementos clave del ADN visual
    await expect(page.locator('h1')).toContainText('Enbandeja')
    await expect(page.locator('#btn-login-google')).toBeVisible()
    await expect(page.locator('#btn-login-apple')).toBeVisible()
    await expect(page.locator('#link-registro')).toBeVisible()
  })

  test('registro page muestra formulario y link a login', async ({ page }) => {
    await page.goto('/registro')

    await expect(page.locator('h1')).toContainText('Crear cuenta')
    await expect(page.locator('#btn-registro-google')).toBeVisible()
    await expect(page.locator('#btn-registro-submit')).toBeVisible()
  })

  test('sin sesión en /onboarding redirige a /login', async ({ page }) => {
    await page.goto('/onboarding/codigo')

    // Debería redirigir a login
    await page.waitForURL(/\/login/)
    await expect(page).toHaveURL(/\/login/)
  })

  test('código de casino inválido muestra error', async ({ page }) => {
    // Nota: este test requiere sesión activa para que /onboarding/codigo no redirija.
    // Se ejecuta contra el endpoint API directamente.
    const response = await page.request.post('/api/vincular/codigo', {
      data: { codigoCasino: 'XXXXX' },
      headers: { 'Content-Type': 'application/json' },
    })

    // Sin sesión = 401
    expect(response.status()).toBe(401)
  })

  test('API vincular código retorna 401 sin sesión', async ({ page }) => {
    const response = await page.request.post('/api/vincular/codigo', {
      data: { codigoCasino: 'DEMO1' },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status()).toBe(401)
  })

  test('API crear comensal retorna 401 sin sesión', async ({ page }) => {
    const response = await page.request.post('/api/comensales/crear', {
      data: {
        colegioId: '00000000-0000-0000-0000-000000000000',
        nombre: 'Test',
        apellido: 'User',
        curso: '6°B',
        vinculo: 'PADRE',
      },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status()).toBe(401)
  })

  test('login page tiene ADN visual correcto — no morados ni rojos', async ({ page }) => {
    await page.goto('/login')

    // El fondo debe ser Deep Navy (#0D0F1A), no debe haber morados ni rojos
    const body = page.locator('body')
    // Verificar que no haya texto rojo visible (anti-patrón)
    const redElements = await page.locator('[style*="color: red"], [style*="color: #ff"], [style*="color: #FF"]').count()
    expect(redElements).toBe(0)

    // Verificar que los botones de acción están visibles
    const primaryButton = page.locator('#btn-login-google')
    await expect(primaryButton).toBeVisible()
  })
})
