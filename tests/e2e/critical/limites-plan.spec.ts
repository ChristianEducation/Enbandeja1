// ═══════════════════════════════════════════════════════════════════
// Tests E2E — Límites de plan
// ═══════════════════════════════════════════════════════════════════
// Skip documentado: requieren servidor corriendo + seed + auth.
// ═══════════════════════════════════════════════════════════════════
import { test, expect } from "@playwright/test"

test.skip()

test.describe("Límites de plan", () => {
  test("Starter: máximo 1 colegio", async () => {
    // Crear 2do colegio con plan Starter → 403
  })

  test("Starter: máximo 3 usuarios", async () => {
    // Invitar 4to usuario con plan Starter → 403
  })

  test("PYME: máximo 3 colegios", async () => {
    // Crear 4to colegio con plan PYME → 403
  })

  test("Pro: colegios ilimitados", async () => {
    // Crear colegio sin límite con plan Pro → éxito
  })

  test("verificarLimitePlan retorna correcto para métrica inexistente", async () => {
    // Métrica no definida → ilimitado (null)
  })
})
