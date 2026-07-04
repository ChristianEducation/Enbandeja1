import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════
// Validators de Comensal y Vinculación — Enbandeja
// ═══════════════════════════════════════════════════════════════════
// Validación Zod frontend + backend (Regla CLAUDE.md: todo formulario
// valida con Zod en ambos lados).
// ═══════════════════════════════════════════════════════════════════

/**
 * Enum de vínculos del comensal con el apoderado.
 * Debe coincidir con el enum VinculoComensal de Prisma.
 */
const vinculoComensalValues = ['PADRE', 'MADRE', 'ADULTO_RESPONSABLE', 'ESTUDIANTE'] as const

/**
 * Schema para crear un comensal nuevo.
 * Se usa en el onboarding del apoderado (Tarea 6).
 */
export const crearComensalSchema = z.union([
  // PATH A: vincular comensal precargado (comensalId obligatorio)
  z.object({
    comensalId: z.string().uuid('ID de comensal inválido'),
    colegioId: z.string().uuid('ID de colegio inválido'),
    vinculo: z.enum(vinculoComensalValues, {
      errorMap: () => ({ message: 'Selecciona tu relación con el comensal' }),
    }),
    // opcionales que no se usan en este path
    nombre: z.string().optional(),
    apellido: z.string().optional(),
    curso: z.string().optional(),
    nivel: z.string().optional(),
    categoriaPrecioId: z.string().uuid().optional(),
  }),
  // PATH B: crear comensal nuevo (sin comensalId)
  z.object({
    comensalId: z.undefined(),
    colegioId: z.string().uuid('ID de colegio inválido'),
    nombre: z
      .string()
      .min(2, 'Nombre debe tener al menos 2 caracteres')
      .max(100, 'Nombre no puede exceder 100 caracteres')
      .trim(),
    apellido: z
      .string()
      .min(2, 'Apellido debe tener al menos 2 caracteres')
      .max(100, 'Apellido no puede exceder 100 caracteres')
      .trim(),
    curso: z
      .string()
      .min(1, 'Curso es obligatorio')
      .max(20, 'Curso no puede exceder 20 caracteres')
      .trim(),
    nivel: z.string().max(50).optional(),
    vinculo: z.enum(vinculoComensalValues, {
      errorMap: () => ({ message: 'Selecciona tu relación con el comensal' }),
    }),
    categoriaPrecioId: z
      .string()
      .uuid('ID de categoría de precio inválido')
      .optional(),
  }),
])

/**
 * Schema para validar el código de casino en el onboarding.
 * 5-6 caracteres alfanuméricos no ambiguos.
 */
export const vincularCodigoSchema = z.object({
  codigoCasino: z
    .string()
    .min(5, 'El código debe tener al menos 5 caracteres')
    .max(6, 'El código no puede exceder 6 caracteres')
    .regex(
      /^[A-Z0-9]{5,6}$/,
      'Código inválido. Solo letras mayúsculas y números'
    )
    .transform((val) => val.trim().toUpperCase()),
})

export type CrearComensalInput = z.infer<typeof crearComensalSchema>
export type VincularCodigoInput = z.infer<typeof vincularCodigoSchema>
