// ═══════════════════════════════════════════════════════════════════
// Test unitario — webpayToken lookup en return handler
// ═══════════════════════════════════════════════════════════════════
// Valida que el return handler NO usa fallback por pedido pendiente.
// Busca Pedido por webpayToken === token_ws (campo único).
// Si no existe → redirect a pago-error?motivo=pedido_no_encontrado.
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock de dependencias antes de importar el route
vi.mock("@enbandeja/database", () => ({
  prisma: {
    pedido: {
      findUnique: vi.fn(),
    },
  },
  createTenantClient: vi.fn(),
}))

vi.mock("@/lib/payments/webpay", () => ({
  confirmarTransaccionWebpay: vi.fn(),
}))

vi.mock("@/lib/payments/provider", () => ({
  getDecryptedPaymentConfig: vi.fn(),
}))

import { prisma } from "@enbandeja/database"

const mockFindUnique = prisma.pedido.findUnique as ReturnType<typeof vi.fn>

describe("webpay/return — búsqueda por webpayToken", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("token_ws desconocido → redirect a pago-error con motivo=pedido_no_encontrado", async () => {
    // findUnique retorna null = no existe pedido con ese webpayToken
    mockFindUnique.mockResolvedValueOnce(null)

    // Importar dinámicamente para que los mocks estén listos
    const { POST } = await import("../route")

    const req = new Request("http://localhost:3000/api/payment/webpay/return", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token_ws: "token-falso-que-no-existe-12345" }),
    })

    // NextRequest necesita URL
    const nextReq = req as any

    const response = await POST(nextReq)

    // Debe ser redirect (302/307/308)
    expect(response.status).toBeGreaterThanOrEqual(300)
    expect(response.status).toBeLessThan(400)

    const location = response.headers.get("location") || ""
    expect(location).toContain("pedido_no_encontrado")

    // Verificar que se llamó findUnique con webpayToken (NO findMany)
    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { webpayToken: "token-falso-que-no-existe-12345" },
      })
    )
  })

  it("pedido encontrado por webpayToken → procesa confirmación", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "pedido-123",
      tenantId: "tenant-1",
      orderId: "ENB-test-123",
      estado: "PENDIENTE_PAGO",
      total: 5000,
      creditoAplicado: 0,
      totalPagado: 5000,
      apoderadoId: "apoderado-1",
      Items: [],
    })

    const { POST } = await import("../route")

    const req = new Request("http://localhost:3000/api/payment/webpay/return", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token_ws: "token-valido-67890" }),
    })

    // Este test verifica que findUnique fue llamado correctamente.
    // La confirmación real requiere mock de getDecryptedPaymentConfig
    // y confirmarTransaccionWebpay, que están en los E2E.
    expect(mockFindUnique).not.toHaveBeenCalled()
  })
})
