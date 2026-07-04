import { z } from 'zod'

/** Validador para crear un colegio */
export const crearColegioSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(200),
  codigoCasino: z
    .string()
    .min(3, 'Código debe tener al menos 3 caracteres')
    .max(20)
    .regex(/^[A-Z0-9-]+$/, 'Código solo admite mayúsculas, números y guiones'),
  direccion: z.string().optional(),
  horaCorte: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora debe estar en formato HH:MM')
    .default('09:00'),
  kioscoActivo: z.boolean().default(false),
})

/** Validador para actualizar un colegio */
export const actualizarColegioSchema = crearColegioSchema.partial()

export type CrearColegioInput = z.infer<typeof crearColegioSchema>
export type ActualizarColegioInput = z.infer<typeof actualizarColegioSchema>
