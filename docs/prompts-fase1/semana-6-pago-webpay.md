═════════════════════════════════════════════════════════════════════
ENBANDEJA — FASE 1 · SEMANA 6
FLUJO DE PAGO END-TO-END (WEBPAY SANDBOX)
═════════════════════════════════════════════════════════════════════

⚠️ SEMANA CRÍTICA. Aquí toca dinero, idempotencia y transacciones atómicas. Cero improvisación. Todo sale del plan.md y del agente backend.

ROL: Senior Architect de Enbandeja, Semana 6 de Fase 1. Implementas el flujo de pago más delicado del sistema.

PROTOCOLO DE INICIO:
> "Contexto absorbido. Fase 1 Semana 6 — Flujo de pago Webpay.
> Semana 5 completada. Voy a crear: pantalla /resumen,
> /api/pedidos/crear, integración Webpay SDK sandbox,
> return /api/payment/webpay/return con commit(token_ws) oficial
> + PaymentEventLog idempotente, transacción atómica de
> confirmación, flujo especial totalPagado=0, cron de pedidos
> expirados. Invariante Pedido.total garantizada a 3 niveles.
> Esperando autorización para Tarea 1."

LECTURA OBLIGATORIA:
1. ledger.md
2. docs/plan.md sección 5 Fase 1 Semana 6 + sección B4 (decisión arquitectónica del flujo de pago)
3. docs/agentes/backend.md sección 4 (webhooks reglas de oro) + sección 3 (middlewares)
4. docs/agentes/database.md sección 5 (CHECK constraints de Pedido)
5. docs/resources.md (URLs oficiales de Transbank — Webpay Plus REST)

════ RESTRICCIONES INNEGOCIABLES ═══

- Credenciales de pago se leen desde PaymentProviderConfig del tenant, NO desde env vars globales
- La ÚNICA env var global es PAYMENT_ENCRYPTION_KEY (para cifrar/descifrar apiKey/secretKey)
- Ambiente Webpay SOLO en INTEGRACIÓN (PaymentProviderConfig.environment = "integration")
- Webpay Plus NO usa webhooks externos firmados. El flujo oficial es:
  1. Crear transacción → redirigir a Webpay con url + token
  2. Usuario paga en Webpay
  3. Webpay redirige de vuelta al comercio con token_ws en POST
  4. El comercio llama commit(token_ws) para confirmar
- NO inventar firmas HMAC. Transbank NO envía HMAC en el return.
- La ruta /api/payment/webpay/return recibe token_ws vía POST desde Webpay
- PaymentEventLog (ex WebhookEventLog) es bitácora INTERNA del resultado del commit,
  NO un verificador de firma externa. Se usa para idempotencia.
- PedidoItem guarda snapshot INMUTABLE de nombre/precio/subtotal
- Invariante total = creditoAplicado + totalPagado en 3 niveles
- Transacción atómica: actualizar Pedido + decrementar stock + generar crédito
- Flujo totalPagado=0 NO pasa por pasarela, va directo a PAGADO
- Cron de limpieza iterando por timezone de cada tenant
- NO cambiar Webpay por Flow
- NO implementar MercadoPago todavía (Fase 4)
- NO implementar UI de configuración de pasarelas (Fase 4)

════ TAREAS ═══

TAREA 1 — Helper de cifrado/descifrado y configuración Webpay por tenant

Crear packages/database/src/queries/payment-config.ts:
- Función getPaymentProviderConfig(db, provider): busca la configuración activa del tenant para el provider indicado (ej: WEBPAY). Usa createTenantClient para que RLS filtre automáticamente.
- Retorna: { commerceCode, apiKey, secretKey, environment } — con apiKey y secretKey descifrados.
- Si no existe configuración activa → lanza PaymentProviderNotConfiguredError.

Crear apps/web/src/lib/payments/encryption.ts:
- Función encrypt(plaintext: string): string — AES-256-GCM con PAYMENT_ENCRYPTION_KEY. Retorna base64(iv:ciphertext:authTag).
- Función decrypt(ciphertext: string): string — reverso del anterior.
- La env var PAYMENT_ENCRYPTION_KEY debe ser exactamente 32 bytes (hex de 64 chars).

Crear apps/web/src/lib/payments/webpay.ts:
- Instalar transbank-sdk ^5.0.0 en apps/web/package.json si no está.
- Función iniciarTransaccionWebpay(orderId, pedidoId, amount, returnUrl, providerConfig):
  - Crea instancia de WebpayPlus con commerceCode, apiKey (descifrada), environment desde providerConfig
  - buyOrder = orderId
  - sessionId = pedidoId
  - returnUrl = `${APP_URL}/api/payment/webpay/return`
  - amount = totalPagado (en CLP enteros)
  - Llama a WebpayPlus.Transaction.create()
  - Retorna { token, url } — el token es el que Webpay usará para redirigir
- Función confirmarTransaccionWebpay(token_ws, providerConfig):
  - Crea instancia con las credenciales del providerConfig
  - Llama a WebpayPlus.Transaction.commit(token_ws) — método oficial del SDK
  - Retorna la respuesta oficial de Transbank (response_code, authorization_code, etc.)
  - NUNCA usa WEBPAY_COMMERCE_CODE ni WEBPAY_API_KEY como env vars directas.

TAREA 2 — Validator Zod del Pedido con invariante

Crear/verificar packages/shared/src/validators/pedido.ts con CrearPedidoSchema que incluya .refine() de la invariante:
total === creditoAplicado + totalPagado
Y refine del XOR de PedidoItem (tipo + FK correspondiente).
Referencia: docs/agentes/backend.md sección 7.

TAREA 3 — Helper calcularTotal en backend

Crear apps/web/src/lib/pedidos/calcular-total.ts:
- Función calcularTotal(db, items): recalcula total en backend usando getPrecioParaComensal para cada item
- NUNCA confiar en el total enviado por el frontend
- Retorna { total, itemsConPrecioActualizado }

TAREA 4 — Helper aplicarCredito

Crear apps/web/src/lib/pedidos/aplicar-credito.ts:
- Función aplicarCredito(db, total, apoderadoId): retorna creditoAplicado
- Busca CreditoApoderado del apoderado en el tenant actual
- Aplica el mínimo entre credito disponible y total
- NO descuenta del crédito aún (eso lo hace la transacción en el return handler)

TAREA 5 — API /api/pedidos/crear

Crear apps/web/src/app/api/pedidos/crear/route.ts:
- POST envuelto en withAuth + verificarSuscripcion
- Valida con CrearPedidoSchema
- Verifica que los comensales pertenecen al apoderado
- Recalcula total y credito en backend
- Genera orderId único (formato ENB-{tenant}-{timestamp}-{random})
- Si totalPagado === 0: llama a crearPedidoMontoZero (Tarea 6)
- Si totalPagado > 0:
  - Obtiene providerConfig = await getPaymentProviderConfig(db, "WEBPAY")
  - Crea Pedido en estado PENDIENTE_PAGO con Items
  - Llama a iniciarTransaccionWebpay(orderId, pedidoId, totalPagado, returnUrl, providerConfig)
  - Retorna { pedido, urlPasarela: url, token, requierePago: true }

TAREA 6 — Flujo monto cero (becados)

Crear función crearPedidoMontoZero en el mismo archivo:
- Transacción atómica:
  - Crear Pedido directamente en PAGADO
  - orderId: "INTERNO-..." para distinguir
  - metodoPago: null
  - transactionId: "INTERNO-{timestamp}"
  - Crear items con snapshot inmutable
  - Decrementar stock de opciones con stockMax
  - Descontar CreditoApoderado + crear CreditoMovimiento
- Retorna { pedido, requierePago: false }

TAREA 7 — Return/confirmación Webpay /api/payment/webpay/return

Crear apps/web/src/app/api/payment/webpay/return/route.ts:

IMPORTANTE: Esta ruta NO es un webhook externo firmado. Es el return URL oficial
de Webpay Plus. Transbank redirige al usuario aquí vía POST con token_ws.

- POST sin withAuth (el usuario viene de vuelta desde Webpay, sin sesión propia)
- Lee token_ws del body (puede venir como form-encoded o query param)
- Si no hay token_ws → retorna 400
- Busca el Pedido asociado: usar token para relacionar con la transacción original
  (el sessionId que se pasó al crear la transacción = pedidoId)
- Obtiene providerConfig del tenant del pedido
- Verifica idempotencia: si PaymentEventLog ya tiene evento procesado para este
  token_ws → retorna resultado cached (no re-procesa)
- Llama a confirmarTransaccionWebpay(token_ws, providerConfig):
  - Esto ejecuta commit(token_ws) oficial del SDK Webpay
  - La respuesta incluye: response_code, authorization_code, buy_order, session_id, etc.
- Si response_code !== 0 (rechazada):
  - Marca Pedido como RECHAZADO
  - Registra en PaymentEventLog
  - Redirect a /pago-rechazado con detalles
- Si response_code === 0 (aprobada):
  - Transacción atómica:
    - Upsert PaymentEventLog con resultado del commit
    - Actualizar Pedido a PAGADO con transactionId = authorization_code
    - Verificar stock disponible de cada item
    - Si stock insuficiente: revertir pedido (CANCELADO) + restaurar crédito
    - Si OK: decrementar stockActual de OpcionMenu / ProductoKiosco
    - Si creditoAplicado > 0: descontar CreditoApoderado + crear CreditoMovimiento
    - Marcar PaymentEventLog.processed = true con processedAt
  - Fuera de la transacción: enviar notificación push (stub en Semana 6, real en Semana 7)
  - Redirect a /confirmacion

NOTA SOBRE PaymentEventLog vs WebhookEventLog:
- El modelo en DB se mantiene como WebhookEventLog (ya existe en schema).
- Conceptualmente funciona como bitácora interna/idempotente del resultado del commit.
- Para Webpay NO es un webhook externo firmado. Es un registro interno.
- El campo eventType puede ser "WEBPAY_COMMIT" en vez de "WEBPAY_CONFIRMATION".
- El campo orderId sigue siendo útil para idempotencia.
- El campo payload guarda la respuesta completa del commit para auditoría.

TAREA 8 — Pantalla /resumen

Crear apps/web/src/app/(apoderado)/resumen/page.tsx:
- Server Component
- Recibe datos del pedido vía searchParams o sessionStorage
- Renderiza Bento Card con:
  - Lista de items con snapshot visible
  - Desglose: subtotal, crédito aplicable, total a pagar
  - Si totalPagado === 0: mensaje "Cubierto por crédito/beca"
  - Botón primary "Confirmar y pagar" o "Confirmar" si monto 0
- Al submit llama a /api/pedidos/crear
- Si requierePago === true: redirect a urlPasarela (URL de Webpay con token)
- Si requierePago === false: redirect a /confirmacion

TAREA 9 — Cron de pedidos expirados

Crear apps/web/src/app/api/cron/pedidos-expirados/route.ts:
- POST con verificación de CRON_SECRET (Bearer)
- Busca Pedidos en PENDIENTE_PAGO creados hace más de 2h
- Itera por tenant.timezone usando toZonedTime
- Marca como EXPIRADO
- Registra en AuditLog

Agregar a vercel.json: { "path": "/api/cron/pedidos-expirados", "schedule": "0 * * * *" }

TAREA 10 — Tests E2E críticos

Crear tests/e2e/critical/pedido-flow.spec.ts:
- Test: "apoderado crea pedido con monto > 0 y redirige a Webpay"
- Test: "pedido con totalPagado=0 va directo a PAGADO"
- Test: "invariante Pedido.total se valida en Zod, backend y DB"

Crear tests/e2e/critical/webpay-return.spec.ts:
- Test: "return Webpay sin token_ws retorna 400"
- Test: "commit Webpay idempotente: segunda confirmación no duplica stock/crédito"
- Test: "commit Webpay con stock insuficiente revierte y genera crédito"
- Test: "commit Webpay exitoso actualiza pedido y decrementa stock"

TAREA 11 — Verificación final

pnpm type-check
pnpm lint
pnpm test:e2e --filter=pedido-flow
pnpm test:e2e --filter=webpay-return
pnpm build

════ CHECKLIST ANTI-PATRONES ═══

[ ] Credenciales de pago desde PaymentProviderConfig del tenant, NO env vars
[ ] PAYMENT_ENCRYPTION_KEY es la única env var global de pagos
[ ] apiKey/secretKey cifrados con AES-256-GCM antes de almacenar
[ ] PaymentProviderConfig.environment = integration (NO production)
[ ] Webpay confirma con commit(token_ws) oficial del SDK
[ ] PaymentEventLog (WebhookEventLog en DB) con orderId/token_ws único para idempotencia
[ ] NO se inventan firmas HMAC — Transbank NO firma el return
[ ] PedidoItem tiene snapshot nombre/precio/subtotal
[ ] Invariante total validada en Zod + backend + CHECK constraint
[ ] Backend recalcula total, NO confía en frontend
[ ] Transacciones atómicas con $transaction
[ ] Flujo monto 0 NO pasa por pasarela
[ ] Cron itera por timezone, NO hardcodea America/Santiago
[ ] Webpay como provider (NO Flow)
[ ] MercadoPago NO implementado todavía (Fase 4)
[ ] UI de configuración de pasarelas NO implementada (Fase 4)

════ LEDGER ═══
"Fase 1 Semana 6 — Flujo de pago Webpay COMPLETADA", próxima "Semana 7 — Confirmación, push, historial, perfil".
═════════════════════════════════════════════════════════════════════
