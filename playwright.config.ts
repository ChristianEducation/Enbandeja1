import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config para Enbandeja.
 * Los tests E2E críticos validan: aislamiento de tenants (RLS),
 * permisos por rol, invariante contable, y flujo de auth.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'critical',
      testDir: './tests/e2e/critical',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Levantar el servidor de desarrollo antes de los tests
  webServer: {
    command: 'pnpm --filter=@enbandeja/web dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
