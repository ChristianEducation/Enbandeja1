// ═══════════════════════════════════════════════════════════════════
// enviarPush + crearNotificacion — Helpers de notificación push
// ═══════════════════════════════════════════════════════════════════
// enviarPush: usa web-push para enviar notificación a tokens activos
// crearNotificacion: crea NotificacionLog + envía push si canal incluye PUSH
//
// REGLA: push NO bloquea el webhook (va fuera de $transaction)
// ═══════════════════════════════════════════════════════════════════

import webpush from "web-push"
import { prisma } from "@enbandeja/database"

// ───────────────────────────────────────────────────────────────────
// Configurar web-push con VAPID keys
// ───────────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ""
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:contacto@enbandeja.cl"

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// ───────────────────────────────────────────────────────────────────
// Tipos
// ───────────────────────────────────────────────────────────────────
interface PushPayload {
  titulo: string
  mensaje: string
  ruta?: string
}

type CanalNotificacion = "PUSH" | "EMAIL" | "AMBOS"

// ───────────────────────────────────────────────────────────────────
// enviarPush — Envía push a todos los tokens activos del usuario
// ───────────────────────────────────────────────────────────────────
export async function enviarPush(
  userId: string,
  payload: PushPayload
): Promise<{ enviados: number; fallidos: number }> {
  const tokens = await prisma.pushToken.findMany({
    where: { userId, isActive: true },
  })

  let enviados = 0
  let fallidos = 0

  for (const pushToken of tokens) {
    try {
      const subscription = JSON.parse(pushToken.token)
      await webpush.sendNotification(subscription, JSON.stringify(payload))
      enviados++
    } catch (err: any) {
      // 410 Gone = suscripción ya no es válida
      if (err?.statusCode === 410) {
        await prisma.pushToken.update({
          where: { id: pushToken.id },
          data: { isActive: false },
        })
      }
      fallidos++
    }
  }

  return { enviados, fallidos }
}

// ───────────────────────────────────────────────────────────────────
// crearNotificacion — Crea NotificacionLog + envía push si aplica
// ───────────────────────────────────────────────────────────────────
// REGLA: esta función se llama FUERA de $transaction.
// No debe bloquear la operación principal si falla.
// ───────────────────────────────────────────────────────────────────
export async function crearNotificacion(
  tenantId: string,
  userId: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  canal: CanalNotificacion,
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    // 1. Crear log inmutable
    await prisma.notificacionLog.create({
      data: {
        tenantId,
        userId,
        tipo,
        titulo,
        mensaje,
        canal,
        payload: (payload ?? undefined) as any,
      },
    })

    // 2. Enviar push si el canal lo incluye
    if (canal === "PUSH" || canal === "AMBOS") {
      // Fire-and-forget: no bloquear si falla
      enviarPush(userId, {
        titulo,
        mensaje,
        ruta: payload?.ruta as string | undefined,
      }).catch(() => {
        // Silenciar error de push para no bloquear
      })
    }

    // 3. Email si canal lo incluye (futura implementación)
    // if (canal === "EMAIL" || canal === "AMBOS") { ... }
  } catch (err) {
    // Log error pero no propagar — la notificación es best-effort
    console.error("[crearNotificacion] Error:", err)
  }
}
