import { z } from 'zod'

/** Validador para crear una suscripción (onboarding o upgrade) */
export const crearSuscripcionSchema = z.object({
  planId: z.string().uuid('ID de plan inválido'),
  tipo: z.enum(['MENSUAL', 'ANUAL']).default('MENSUAL'),
  metodoPago: z.enum([
    'WEBPAY',
    'WEBPAY_ONECLICK',
    'MERCADOPAGO',
    'MERCADOPAGO_SUSCRIPCION',
    'MANUAL',
  ]).optional(),
})

/** Validador para confirmar pago manual (Super Admin) */
export const confirmarPagoSchema = z.object({
  tenantId: z.string().uuid('ID de tenant inválido'),
  monto: z.number().int().positive('El monto debe ser un entero positivo en CLP'),
  tipo: z.enum(['MENSUAL', 'ANUAL'], { errorMap: () => ({ message: 'Tipo debe ser MENSUAL o ANUAL' }) }),
  metodoPago: z.enum([
    'WEBPAY',
    'WEBPAY_ONECLICK',
    'MERCADOPAGO',
    'MERCADOPAGO_SUSCRIPCION',
    'MANUAL',
  ]).default('MANUAL'),
  transactionId: z.string().max(200).optional(),
  // Fecha de inicio del período cubierto. Si se omite, se usa la fecha actual.
  periodoInicio: z.string().datetime({ message: 'Fecha de inicio inválida (ISO 8601)' }).optional(),
})

/** Validador para cambiar de plan (upgrade/downgrade) */
export const cambiarPlanSchema = z.object({
  tenantId: z.string().uuid('ID de tenant inválido'),
  planId: z.string().uuid('ID de plan inválido'),
  tipo: z.enum(['MENSUAL', 'ANUAL']),
})

/** Validador para cancelar suscripción */
export const cancelarSuscripcionSchema = z.object({
  tenantId: z.string().uuid('ID de tenant inválido'),
  confirmacion: z.literal('CANCELAR', {
    errorMap: () => ({ message: 'Debe escribir "CANCELAR" para confirmar' }),
  }),
  motivo: z.string().max(500).optional(),
})

/** Validador para reactivar suscripción */
export const reactivarSuscripcionSchema = z.object({
  tenantId: z.string().uuid('ID de tenant inválido'),
  planId: z.string().uuid('ID de plan inválido'),
  tipo: z.enum(['MENSUAL', 'ANUAL']).default('MENSUAL'),
  monto: z.number().int().positive('El monto debe ser un entero positivo en CLP'),
  metodoPago: z.enum([
    'WEBPAY',
    'WEBPAY_ONECLICK',
    'MERCADOPAGO',
    'MERCADOPAGO_SUSCRIPCION',
    'MANUAL',
  ]).default('MANUAL'),
})

export type CrearSuscripcionInput = z.infer<typeof crearSuscripcionSchema>
export type ConfirmarPagoInput = z.infer<typeof confirmarPagoSchema>
export type CambiarPlanInput = z.infer<typeof cambiarPlanSchema>
export type CancelarSuscripcionInput = z.infer<typeof cancelarSuscripcionSchema>
export type ReactivarSuscripcionInput = z.infer<typeof reactivarSuscripcionSchema>
