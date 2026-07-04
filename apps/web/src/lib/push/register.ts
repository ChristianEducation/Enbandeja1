// ═══════════════════════════════════════════════════════════════════
// registrarPushSubscription — Registro client-side de Web Push
// ═══════════════════════════════════════════════════════════════════
// 1. Registra service worker
// 2. Pide permiso de notificación
// 3. Crea PushSubscription con VAPID public key
// 4. POST a /api/push/registrar-token
// ═══════════════════════════════════════════════════════════════════

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const base64Url = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64Url)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registrarPushSubscription(): Promise<{
  success: boolean
  error?: string
}> {
  // Verificar soporte
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { success: false, error: "Push no soportado en este navegador" }
  }

  try {
    // 1. Registrar service worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })
    await navigator.serviceWorker.ready

    // 2. Pedir permiso
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      return { success: false, error: "Permiso de notificación denegado" }
    }

    // 3. Crear suscripción con VAPID
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
    })

    // 4. Enviar al backend
    const res = await fetch("/api/push/registrar-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: JSON.stringify(subscription),
        platform: "web",
      }),
    })

    const data = await res.json()
    if (!data.success) {
      return { success: false, error: data.error || "Error al registrar token" }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return { success: false, error: message }
  }
}
