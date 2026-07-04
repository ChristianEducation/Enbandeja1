═══════════════════════════════════════════════════════════════════
ENBANDEJA — FASE 1 · SEMANA 8
CANCELACIÓN Y SISTEMA DE CRÉDITO
═══════════════════════════════════════════════════════════════════

ROL: Senior Architect de Enbandeja, Semana 8. Cierras Fase 1 con
el flujo de cancelación y el sistema de crédito completo. Al
terminar esta semana, el hito de Fase 1 se cumple.

PROTOCOLO DE INICIO:
> "Contexto absorbido. Fase 1 Semana 8 — Cancelación y crédito.
> Semana 7 completada. Voy a crear: API /api/pedidos/cancelar con
> validación de hora de corte por timezone, CreditoMovimiento
> inmutable, aplicación automática del crédito en pedidos nuevos,
> UI de cancelación en historial, pantalla de movimientos de
> crédito. Al cerrar, FASE 1 COMPLETADA. Esperando autorización
> para Tarea 1."

LECTURA OBLIGATORIA:
1. ledger.md
2. docs/plan.md sección 5 Fase 1 Semana 8 + hito de Fase 1
3. docs/agentes/backend.md
4. docs/agentes/database.md (CreditoMovimiento inmutable)

═══ RESTRICCIONES ═══

- Cancelación valida hora de corte con timezone del tenant
- CreditoMovimiento es INMUTABLE (sin updatedAt/deletedAt)
- Crédito nunca negativo (CHECK constraint existente)
- Transacción atómica: cancelar item + crear crédito + movimiento
- Aplicación automática del crédito en creación de nuevos pedidos
  (helper aplicarCredito ya existe de Semana 6)

═══ TAREAS ═══

TAREA 1 — Helper validarHoraCorte
Crear apps/web/src/lib/pedidos/validar-hora-corte.ts:
- Función puedeCancelar(pedidoItem, colegio, tenant):
  - Convierte ahora UTC a timezone del tenant
  - Compara con colegio.horaCorte para la fecha del item
  - Retorna boolean + razón
- NUNCA hardcodear America/Santiago

TAREA 2 — API /api/pedidos/cancelar-item
Crear apps/web/src/app/api/pedidos/cancelar-item/route.ts:
- POST withAuth + verificarSuscripcion
- Recibe { pedidoItemId }
- Query item con pedido, colegio, tenant
- Valida que el pedido pertenece al apoderado
- Valida puedeCancelar → si no, 403 con razón
- Transacción atómica:
  - Actualizar pedidoItem: cancelado=true, canceladoAt=now,
    creditoGenerado=pedidoItem.subtotal
  - Incrementar stockActual de OpcionMenu si aplica
  - Upsert CreditoApoderado: monto += subtotal
  - Crear CreditoMovimiento: monto positivo, concepto
    "Cancelación de pedido", pedidoId
  - AuditLog
- Fuera de transacción: notificación push
- Retorna { ok, creditoGenerado }

TAREA 3 — UI de cancelación en historial
Modificar HistorialClient (Semana 7):
- En el detalle expandido de cada pedido, por cada item mostrar
  botón "Cancelar" si puedeCancelar === true
- Confirmación inline (NO modal, anti-patrón UX)
- Llama a /api/pedidos/cancelar-item
- Refresh optimista del estado

TAREA 4 — Pantalla /perfil/credito
Crear apps/web/src/app/(apoderado)/perfil/credito/page.tsx:
- Server Component
- Query CreditoApoderado + CreditoMovimiento ordenado desc
- Bento Card: saldo actual (Plus Jakarta display grande)
- Lista Bento por cada movimiento:
  - Fecha (Inter small)
  - Concepto (Inter body)
  - Monto (+verde o -rojo ámbar)
  - Pedido asociado si aplica

TAREA 5 — Integración en flujo de creación
Verificar que /api/pedidos/crear (Semana 6) llama a aplicarCredito
correctamente:
- Si apoderado tiene crédito disponible, se aplica automáticamente
  al total
- El usuario puede ver el descuento en /resumen antes de confirmar

Actualizar pantalla /resumen (Semana 6) para mostrar:
- Subtotal
- Crédito aplicado (si > 0)
- Total a pagar

TAREA 6 — Tests E2E completos de Fase 1
Crear tests/e2e/critical/cancelacion.spec.ts:
- Test: "apoderado cancela item antes de hora de corte → crédito
  generado"
- Test: "cancelación después de hora de corte retorna 403"
- Test: "crédito se aplica automáticamente en nuevo pedido"
- Test: "CreditoMovimiento es inmutable (INSERT funciona, UPDATE
  falla)"
- Test: "monto de crédito nunca negativo"

Verificar que TODOS los tests E2E de Fase 1 pasan:
  pnpm test:e2e --filter=tenant-isolation
  pnpm test:e2e --filter=pedido-flow
  pnpm test:e2e --filter=webhook-idempotencia
  pnpm test:e2e --filter=cancelacion
  pnpm test:e2e --filter=registro-flow
  pnpm test:e2e --filter=menu-apoderado
  pnpm test:e2e --filter=historial-perfil

TAREA 7 — Verificación del hito de Fase 1
Ejecutar demo manual completa:
1. Crear tenant demo en DB
2. Publicar menú manualmente (aún no hay panel operador)
3. Apoderado se registra con email
4. Ingresa código de casino DEMO1
5. Agrega comensal
6. Ve menú del día en /home
7. Selecciona opción, agrega al carrito
8. Va a /resumen, confirma
9. Completa pago en Webpay sandbox
10. Recibe notificación push
11. Ve pedido en /historial
12. Cancela item antes de corte
13. Verifica crédito en /perfil/credito
14. Crea nuevo pedido que usa el crédito automáticamente

Si los 14 pasos funcionan → hito de Fase 1 cumplido.

TAREA 8 — Verificación final
  pnpm type-check
  pnpm lint
  pnpm test:e2e
  pnpm build

TODO debe pasar.

═══ CHECKLIST ANTI-PATRONES ═══

[ ] Cancelación respeta timezone del tenant
[ ] CreditoMovimiento sin updatedAt/deletedAt
[ ] Transacción atómica (nada de estados intermedios)
[ ] Crédito se aplica automáticamente en nuevos pedidos
[ ] Cero confirmaciones modales para cancelación (inline)
[ ] CHECK constraint credito >= 0 está activo en DB

═══ LEDGER — CIERRE DE FASE 1 ═══

Actualizar con:
- "Fase 1 Semana 8 — Cancelación y crédito COMPLETADA"
- "🎉 FASE 1 COMPLETADA — Flujo del Apoderado + Pedido E2E funcional"
- Próxima fase: "Fase 2 — Panel del Operador + Gestión de Menús
  (Semanas 9-12)"
- Estado del producto: apoderado puede registrarse, vincularse,
  pedir, pagar, cancelar y usar crédito end-to-end en ambiente de
  staging

═══════════════════════════════════════════════════════════════════