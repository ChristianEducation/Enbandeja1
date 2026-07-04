import { z } from 'zod'

/** Validador para crear un tenant nuevo (onboarding) */
export const crearTenantSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  slug: z
    .string()
    .min(3, 'Slug debe tener al menos 3 caracteres')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug solo admite minúsculas, números y guiones'),
  rut: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  timezone: z.string().default('America/Santiago'),
})

/** Validador para actualizar datos del tenant */
export const actualizarTenantSchema = crearTenantSchema.partial().omit({ slug: true })

export type CrearTenantInput = z.infer<typeof crearTenantSchema>
export type ActualizarTenantInput = z.infer<typeof actualizarTenantSchema>
