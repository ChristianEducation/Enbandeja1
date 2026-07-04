// ═══════════════════════════════════════════════════════════════════
// Cliente Resend — Envío de emails transaccionales
// ═══════════════════════════════════════════════════════════════════
// Usa Resend SDK. RESEND_API_KEY debe estar en env.
// ═══════════════════════════════════════════════════════════════════
import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const FROM_EMAIL = 'onboarding@resend.dev' // Dev default, cambiar en prod
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Envía email de invitación a un usuario interno.
 * Plantilla simple: nombre del comercio, link, expiración.
 * Si RESEND_API_KEY no está configurado, loggea y omite.
 */
export async function enviarInvitacionEmail(params: {
  email: string
  tenantNombre: string
  token: string
  expiresAt: Date
}): Promise<void> {
  if (!resend) {
    console.log('[email] RESEND_API_KEY no configurado. Email no enviado a:', params.email)
    return
  }

  const invitationUrl = `${APP_URL}/invitacion?token=${params.token}`
  const expiracion = params.expiresAt.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: `Has sido invitado a ${params.tenantNombre} — Enbandeja`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">
            Has sido invitado a <strong>${params.tenantNombre}</strong>
          </h1>

          <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 24px;">
            Te han invitado a unirte a la plataforma Enbandeja como parte del equipo de
            <strong>${params.tenantNombre}</strong>.
          </p>

          <a href="${invitationUrl}"
             style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: white;
                    text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Aceptar invitación
          </a>

          <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            Este link expira el <strong>${expiracion}</strong>.
          </p>

          <p style="font-size: 14px; color: #6b7280; margin-top: 12px;">
            Si no esperabas esta invitación, puedes ignorar este correo.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="font-size: 12px; color: #9ca3af;">
            Enbandeja — Plataforma de gestión de casinos escolares
          </p>
        </div>
      `,
    })
    console.log('[email] Invitación enviada a:', params.email)
  } catch (error) {
    console.error('[email] Error enviando invitación:', error)
  }
}