// ═══════════════════════════════════════════════════════════════════
// Service Worker — Web Push notifications
// ═══════════════════════════════════════════════════════════════════
// Listener 'push': recibe payload y muestra notification
// Listener 'notificationclick': abre la app en la ruta correcta
// ═══════════════════════════════════════════════════════════════════

self.addEventListener("push", (event) => {
  let data = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    data = { titulo: "Enbandeja", mensaje: "Tienes una nueva notificación" }
  }

  const { titulo, mensaje, ruta } = data

  event.waitUntil(
    self.registration.showNotification(titulo || "Enbandeja", {
      body: mensaje || "",
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      data: { ruta: ruta || "/home" },
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const ruta = event.notification.data?.ruta || "/home"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, la enfocamos y navegamos
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(ruta)
          return client.focus()
        }
      }
      // Si no hay ventana, abrimos una nueva
      return self.clients.openWindow(ruta)
    })
  )
})
