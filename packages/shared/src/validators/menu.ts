import { z } from 'zod'

/** Validador para crear un menú del día */
export const crearMenuSchema = z.object({
  colegioId: z.string().uuid('ID de colegio inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD'),
})

/** Validador para crear una opción del menú */
export const crearOpcionMenuSchema = z.object({
  menuId: z.string().uuid('ID de menú inválido'),
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(200),
  descripcion: z.string().max(500).optional(),
  categoria: z.string().max(50).optional(),
  stockMax: z.number().int().positive('Stock debe ser positivo').optional(),
})

/** Validador para asignar precio a una opción */
export const crearPrecioOpcionSchema = z.object({
  opcionMenuId: z.string().uuid('ID de opción inválido'),
  categoriaPrecioId: z.string().uuid('ID de categoría inválido'),
  precio: z.number().int().min(0, 'Precio no puede ser negativo'),
})

/** Validador para publicar un menú (cambiar estado) */
export const cambiarEstadoMenuSchema = z.object({
  menuId: z.string().uuid('ID de menú inválido'),
  estado: z.enum(['BORRADOR', 'PUBLICADO', 'CERRADO', 'ARCHIVADO']),
})

export type CrearMenuInput = z.infer<typeof crearMenuSchema>
export type CrearOpcionMenuInput = z.infer<typeof crearOpcionMenuSchema>
export type CrearPrecioOpcionInput = z.infer<typeof crearPrecioOpcionSchema>
export type CambiarEstadoMenuInput = z.infer<typeof cambiarEstadoMenuSchema>
