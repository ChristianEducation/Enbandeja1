// ═══════════════════════════════════════════════════════════════════
// Tests E2E — Ciclo de vida de suscripción + Límites de plan
// ═══════════════════════════════════════════════════════════════════
// CRÍTICO: Valida que el billing SaaS funcione correctamente.
// Skip documentado: requieren servidor corriendo + seed + auth.
// ═══════════════════════════════════════════════════════════════════
import { test, expect } from "@playwright/test"

// Skip hasta que haya servidor + seed + auth en CI
test.skip()

test.describe("Ciclo de vida de suscripción", () => {
  test("ACTIVA → PERIODO_GRACIA al vencer sin pago", async ({ request }) => {
    const res = await request.post("/api/cron/vencimientos-suscripcion", {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body).toHaveProperty("procesadas")
  })

  test("PERIODO_GRACIA → SUSPENDIDA tras 7 días", async () => {
    // Requiere seed con suscripción en PERIODO_GRACIA con vencidoAt > 7 días
    const res = await request.post("/api/cron/vencimientos-suscripcion", {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    expect(res.ok()).toBeTruthy()
  })

  test("SUSPENDIDA → CANCELADA tras 30 días", async () => {
    // Requiere seed con suscripción en SUSPENDIDA con suspendidoAt > 30 días
    const res = await request.post("/api/cron/vencimientos-suscripcion", {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    expect(res.ok()).toBeTruthy()
  })

  test("CANCELADA → ARCHIVADA tras 90 días", async () => {
    // Requiere seed con suscripción en CANCELADA con canceladoAt > 90 días
    const res = await request.post("/api/cron/vencimientos-suscripcion", {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    expect(res.ok()).toBeTruthy()
  })

  test("Cron idempotente: segunda ejecución no salta estados", async () => {
    const res1 = await request.post("/api/cron/vencimientos-suscripcion", {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    const body1 = await res1.json()
    const res2 = await request.post("/api/cron/vencimientos-suscripcion", {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    const body2 = await res2.json()
    // Segunda ejecución no debe procesar las mismas transiciones
    expect(body2.procesadas).toBeLessThanOrEqual(body1.procesadas)
  })

  test("Cron sin CRON_SECRET retorna 401", async ({ request }) => {
    const res = await request.post("/api/cron/vencimientos-suscripcion")
    expect(res.status()).toBe(401)
  })

  test("Owner bloqueado con suscripción SUSPENDIDA (política B)", async () => {
    // Un owner con suscripción SUSPENDIDA debe recibir 402 en rutas de negocio
    // pero los apoderados del mismo tenant deben poder operar
    // [Requiere auth + seed con tenant suspendido]
  })

  test("Apoderado puede operar con suscripción SUSPENDIDA (política B)", async () => {
    // Un apoderado del tenant suspendido debe poder crear pedidos
    // [Requiere auth + seed con tenant suspendido]
  })

  test("Pago confirmado saca al tenant de gracia/suspensión", async () => {
    // Super Admin confirma pago → suscripción vuelve a ACTIVA
    // [Requiere auth de Super Admin]
  })

  test("Cancelación requiere confirmación CANCELAR literal", async () => {
    // Sin "CANCELAR" exacto → error 400
    const res = await request.post("/api/billing/cancelar", {
      data: { confirmacion: "cancelar" }, // lowercase → debe fallar
    })
    expect(res.status()).toBe(400)
  })
})

test.describe("Límites de plan", () => {
  test("No se puede crear colegio si se alcanzó el límite", async () => {
    // [Requiere auth + seed con tenant en plan Starter (1 colegio) y 1 colegio creado]
  })

  test("Downgrade rechazado si excede límites del plan menor", async () => {
    // [Requiere auth + seed con tenant con 3 colegios intentando bajar a Starter]
  })

  test("Upgrade inmediato con prorrateo", async () => {
    // [Requiere auth + Super Admin o owner]
  })
})
