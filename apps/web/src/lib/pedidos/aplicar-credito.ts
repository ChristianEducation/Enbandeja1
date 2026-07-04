// ═══════════════════════════════════════════════════════════════════
// aplicarCredito — Calcula crédito aplicable a un pedido
// ═══════════════════════════════════════════════════════════════════
// Busca CreditoApoderado del apoderado en el tenant/colegio actual.
// Aplica el mínimo entre crédito disponible y total.
// NO descuenta del crédito aún — eso lo hace la transacción atómica
// en el webhook (o en crearPedidoMontoZero si totalPagado=0).
// ═══════════════════════════════════════════════════════════════════
interface ResultadoCredito {
  creditoAplicado: number
  creditoDisponible: number
}

/**
 * Calcula cuánto crédito se puede aplicar a un pedido.
 *
 * @param db - TenantClient (con RLS inyectado)
 * @param total - Total del pedido en CLP enteros
 * @param apoderadoId - ID del apoderado
 * @param colegioId - ID del colegio (para unique constraint apoderadoId+colegioId)
 * @returns Crédito aplicado y crédito disponible restante
 */
export async function aplicarCredito(
  db: any, // TenantClient
  total: number,
  apoderadoId: string,
  colegioId?: string
): Promise<ResultadoCredito> {
  // Buscar crédito del apoderado
  // Si tenemos colegioId, usamos el unique compound. Si no, usamos findFirst.
  let credito: { monto: number } | null = null

  if (colegioId) {
    credito = await db.creditoApoderado.findUnique({
      where: {
        apoderadoId_colegioId: { apoderadoId, colegioId },
      },
      select: { monto: true },
    })
  } else {
    credito = await db.creditoApoderado.findFirst({
      where: { apoderadoId },
      select: { monto: true },
    })
  }

  if (!credito || credito.monto <= 0) {
    return { creditoAplicado: 0, creditoDisponible: 0 }
  }

  // Aplicar el mínimo entre crédito disponible y total
  const creditoAplicado = Math.min(credito.monto, total)
  const creditoDisponible = credito.monto - creditoAplicado

  return { creditoAplicado, creditoDisponible }
}
