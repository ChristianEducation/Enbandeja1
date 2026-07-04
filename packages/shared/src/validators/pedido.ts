// ═══════════════════════════════════════════════════════════════════
// Validators — Pedido con invariante contable
// ═══════════════════════════════════════════════════════════════════
// Invariante: total = creditoAplicado + totalPagado
// Garantizado en 3 niveles: Zod (aquí), backend (recálculo), DB (CHECK)
//
// XOR en PedidoItem: un item es OPCIÓN_MENU o PRODUCTO_KIOSKO,
// nunca ambos, nunca ninguno.
// ═══════════════════════════════════════════════════════════════════

import { z } from "zod"

// ───────────────────────────────────────────────────────────────────
// Item del pedido
// ───────────────────────────────────────────────────────────────────

export const CrearPedidoItemSchema = z.object({
  comensalId: z.string().uuid(),
  opcionMenuId: z.string().uuid().optional(),
  productoKioscoId: z.string().uuid().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe ser YYYY-MM-DD"),
  tipo: z.enum(["OPCION_MENU", "PRODUCTO_KIOSCO"]),
  cantidad: z.number().int().min(1).default(1),
}).refine(
  // XOR: exactamente uno de los dos FKs debe estar presente
  (data) => {
    const hasOpcion = !!data.opcionMenuId
    const hasKiosko = !!data.productoKioscoId
    return (hasOpcion && !hasKiosko) || (!hasOpcion && hasKiosko)
  },
  {
    message: "Un item debe tener opcionMenuId O productoKioscoId, nunca ambos ni ninguno",
  }
).refine(
  // Tipo debe coincidir con el FK presente
  (data) => {
    if (data.tipo === "OPCION_MENU") return !!data.opcionMenuId
    if (data.tipo === "PRODUCTO_KIOSCO") return !!data.productoKioscoId
    return false
  },
  {
    message: "El tipo debe coincidir con el FK proporcionado",
  }
)

export type CrearPedidoItemInput = z.infer<typeof CrearPedidoItemSchema>

// ───────────────────────────────────────────────────────────────────
// Pedido completo
// ───────────────────────────────────────────────────────────────────

export const CrearPedidoSchema = z.object({
  colegioId: z.string().uuid(),
  items: z.array(CrearPedidoItemSchema).min(1, "Debe haber al menos un item"),
  creditoAplicado: z.number().int().min(0).default(0),
}).transform((data) => {
  // El total se calcula en backend, no viene del frontend.
  // Pero incluimos creditoAplicado para que el backend sepa
  // cuánto crédito quiere aplicar el apoderado.
  return {
    ...data,
    creditoAplicado: data.creditoAplicado,
  }
})

export type CrearPedidoInput = z.infer<typeof CrearPedidoSchema>

// ───────────────────────────────────────────────────────────────────
// Validador de invariante contable (se usa en backend después del recálculo)
// ───────────────────────────────────────────────────────────────────

export const PedidoInvarianteSchema = z.object({
  total: z.number().int().min(0),
  creditoAplicado: z.number().int().min(0),
  totalPagado: z.number().int().min(0),
}).refine(
  (data) => data.total === data.creditoAplicado + data.totalPagado,
  {
    message: "Invariante contable: total debe ser igual a creditoAplicado + totalPagado",
  }
)

export type PedidoInvarianteInput = z.infer<typeof PedidoInvarianteSchema>

/**
 * Valida la invariante contable del pedido.
 * Se llama DESPUÉS de recalcular total y creditoAplicado en backend.
 */
export function validarInvarianteContable(
  total: number,
  creditoAplicado: number,
  totalPagado: number
): { valid: boolean; error?: string } {
  const result = PedidoInvarianteSchema.safeParse({
    total,
    creditoAplicado,
    totalPagado,
  })

  if (result.success) return { valid: true }
  return {
    valid: false,
    error: result.error.issues[0]?.message ?? "Invariante contable no se cumple",
  }
}
