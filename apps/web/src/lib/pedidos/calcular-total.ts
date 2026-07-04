// ═══════════════════════════════════════════════════════════════════
// calcularTotal — Recálculo de total en backend
// ═══════════════════════════════════════════════════════════════════
// NUNCA confía en el total enviado por el frontend.
// Usa getPrecioParaComensal para cada item, respetando CategoriaPrecio.
// Retorna el total real y los items con precio actualizado.
// ═══════════════════════════════════════════════════════════════════

import { getPrecioParaComensal } from "@enbandeja/database"

interface ItemParaCalculo {
  comensalId: string
  opcionMenuId?: string | null
  productoKioscoId?: string | null
  tipo: "OPCION_MENU" | "PRODUCTO_KIOSCO"
  cantidad: number
}

interface ItemConPrecio extends ItemParaCalculo {
  precio: number
  subtotal: number
}

interface ResultadoCalculo {
  total: number
  itemsConPrecio: ItemConPrecio[]
  errores: Array<{ item: ItemParaCalculo; error: string }>
}

/**
 * Recalcula el total del pedido usando precios reales del backend.
 *
 * Para items de tipo OPCION_MENU: usa getPrecioParaComensal (respeta CategoriaPrecio).
 * Para items de tipo PRODUCTO_KIOSCO: busca el precio del producto directamente.
 *
 * @param db - TenantClient (con RLS inyectado)
 * @param items - Items del carrito enviados por el frontend
 * @returns Total recalculado + items con precio actualizado + errores si hay
 */
export async function calcularTotal(
  db: any, // TenantClient
  items: ItemParaCalculo[]
): Promise<ResultadoCalculo> {
  let total = 0
  const itemsConPrecio: ItemConPrecio[] = []
  const errores: Array<{ item: ItemParaCalculo; error: string }> = []

  for (const item of items) {
    try {
      let precio: number

      if (item.tipo === "OPCION_MENU" && item.opcionMenuId) {
        precio = await getPrecioParaComensal(db, item.opcionMenuId, item.comensalId)
      } else if (item.tipo === "PRODUCTO_KIOSCO" && item.productoKioscoId) {
        const producto = await db.productoKiosco.findUniqueOrThrow({
          where: { id: item.productoKioscoId },
          select: { precio: true },
        })
        precio = producto.precio
      } else {
        throw new Error("Tipo de item no reconocido o FK faltante")
      }

      const subtotal = precio * item.cantidad
      total += subtotal

      itemsConPrecio.push({
        ...item,
        precio,
        subtotal,
      })
    } catch (error) {
      errores.push({
        item,
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  return { total, itemsConPrecio, errores }
}
