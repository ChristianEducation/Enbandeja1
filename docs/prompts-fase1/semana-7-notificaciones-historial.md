═══════════════════════════════════════════════════════════════════
ENBANDEJA — FASE 1 · SEMANA 7
CONFIRMACIÓN, NOTIFICACIONES, HISTORIAL Y PERFIL
═══════════════════════════════════════════════════════════════════

ROL: Senior Architect de Enbandeja, Semana 7. Cierras el ciclo del
pedido: confirmación visual, notificación push, historial visible y
perfil del apoderado.

PROTOCOLO DE INICIO:
> "Contexto absorbido. Fase 1 Semana 7. Semana 6 completada con
> pedido E2E + webhook funcional. Voy a crear: pantalla
> /confirmacion, Web Push con VAPID + PushToken, NotificacionLog
> inmutable + NotificacionLeida separada, /historial con filtros,
> /perfil con crédito y gestión de comensales. Esperando
> autorización para Tarea 1."

LECTURA OBLIGATORIA:
1. ledger.md
2. docs/plan.md sección 5 Fase 1 Semana 7 + sección B9
   (NotificacionLog separada)
3. docs/agentes/backend.md (notificaciones)
4. docs/PLAN_MAESTRO_DISEÑO.md (layout mobile, perfil)

═══ RESTRICCIONES ═══

- NotificacionLog es INMUTABLE (sin updatedAt, sin deletedAt)
- NotificacionLeida es SEPARADA y mutable
- Web Push usa VAPID (NO Expo en v1 web)
- Historial respeta RLS: apoderado solo ve sus pedidos
- Perfil permite agregar más comensales pero NO editar categoría
  (eso lo hace el operador)

═══ TAREAS ═══

TAREA 1 — Pantalla /confirmacion
Crear apps/web/src/app/(apoderado)/confirmacion/page.tsx:
- Server Component
- Recibe pedidoId de searchParams
- Query del pedido con items incluidos
- Bento Card hero con ícono CheckCircle verde
- Título "¡Pedido confirmado!" Plus Jakarta display
- Lista de items con fecha, comensal, opción
- Total pagado grande (Plus Jakarta bold)
- Botones: "Ver historial" + "Volver al inicio"

TAREA 2 — Modelo PushToken + service worker
Verificar PushToken en schema.prisma. Campos:
  userId, token, platform (web|ios|android), isActive

Crear apps/web/public/sw.js (service worker):
- Listener 'push' que recibe payload y muestra notification
- Listener 'notificationclick' que abre la app en la ruta correcta

Crear apps/web/src/lib/push/register.ts:
- Función registrarPushSubscription() client-side
- Registra service worker
- Pide permiso
- Crea PushSubscription con VAPID public key
- POST a /api/push/registrar-token

TAREA 3 — API /api/push/registrar-token
Crear apps/web/src/app/api/push/registrar-token/route.ts:
- POST envuelto en withAuth
- Upsert PushToken por (userId, token)
- Retorna ok

TAREA 4 — Helper enviarNotificacionPush
Crear apps/web/src/lib/push/send.ts:
- Usa web-push npm package
- Función enviarPush(userId, { titulo, mensaje, payload }):
  - Query PushToken activos del user
  - Por cada token, llama web-push.sendNotification
  - Si falla con 410 (gone), marca isActive=false
- Función crearNotificacion(tenantId, userId, tipo, titulo,
  mensaje, canal, payload): crea NotificacionLog y envía push si
  canal incluye PUSH

TAREA 5 — Integrar push en el webhook
Modificar apps/web/src/app/api/payment/webhook/route.ts:
- Después de la transacción exitosa, fuera del $transaction,
  llamar a crearNotificacion con tipo PEDIDO_CONFIRMADO

TAREA 6 — Pantalla /historial
Crear apps/web/src/app/(apoderado)/historial/page.tsx:
- Server Component
- Query de pedidos del apoderado con items, ordenados desc por
  createdAt
- Pasa a HistorialClient como props

Crear apps/web/src/app/(apoderado)/historial/components/HistorialClient.tsx:
- "use client"
- Filtros: por comensal (si hay más de 1), por estado (todos,
  pagados, cancelados)
- Lista de Bento Cards, 1 por pedido
- Card muestra: fecha, total, estado (badge con color del token
  estado-pedido), comensales, botón "Ver detalle" que expande
  inline

TAREA 7 — Pantalla /perfil
Crear apps/web/src/app/(apoderado)/perfil/page.tsx:
- Server Component
- Query: user, comensales, creditoApoderado
- Pasa a PerfilClient

Crear componente PerfilClient:
- Bento Card: datos del apoderado (nombre, email, editar)
- Bento Card: comensales (lista con foto, nombre, curso) + botón
  "Agregar comensal" que abre modal/drawer
- Bento Card: crédito disponible (monto grande Plus Jakarta) con
  link a "Ver movimientos"
- Botón "Cerrar sesión" abajo

TAREA 8 — Modal/Drawer agregar comensal
Reutilizar formulario de Semana 4. Extraer componente:
  packages/ui/src/components/FormComensal.tsx
Usarlo en:
- /onboarding/comensal (Semana 4)
- /perfil drawer (Semana 7)

TAREA 9 — Badge de NotificacionLeida
Crear API /api/notificaciones/marcar-leida:
- POST con notificacionId
- Upsert NotificacionLeida

En layout del apoderado, query de notificaciones no leídas y mostrar
badge en ícono de campana en top bar.

TAREA 10 — Tests E2E
Crear tests/e2e/critical/historial-perfil.spec.ts:
- Test: "apoderado ve solo sus pedidos en historial"
- Test: "filtro por estado funciona"
- Test: "agregar comensal desde perfil funciona"
- Test: "crédito se muestra correctamente"

TAREA 11 — Verificación final
  pnpm type-check && pnpm lint && pnpm build
  pnpm test:e2e --filter=historial-perfil

═══ CHECKLIST ANTI-PATRONES ═══

[ ] NotificacionLog sin updatedAt ni deletedAt
[ ] NotificacionLeida es tabla separada
[ ] Push no bloquea el webhook (va fuera de $transaction)
[ ] Historial filtra por RLS del apoderado
[ ] Perfil no permite editar categoriaPrecio del comensal
[ ] Fechas en historial usan toZonedTime del tenant

═══ LEDGER ═══

"Fase 1 Semana 7 — Notificaciones, historial y perfil COMPLETADA",
próxima "Semana 8 — Cancelación y crédito".

═══════════════════════════════════════════════════════════════════