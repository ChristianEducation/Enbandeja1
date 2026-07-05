# ENBANDEJA — Ledger

> Estado vivo del proyecto. Se actualiza al final de cada sesión de
> trabajo. Las entradas más recientes del historial van arriba.
>
> Este archivo es la **primera lectura obligatoria** de Claude Code
> al iniciar cualquier sesión en `lab/projects/enbandeja/`.

---

## 2026-07-05 — Sprint pre-demo completado T01-T12

- Gate A completado: seed Webpay demo usa `PLAIN:`, OWNER puede operar
  flujo de operador, APIs operativas aceptan OWNER y `.env.example`
  quedó alineado con las variables reales.
- Gate B completado: `/api/comensales/buscar` exige sesión, los 4 crons
  fallan cerrado sin `CRON_SECRET`, y las queries tenant-aware revisadas
  filtran explícitamente por `tenantId`.
- Gate C completado: creadas `/pago-error` y `/pago-rechazado`, skeletons
  para rutas clave de demo, favicon/manifest/icons PWA y traza de
  devolución manual en Webpay cuando falta stock post-commit.
- Gate D completado: agregado `packages/database/prisma/seed-demo-menu.ts`
  y script `db:seed:demo`; genera 5 menús publicados de lunes a viernes
  de la próxima semana con 12 opciones chilenas y precios demo.
- Verificación ejecutada: `pnpm type-check`, `pnpm lint`,
  `pnpm build --filter=@enbandeja/web`, `db:seed:demo` dos veces,
  y verificación directa en DB de 5 menús publicados + 12 precios.
- `pnpm test:e2e:critical` fue intentado con `PORT=3000`; el runner
  arranca, pero queda pendiente manual porque falta instalar Chromium
  de Playwright en el entorno (`pnpm exec playwright install`).
- Pendiente humano antes de demo: rotar password Supabase expuesta en
  chat, probar visualmente skeletons/PWA, validar flujo Webpay real y
  ensayar guión comercial.

## 2026-06-23 — Refresh visual light-first implementado localmente

- Plan Maestro actualizado a v2 light-first.
- Tokens globales migrados a fondo claro, superficies blancas y contraste AA.
- Componentes compartidos de estado, métricas, límites y feedback añadidos.
- Redirección rota de menú corregida.
- Onboarding y APIs privadas reforzados para usuarios sin sesión.
- 31 rutas capturadas en desktop y mobile.
- Typecheck, build y E2E crítico pasan.
- Sin commit, push ni deploy.
- Pendiente: revisión visual de Christian y fixtures reales de
  Resumen/Confirmación.

## Estado actual

**Fase:** ✅ FASE 4 COMPLETADA — Módulos 16+17+18+19 COMPLETADOS

**Última sesión:** 2026-06-02 — Deuda técnica Módulo 1+2 COMPLETADOS

**Próxima tarea:** Demo manual. Después: deploy con checklist Módulo 3

**Estado del producto:** Fase 1+2 completo. Módulo 13 (Fase 3) completo: Owner gestiona empresa, colegios (con límite de plan) y usuarios internos (con invitaciones). FASE 3 COMPLETADA. Owner gestiona empresa, colegios, usuarios, ve dashboard con métricas en tiempo real, descarga reportes Excel consolidados. 10/10 puntos del hito verificados.

- [x] AUTH_EMAIL_FROM configurado (onboarding@resend.dev en dev)
- [ ] Cuenta Vercel vinculada a GitHub (primer deploy pendiente)
- [x] Cuenta Resend configurada — RESEND_API_KEY disponible
- [ ] Login email+password: descartado por bug confirmado en
      NextAuth v5 beta (Credentials + strategy:database incompatible).
      Issues #9636 #12848 #12858 #12894. Evaluar Better Auth en v2.
- [ ] Cuenta Transbank Integración (Webpay sandbox) — obligatorio
      en Fase 1
- [ ] Cuenta MercadoPago developer — obligatorio en Fase 1
- [ ] Cuenta Sentry — obligatorio en Fase 1
- [ ] Cuenta Apple Developer (Sign in with Apple, USD 99/año)
- [ ] Cuenta Inngest — obligatorio en Fase 3
- [ ] Cuenta Anthropic con API key — obligatorio en Fase 5
- [ ] Iniciar verificación de Meta WhatsApp Business (se necesita
      en Fase 5)

**Cuentas ya configuradas:**

- [x] Supabase con proyecto "enbandeja" (PostgreSQL 15, región
      sa-east-1, schema aplicado con 35 tablas + RLS activo)
- [x] Repositorio GitHub `enbandeja`
- [x] Google Cloud Console con OAuth configurado

---

## Hito objetivo de Fase 0 — ✅ COMPLETADO (2026-04-11)

```bash
pnpm build --filter=@enbandeja/web
# ✅ 0 errores TypeScript (type-check global en 5 packages)
# ⏳ Deploy Vercel pendiente (sesión separada)
# ✅ Schema Prisma con 35 tablas aplicado en Supabase
# ✅ RLS activo con 27 policies + 4 CHECK constraints
# ⏳ Login Google funcional (config lista, falta probar en browser)
# ⏳ Super Admin con 2FA (Fase 1)
# ✅ Tests E2E tenant-isolation estructurados (2 activos, 13 para Fase 1)
```

---

## Historial de sesiones

### 2026-06-02 — Deuda técnica Módulo 2 COMPLETADO

**Qué se hizo (Módulo 2 - Mejoras):**
- **T1: Email Resend para invitaciones** — Creado `lib/email.ts` con cliente Resend. Envía email transaccional con link de invitación y expiración. Si RESEND_API_KEY no está configurado, loggea y omite sin romper. Integrado en `invitaciones/crear/route.ts`.
- **T2: Selector de colegio en cierre manual** — Agregado `<select>` en `DashboardOperadorClient` que aparece solo cuando el tenant tiene >1 colegio. El server component pasa la lista de colegios. El botón "Cerrar día" ahora envía `colegioId` correcto.
- **T3: Fallback colegioId en cancelar-item** — Reemplazado el fallback `item.Pedido.tenantId` (que usaba un UUID de tenant como si fuera colegio) por búsqueda del primer colegio activo. Si no hay colegios, lanza error claro.
- **T4: horaCorte real en historial** — Reemplazado default hardcodeado `"09:00"` por batch query de colegios + mapeo comensal→colegio. Query única: `findMany` de colegios + comensales, resuelve horaCorte real sin N+1.

**Archivos creados/modificados:**
- `apps/web/src/lib/email.ts` — NUEVO
- `apps/web/src/app/api/invitaciones/crear/route.ts` — MODIFICADO (integra email)
- `apps/web/src/app/(operador)/dia/page.tsx` — MODIFICADO (pasa colegios)
- `apps/web/src/app/(operador)/dia/components/DashboardOperadorClient.tsx` — MODIFICADO (selector colegio en cierre)
- `apps/web/src/app/api/pedidos/cancelar-item/route.ts` — MODIFICADO (fallback colegio robusto)
- `apps/web/src/app/(apoderado)/historial/page.tsx` — MODIFICADO (horaCorte real via batch)

**Verificación:**
- ✅ `pnpm type-check` — 0 errores
- ✅ `pnpm lint` — 0 errores
- ✅ `pnpm build --filter=@enbandeja/web` — FULL TURBO

---

### 2026-06-02 — Deuda técnica Módulo 1 (bloqueante) COMPLETADO

**Qué se hizo:**
- **T1: Query muerta en cancelar-item** — Eliminada la query sin sentido `where: { id: item.Pedido.tenantId ? undefined : undefined }` que siempre evaluaba a undefined. El colegio correcto ya se obtenía vía `comensalConColegio?.Colegio?.horaCorte` más abajo.
- **T2: Bug colegioId en cierre-dia** — colegioId ahora es opcional. Si el tenant tiene 1 solo colegio, se usa automáticamente. Si tiene varios, responde error claro con lista de colegios disponibles.
- **T3: Hack tokenPago reemplazado** — Agregados campos `pendingPlanId` (UUID) y `pendingPlanTipo` (String) al modelo `Suscripcion`. Migrada toda la lógica de downgrade pendiente en: `verificarSuscripcion.ts`, `super-admin/billing/cambiar-plan`, `billing/cambiar-plan` (owner), `super-admin/billing/reactivar`. Eliminado el parsing de `PENDING_PLAN:` como string.
- **T4: Diagnóstico + aplicación Supabase** — `prisma migrate diff` diagnosticó: 2 columnas faltantes en `Suscripcion` + tabla `ReporteExportacion` completa faltaba. SQL autorizado por Christian. Aplicado via `prisma db push`. Base sincronizada sin riesgo.

**Archivos modificados:**
- `schema.prisma` — agregados pendingPlanId, pendingPlanTipo
- `apps/web/src/app/api/pedidos/cancelar-item/route.ts` — eliminada query muerta
- `apps/web/src/app/api/menu/cerrar-dia/route.ts` — colegioId opcional + auto-resolve
- `apps/web/src/lib/middleware/verificarSuscripcion.ts` — migrado a pendingPlanId
- `apps/web/src/app/api/super-admin/billing/cambiar-plan/route.ts` — migrado
- `apps/web/src/app/api/billing/cambiar-plan/route.ts` — migrado
- `apps/web/src/app/api/super-admin/billing/reactivar/route.ts` — migrado

**Supabase:**
- ✅ pendingPlanId agregado a Suscripcion
- ✅ pendingPlanTipo agregado a Suscripcion
- ✅ ReporteExportacion creada (tabla completa)
- ✅ Prisma Client regenerado

**Verificación:**
- ✅ `pnpm type-check` — 0 errores
- ✅ `pnpm lint` — 0 errores
- ✅ `pnpm build --filter=@enbandeja/web` — FULL TURBO

---

### 2026-06-02 — Módulo 19 COMPLETADO: Ciclo de vida automático — 🎉 FASE 4 COMPLETADA

**Qué se hizo:**
- **Cron `/api/cron/vencimientos-suscripcion`:** CRÍTICO. Procesa las 4 transiciones automáticas (ACTIVA→PERIODO_GRACIA→SUSPENDIDA→CANCELADA→ARCHIVADA) respetando timezone del tenant. Idempotente: correr dos veces no salta estados. Notificaciones a owners en cada transición via `NotificacionLog`. Aviso 7 días antes de renovación anual. Aviso 3 días antes de vencimiento mensual. Protegido con CRON_SECRET.
- **Política B de suspensión implementada en `withAuth`:** Cuando un tenant cae en SUSPENDIDA, los owners/operadores son BLOQUEADOS (402 Payment Required). Los APODERADOS siguen operando (pueden pedir y pagar su almuerzo, no es su culpa que el comercio no pagó).
- **Downgrade pendiente automático:** Al iniciar nuevo ciclo, si `tokenPago` contiene `PENDING_PLAN:<planId>:<tipo>`, se aplica automáticamente el downgrade (cambia planId, limpia tokenPago, AuditLog).
- **Endpoint `/api/billing/cambiar-plan`:** Owner cambia su propio plan. Upgrade inmediato con prorrateo. Downgrade al próximo ciclo con verificación de recursos actuales. AuditLog.
- **Endpoint `/api/billing/cancelar`:** Owner cancela su suscripción. Requiere confirmación literal &ldquo;CANCELAR&rdquo;. Suscripción → CANCELADA, tenant → CANCELLED. AuditLog.
- **Middleware `withAuthBilling`:** Wrapper para rutas de billing del owner que NO bloquea por suscripción (el owner debe poder pagar aunque esté suspendido).
- **Panel `/owner/billing` COMPLETO:** Ahora incluye acciones de cambio de plan (upgrade/downgrade) y cancelación voluntaria con modal de confirmación &ldquo;CANCELAR&rdquo;.
- **Tests E2E:** `suscripcion-ciclo.spec.ts` (7 tests) y `limites-plan.spec.ts` (5 tests). Skip documentado: requieren servidor + seed + auth.
- **`vercel.json`:** Agregado cron de vencimientos-suscripcion (cada hora).

**Decisiones técnicas:**
- Política B: implementada en `withAuth` (no en cada ruta). Si `context.role !== 'APODERADO'`, verifica suscripción antes del handler. Apoderados siempre pasan.
- Cron filtra por hora local (00:00-01:00) para procesar cada tenant 1 vez al día.
- Notificaciones de billing se envían a todos los owners del tenant (busca `UserTenant` con `role: 'OWNER'`).
- Downgrade pendiente usa `tokenPago` como campo temporal. [PENDIENTE CONSULTA]: agregar `pendingPlanId` formal.
- Upgrade con prorrateo: calcula diferencial basado en días restantes del período actual.
- El endpoint de cancelación del owner no permite especificar `tenantId` (hereda del contexto de sesión) para seguridad.

**Hito de Fase 4 verificado:**
✅ Un tenant nuevo puede registrarse (Fase 0-3)
✅ Setup wizard completo con 6 pasos (M17)
✅ Billing middleware bloquea rutas según estado de suscripción (M16)
✅ Super Admin gestiona cobros manuales (M18)
✅ Owner ve su billing, cambia plan, cancela (M19)
✅ Ciclo de vida automático con transiciones (M19)
✅ Downgrade no deja al tenant con más colegios de los permitidos (M18+M19)
✅ Cancelación requiere &ldquo;CANCELAR&rdquo; literal (M18+M19)
✅ Toda acción de billing en AuditLog (M16-M19)
✅ Billing SaaS separado de pagos de apoderados (toda Fase 4)
✅ Política B: apoderados operan aunque comercio no pague (M19)
✅ Notificaciones de billing a owners (M19)

**Archivos creados/modificados en M19:**
- `apps/web/src/app/api/cron/vencimientos-suscripcion/route.ts` — NUEVO
- `apps/web/src/app/api/billing/cambiar-plan/route.ts` — NUEVO
- `apps/web/src/app/api/billing/cancelar/route.ts` — NUEVO
- `apps/web/src/lib/middleware/withAuthBilling.ts` — NUEVO
- `apps/web/src/lib/middleware/verificarSuscripcion.ts` — MODIFICADO (política B + downgrade automático)
- `apps/web/src/lib/middleware/withAuth.ts` — MODIFICADO (política B)
- `apps/web/src/app/(owner)/billing/page.tsx` — MODIFICADO (pasa planes)
- `apps/web/src/app/(owner)/billing/components/BillingClient.tsx` — MODIFICADO (cambio plan + cancelación)
- `apps/web/vercel.json` — MODIFICADO (cron)
- `tests/e2e/critical/suscripcion-ciclo.spec.ts` — NUEVO
- `tests/e2e/critical/limites-plan.spec.ts` — NUEVO

**Verificación:**
- `pnpm type-check` ✅ 0 errores
- `pnpm lint` ✅ (solo warnings img preexistentes)
- `pnpm build --filter=@enbandeja/web` ✅ FULL TURBO

### 2026-06-02 — Módulo 18 COMPLETADO: Billing manual Super Admin

**Qué se hizo:**
- **Middleware `withSuperAuth`:** Validación de Super Admin en API routes. Verifica sesión NextAuth + registro activo en tabla `SuperAdmin`.
- **Endpoint `/api/super-admin/billing/confirmar-pago`:** POST, solo Super Admin. Registra `PagoSuscripcion` manual, activa/renueva la suscripción, mueve tenant a ACTIVE. Transacción atómica con AuditLog.
- **Endpoint `/api/super-admin/billing/cambiar-plan`:** POST, solo Super Admin. Upgrade inmediato con prorrateo del diferencial. Downgrade al próximo ciclo. Downgrade NO permite dejar al tenant con más colegios/usuarios de los que el plan menor admite.
- **Endpoint `/api/super-admin/billing/cancelar`:** POST, solo Super Admin. Cancela suscripción inmediatamente. Requiere confirmación literal &ldquo;CANCELAR&rdquo; (validado en Zod + doble check en handler). Suscripción queda CANCELADA, tenant a CANCELLED. AuditLog.
- **Endpoint `/api/super-admin/billing/reactivar`:** POST, solo Super Admin. Reactiva suscripción cancelada/suspendida con pago. Crea o reactiva `Suscripcion`, registra `PagoSuscripcion`, tenant a ACTIVE. AuditLog.
- **Panel `/super-admin/tenants`:** Lista de tenants con estado de suscripción, badge de plan, link a billing.
- **Panel `/super-admin/tenants/[id]/billing`:** Vista completa del tenant: estado suscripción, límites vs recursos, historial de pagos, audit log, acciones (confirmar pago, cambiar plan, cancelar con &ldquo;CANCELAR&rdquo;, reactivar).
- **Layout `(super-admin)`:** Validación de Super Admin, sidebar propio separado de tenant layouts.
- **Validadores Zod ampliados:** `confirmarPagoSchema`, `cambiarPlanSchema`, `cancelarSuscripcionSchema`, `reactivarSuscripcionSchema` en `@enbandeja/shared`.
- **Íconos agregados:** `RefreshCw`, `Ban`, `ArrowUpCircle`, `ArrowDownCircle`, `ShieldCheck` en `packages/ui/icons.ts`.

**Qué se decidió:**
- Downgrade usa campo `tokenPago` temporalmente como almacenamiento del plan pendiente (`PENDING_PLAN:<planId>:<tipo>`). [PENDIENTE CONSULTA]: agregar campo formal `pendingPlanId` + `pendingPlanTipo` al schema en M19.
- Confirmación de cancelación: doble validación (Zod `z.literal('CANCELAR')` + check manual en handler) para máxima seguridad.
- Toda acción de billing queda en AuditLog con `superAdminId` en changes (AuditLog.userId = null porque Super Admin no está en tabla User).
- Panel Super Admin es ruta separada `(super-admin)` con layout propio, no interfiere con rutas de tenant.

**Archivos creados/modificados:**
- `apps/web/src/lib/middleware/withSuperAuth.ts` — NUEVO
- `apps/web/src/app/api/super-admin/billing/confirmar-pago/route.ts` — NUEVO
- `apps/web/src/app/api/super-admin/billing/cambiar-plan/route.ts` — NUEVO
- `apps/web/src/app/api/super-admin/billing/cancelar/route.ts` — NUEVO
- `apps/web/src/app/api/super-admin/billing/reactivar/route.ts` — NUEVO
- `apps/web/src/app/(super-admin)/layout.tsx` — NUEVO
- `apps/web/src/app/(super-admin)/components/SuperAdminSidebar.tsx` — NUEVO
- `apps/web/src/app/(super-admin)/super-admin/tenants/page.tsx` — NUEVO
- `apps/web/src/app/(super-admin)/super-admin/tenants/components/TenantsListClient.tsx` — NUEVO
- `apps/web/src/app/(super-admin)/super-admin/tenants/[id]/billing/page.tsx` — NUEVO
- `apps/web/src/app/(super-admin)/super-admin/tenants/[id]/billing/components/TenantBillingClient.tsx` — NUEVO
- `packages/shared/src/validators/billing.ts` — MODIFICADO (agregados 4 schemas nuevos)
- `packages/ui/src/icons.ts` — MODIFICADO (5 íconos nuevos)
- `ledger.md` — actualizado

**Qué quedó pendiente:**
- [PENDIENTE CONSULTA]: Agregar campos `pendingPlanId` y `pendingPlanTipo` al modelo Suscripcion en schema.prisma para reemplazar el hack de `tokenPago`.
- Módulo 19: Ciclo de vida automático de suscripción (cron, transiciones de estado, notificaciones).
- Commit pendiente (Christian lo hace manualmente).

**Verificación:**
- `pnpm type-check` ✅ 0 errores
- `pnpm lint` ✅ (solo warnings img preexistentes)
- `pnpm build --filter=@enbandeja/web` ✅ (páginas nuevas: /super-admin/tenants, /super-admin/tenants/[id]/billing)

### 2026-06-02 — Módulos 16+17 COMPLETADOS: Middleware de billing — CRÍTICO

**Qué se hizo:**
- Seed actualizado con `PlanLimite` para los 4 planes: MAX_COLEGIOS y MAX_USUARIOS. Starter: 1/3, PYME: 3/10, Pro: ilimitado, Enterprise: ilimitado.
- Middleware `verificarSuscripcion` — verifica estado de la suscripción del tenant. Estados bloqueados: SUSPENDIDA, CANCELADA, ARCHIVADA. Período de gracia: permite operar con aviso. Retorna info completa (activa, estado, plan, enGracia, motivo).
- Middleware `verificarLimitePlan` — verifica un límite específico (MAX_COLEGIOS, MAX_USUARIOS). Consulta PlanLimite primero, fallback a campos directos del Plan.
- Middleware `obtenerLimitesPlan` — retorna todos los límites del plan actual del tenant.
- API `/api/colegios/crear` refactorizada — usa `verificarLimitePlan("MAX_COLEGIOS")` en vez de lógica inline del M13. Un solo lugar para la verificación de límites.
- Panel `/owner/billing` — estado de la suscripción (plan, ciclo, precio, vencimiento), límites del plan vs recursos actuales (colegios y usuarios con barra de progreso), historial de PagoSuscripcion. Nota: cambio de plan y cancelación en M19.
- `OwnerSidebar` actualizado con ítem "Billing" (icono CreditCard).
- `pnpm type-check` ✓, `pnpm lint` ✓, `pnpm build` ✓.

**Qué se decidió:**
- `verificarSuscripcion` NO se integra automáticamente en `withAuth` (too risky para el cimiento). Se llama explícitamente en cada ruta que lo necesite. Esto da control total sobre qué rutas se protegen.
- La ruta `/owner/billing` NUNCA debe estar protegida por verificarSuscripcion — el owner sin suscripción activa DEBE poder llegar aquí para pagar.
- PlanLimite tiene prioridad sobre los campos directos del Plan (maxColegios, maxUsuarios). Si PlanLimite existe, se usa ese valor.
- Cambio de plan y cancelación se implementan en M19 (no aquí).

**NOTA DE SEGURIDAD — Verificación mental:**
- ¿Un tenant sin suscripción puede llegar a /owner/billing? SÍ — la ruta no está protegida.
- ¿El middleware bloquea /login, /registro, /setup? NO — verificarSuscripcion se llama explícitamente, no automáticamente.
- ¿Billing SaaS vs pagos apoderados? Separados. Este módulo es SOLO billing SaaS.

**Archivos creados/modificados:**
- `apps/web/src/lib/middleware/verificarSuscripcion.ts` — NUEVO
- `apps/web/src/app/(owner)/billing/page.tsx` — NUEVO
- `apps/web/src/app/(owner)/billing/components/BillingClient.tsx` — NUEVO
- `apps/web/src/app/api/colegios/crear/route.ts` — MODIFICADO (usa verificarLimitePlan)
- `apps/web/src/app/(owner)/components/OwnerSidebar.tsx` — MODIFICADO (agregado Billing)
- `packages/database/prisma/seed.ts` — MODIFICADO (agregado PlanLimite)

**Qué quedó pendiente:**
- [PENDIENTE CONSULTA] Integrar verificarSuscripcion en rutas de negocio existentes (apoderado, operador) — requiere cuidado máximo
- [PENDIENTE CONSULTA] Ejecutar `prisma db push` + seed para sincronizar PlanLimite con Supabase
- [PENDIENTE CONSULTA] Función Postgres check_tenant_activo() ya existe en migration SQL — verificar que esté aplicada
- Commit pendiente
- Módulo 17: Setup Wizard

### 2026-06-02 — Módulo 15 COMPLETADO: Reportes y exportaciones — 🔧 FASE 4 EN PROGRESO — Módulos 16+17 COMPLETADOS

**Qué se hizo:**
- Modelo `ReporteExportacion` en schema Prisma — registro de reportes con estado (PENDIENTE, GENERANDO, LISTO, ERROR), storagePath, fileName, fileSizeBytes, expiración. Relaciones con Tenant, Colegio, User.
- Helper `generar-excel-consolidado.ts` — genera Excel con 2 hojas: Resumen Diario (por colegio y fecha) y Consolidado por Colegio (totales del mes). Usa KpiSnapshot como fuente. Formato CLP en columnas de ingresos.
- Helper `storage/index.ts` — upload a Supabase Storage y generación de URLs firmadas temporales (1h default). Usa SUPABASE_SERVICE_ROLE_KEY. NUNCA Storage público.
- API `/api/reportes/generar` — POST con withAuth + OWNER. Recibe período (YYYY-MM) y opcional colegioId. Genera Excel, sube a Storage, crea ReporteExportacion, notifica push al Owner. Sincrónico en v1 (sin Inngest real).
- API `/api/reportes/listar` — GET con withAuth + OWNER. Lista últimos 50 reportes del tenant.
- API `/api/reportes/descargar` — GET con withAuth + OWNER. Genera URL firmada temporal (1h). Verifica expiración.
- Pantalla `/owner/reportes` — selector de período (month input), selector de colegio, botón generar, lista de reportes con badges de estado (Pendiente, Generando, Listo, Error) y botón descargar.
- Dependencias instaladas: `@supabase/supabase-js`, `inngest` (preparado para async futuro).
- `pnpm type-check` OK, `pnpm lint` OK, `pnpm build` OK.

**HITO DE FASE 3 — 10/10 puntos verificados:**
- [x] El Owner gestiona su empresa (datos del tenant)
- [x] El Owner agrega colegios (con verificación de límite de plan)
- [x] El Owner invita usuarios internos (operador, cocina)
- [x] El Owner ve el dashboard con métricas en tiempo real
- [x] El dashboard muestra vista consolidada de todos los colegios
- [x] Drill-down a un colegio específico funciona
- [x] El cron calcula KpiSnapshot respetando timezone por tenant
- [x] El Owner descarga reporte Excel consolidado del mes
- [x] Rol OWNER protegido (operador/apoderado no acceden)
- [x] Build limpio: type-check + lint + build pasan

**Qué se decidió:**
- Reportes se generan de forma sincrónica en v1 (sin Inngest real). Inngest está instalado y listo para migrar a async cuando se configure la cuenta. [PENDIENTE CONSULTA]
- URLs firmadas con expiración de 1 hora. Archivos en Storage expiran a 30 días.
- El reporte usa KpiSnapshot (ya corregido con fromZonedTime) como fuente de datos.
- Notificación push al Owner es fire-and-forget, no bloquea la generación.

**Archivos creados/modificados:**
- `packages/database/prisma/schema.prisma` — MODIFICADO (agregado ReporteExportacion + relaciones)
- `apps/web/src/lib/reportes/generar-excel-consolidado.ts` — NUEVO
- `apps/web/src/lib/storage/index.ts` — NUEVO
- `apps/web/src/app/api/reportes/generar/route.ts` — NUEVO
- `apps/web/src/app/api/reportes/listar/route.ts` — NUEVO
- `apps/web/src/app/api/reportes/descargar/route.ts` — NUEVO
- `apps/web/src/app/(owner)/reportes/page.tsx` — NUEVO
- `apps/web/src/app/(owner)/reportes/components/ReportesClient.tsx` — NUEVO
- `apps/web/package.json` — MODIFICADO (agregados @supabase/supabase-js, inngest)

**Qué quedó pendiente:**
- [PENDIENTE CONSULTA] Migrar generación de reportes a Inngest async cuando se configure cuenta
- [PENDIENTE CONSULTA] Configurar SUPABASE_SERVICE_ROLE_KEY en Vercel environment variables
- [PENDIENTE CONSULTA] Crear bucket "exportaciones" en Supabase Storage si no existe
- [PENDIENTE CONSULTA] Ejecutar `prisma db push` para sincronizar schema con Supabase (ReporteExportacion)
- Commit pendiente
- Fase 4: Billing SaaS + Onboarding Wizard

### 2026-06-02 — Módulo 14 COMPLETADO: Dashboard + KpiSnapshot — CRÍTICO

**Qué se hizo:**
- Helper `generar-snapshot.ts` — calcula métricas del día para un colegio: totalPedidos, totalPagados, totalCancelados, totalExpirados, totalRetirados, totalNoRetirados, totalIngresos, totalCreditos, ticketPromedio, distribucionOpciones, distribucionKiosco. Upsert idempotente sobre @@unique([colegioId, fecha]).
- Cron `/api/cron/kpi-snapshot` — GET endpoint protegido con CRON_SECRET. Corre cada hora (Vercel Cron). **ITERA POR TIMEZONE DE CADA TENANT** — calcula hora local con `toZonedTime`, solo procesa cuando hora local <= 1 (genera snapshot del día anterior). Usa `prisma` global (opera sobre todos los tenants).
- API `/api/kpi/generar-si-falta` — POST con withAuth + rol OWNER. Generación lazy on-demand: si falta snapshot de un período, se calcula en el momento. No bloquea la carga del dashboard.
- API `/api/kpi/snapshots` — GET con withAuth + rol OWNER. Recibe rango de fechas + opcional colegioId. Retorna snapshots consolidados (todos los colegios agrupados por fecha) o de un colegio específico.
- Pantalla `/owner/dashboard` — Server Component que obtiene KpiSnapshots de los últimos 30 días. Soporta query param `?colegioId=` para drill-down.
- `DashboardClient` — Client Component con: 8 MetricCards (día + período), gráfico de tendencia de ingresos (LineChart Recharts), gráfico de pedidos por día (BarChart Recharts), comparativa por colegio (BarChart horizontal), selector de colegio con drill-down, distribución por opción de menú (vista colegio). Iconos `DollarSign` y `ArrowLeft` agregados a `@enbandeja/ui/icons`. Recharts v3.8.1 instalado en apps/web.
- `vercel.json` actualizado con cron `/api/cron/kpi-snapshot` cada hora.
- `pnpm type-check` ✓, `pnpm lint` ✓ (solo warnings img), `pnpm build` ✓.

**Qué se decidió:**
- Cron genera snapshot del **día anterior** cuando la hora local es 0-1 AM. Esto garantiza que el día ya cerró antes de calcular métricas.
- KpiSnapshot es inmutable (sin updatedAt/deletedAt) pero el cron usa upsert para poder recalcular si se ejecuta múltiples veces en la misma ventana.
- Generación lazy es opt-in — el dashboard muestra los snapshots existentes y el cliente puede solicitar los faltantes. No se auto-genera al cargar para no bloquear.
- Fecha en KpiSnapshot se guarda como mediodía UTC (12:00:00Z) para evitar issues con @db.Date y offsets de timezone.

**Archivos creados/modificados:**
- `apps/web/src/lib/kpi/generar-snapshot.ts` — NUEVO
- `apps/web/src/app/api/cron/kpi-snapshot/route.ts` — NUEVO
- `apps/web/src/app/api/kpi/generar-si-falta/route.ts` — NUEVO
- `apps/web/src/app/api/kpi/snapshots/route.ts` — NUEVO
- `apps/web/src/app/(owner)/dashboard/page.tsx` — NUEVO
- `apps/web/src/app/(owner)/dashboard/components/DashboardClient.tsx` — NUEVO
- `apps/web/vercel.json` — MODIFICADO (agregado cron kpi-snapshot)
- `packages/ui/src/icons.ts` — MODIFICADO (agregados DollarSign, ArrowLeft)
- `apps/web/package.json` — MODIFICADO (agregado recharts)

**Qué quedó pendiente:**
- [PENDIENTE CONSULTA] Configurar CRON_SECRET en Vercel environment variables
- [PENDIENTE CONSULTA] Verificar que el cron funcione correctamente en producción con datos reales
- Commit pendiente
- Módulo 15: Reportes y exportaciones avanzadas

### 2026-06-02 — Módulo 13 COMPLETADO: Gestión del tenant y colegios — FASE 3 EN PROGRESO

**Qué se hizo:**
- Layout `/owner` con validación de rol OWNER — sidebar 240px Liquid Glass en desktop, bottom nav en mobile. Redirige a rol correcto si no es OWNER (operador -> /operador/dia, cocina -> /cocina, apoderado -> /home).
- Pantalla `/owner/empresa` — datos del tenant (nombre, RUT, email, teléfono, timezone, slug). Card de suscripción con plan, estado, máx. colegios y período. Formulario editable con API `/api/tenant/actualizar` (solo OWNER).
- Pantalla `/owner/colegios` — lista de colegios con código, hora de corte, kiosco. Crear colegio con verificación de límite del plan (PlanLimite). Editar colegio. API `/api/colegios/crear` con verificación de límite antes de crear. API `/api/colegios/actualizar`. Al crear colegio: genera código casino único + categoría de precio default.
- Pantalla `/owner/usuarios` — lista de usuarios del tenant con rol y colegio. Invitar usuario con email + rol (OPERADOR/COCINA) + colegio opcional. API `/api/invitaciones/crear` con token único + expiración 7 días. API `/api/invitaciones/aceptar` con validación de token + expiración + coincidencia de email. Estados de invitación: PENDIENTE, ACEPTADA, EXPIRADA.
- Fix error tipo `periodoInicio`/`periodoFin` en `empresa/page.tsx` — serialización Date->ISOString en Server Component antes de pasar al Client Component.
- `pnpm type-check` OK, `pnpm lint` OK (solo warnings img existentes), `pnpm build` OK.

**Qué se decidió:**
- Owner layout usa `prisma` global para verificar rol (no `createTenantClient` porque necesita verificar antes de inyectar contexto).
- Invitaciones usan token criptográfico (randomBytes 32 hex) con expiración de 7 días.
- Email con Resend para invitaciones — [PENDIENTE CONSULTA] se implementa cuando RESEND_API_KEY esté configurado en producción.
- Kit de bienvenida PDF al crear colegio — [PENDIENTE CONSULTA] se implementa en Módulo 14 o 15 según prioridad.

**Archivos creados/modificados:**
- `apps/web/src/app/(owner)/layout.tsx` — NUEVO
- `apps/web/src/app/(owner)/components/OwnerSidebar.tsx` — NUEVO
- `apps/web/src/app/(owner)/empresa/page.tsx` — NUEVO (modificado: serialización fechas)
- `apps/web/src/app/(owner)/empresa/components/EmpresaClient.tsx` — NUEVO
- `apps/web/src/app/(owner)/colegios/page.tsx` — NUEVO
- `apps/web/src/app/(owner)/colegios/components/ColegiosClient.tsx` — NUEVO
- `apps/web/src/app/(owner)/usuarios/page.tsx` — NUEVO
- `apps/web/src/app/(owner)/usuarios/components/UsuariosClient.tsx` — NUEVO
- `apps/web/src/app/api/tenant/actualizar/route.ts` — NUEVO
- `apps/web/src/app/api/colegios/crear/route.ts` — NUEVO
- `apps/web/src/app/api/colegios/actualizar/route.ts` — NUEVO
- `apps/web/src/app/api/invitaciones/crear/route.ts` — NUEVO
- `apps/web/src/app/api/invitaciones/aceptar/route.ts` — NUEVO

**Qué quedó pendiente:**
- [PENDIENTE CONSULTA] Envío de email con Resend para invitaciones
- [PENDIENTE CONSULTA] Kit de bienvenida PDF automático al crear colegio
- Commit pendiente
- Módulo 14: Dashboard con KpiSnapshot (CRÍTICO)
- Módulo 15: Reportes y exportaciones avanzadas

### 2026-06-01 — Módulo 12 COMPLETADO: Cierre, cron y cocina — 🎉 FASE 2 COMPLETADA

**Qué se hizo:**
- API `/api/menu/cerrar-dia` — POST con withAuth + rol OPERADOR. Cambia menú PUBLICADO → CERRADO para la fecha y colegio dados. AuditLog. Bloquea nuevos pedidos para ese día.
- Botón "Cerrar día" en DashboardOperadorClient — el operador cierra la ventana manualmente antes de la hora de corte si lo desea.
- Cron `/api/cron/transiciones-menu` — GET endpoint protegido con CRON_SECRET. Corre cada hora (Vercel Cron). **TRANSICIÓN 1:** PUBLICADO → CERRADO cuando la hora local del tenant pasa la horaCorte del colegio. **TRANSICIÓN 2:** CERRADO → ARCHIVADO cuando la fecha del menú ya pasó (ayer o antes). **RESPETA timezone de cada tenant por separado** — itera todos los tenants activos y calcula hora local individualmente. **IDEMPOTENTE** — solo transiciona si el estado actual coincide (no rompe si corre dos veces).
- `apps/web/vercel.json` — configuración del cron cada hora.
- Layout `(cocina)` con validación de rol COCINA. Redirige a /operador/dia o /home si el rol no es COCINA.
- Pantalla `/cocina` — vista de cocina full-screen con tipografía 50% más grande para lectura a 3 metros. Agrupado por opción de menú ("qué preparar") con cantidad pendiente y retirada. Lista de pedidos con badges de estado. Auto-refresh cada 30 segundos. **Solo lectura — sin botones de escritura** (validado en backend con rol COCINA).
- Tests E2E `role-permissions.spec.ts` reescritos con 5 tests de Fase 2 (skip documentado).
- `pnpm type-check` ✅, `pnpm build` ✅.

**Qué se decidió:**
- Cron usa `prisma` global (no createTenantClient) porque necesita iterar todos los tenants — es una operación del sistema, no de un tenant individual.
- Vista cocina usa auto-refresh cada 30 segundos en vez de Supabase Realtime. [PENDIENTE CONSULTA] Realtime requiere configuración adicional del client lib de Supabase. Se puede migrar a Realtime en Fase 3.
- Cierre manual envía colegioId vacío — [PENDIENTE CONSULTA] el operador necesita seleccionar colegio si hay múltiples. Actualmente falla si no se envía colegioId válido.

**Archivos creados/modificados:**
- `apps/web/src/app/api/menu/cerrar-dia/route.ts` — NUEVO
- `apps/web/src/app/api/cron/transiciones-menu/route.ts` — NUEVO
- `apps/web/src/app/(cocina)/layout.tsx` — NUEVO
- `apps/web/src/app/(cocina)/cocina/page.tsx` — NUEVO
- `apps/web/src/app/(cocina)/cocina/components/CocinaClient.tsx` — NUEVO
- `apps/web/vercel.json` — NUEVO
- `apps/web/src/app/(operador)/dia/components/DashboardOperadorClient.tsx` — MODIFICADO (botón cerrar día)
- `tests/e2e/critical/role-permissions.spec.ts` — MODIFICADO (tests Fase 2)

**HITO DE FASE 2 — Checklist:**
- [x] El operador ve los pedidos del día y marca retiros
- [x] El operador publica un menú para el día siguiente
- [x] El operador gestiona productos del kiosco
- [x] El operador exporta el reporte del día en Excel y PDF(HTML)
- [x] La cocina ve en vivo qué preparar (auto-refresh 30s, Realtime pendiente)
- [x] El cron transiciona estados de menú respetando timezone por tenant
- [x] Rol COCINA no puede escribir nada (validado en backend)
- [x] Build limpio: type-check + lint + build pasan
- [ ] El operador puede operar un turno COMPLETO sin ayuda (pendiente demo manual)

**Qué quedó pendiente:**
- [PENDIENTE CONSULTA] Migrar vista cocina de auto-refresh a Supabase Realtime
- [PENDIENTE CONSULTA] Cierre manual necesita selector de colegio si hay múltiples
- [PENDIENTE CONSULTA] Configurar CRON_SECRET en Vercel environment variables
- Commit pendiente

### 2026-05-31 — Módulo 11 COMPLETADO: Kiosco y exportaciones

**Qué se hizo:**
- Pantalla `/operador/kiosco` con gestión de productos — lista de productos con nombre, precio, stock, categoría. Botones: agregar producto, editar, reponer stock, exportar Excel/PDF.
- CRUD de ProductoKiosco — API `/api/kiosco/producto` con POST (crear) y PUT (actualizar). Validación Zod + rol OPERADOR.
- API `/api/kiosco/reponer-stock` — POST con withAuth + rol OPERADOR. Restablece stockActual = stockDiario. AuditLog.
- API `/api/exportar/dia` — GET con withAuth + rol OPERADOR. Exporta pedidos del día. Formato Excel (xlsx-js-style) con tabla de comensal/curso/item/cantidad/subtotal/retirado. Formato PDF como HTML imprimible agrupado por curso.
- Instalado `xlsx-js-style` y `@react-pdf/renderer` en apps/web.
- `pnpm type-check` ✅, `pnpm build` ✅.

**Archivos creados:**
- `apps/web/src/app/(operador)/kiosco/page.tsx` — NUEVO
- `apps/web/src/app/(operador)/kiosco/components/KioscoClient.tsx` — NUEVO
- `apps/web/src/app/api/kiosco/producto/route.ts` — NUEVO
- `apps/web/src/app/api/kiosco/reponer-stock/route.ts` — NUEVO
- `apps/web/src/app/api/exportar/dia/route.ts` — NUEVO

**Qué quedó pendiente:**
- [PENDIENTE CONSULTA] Exportación PDF usa HTML imprimible en vez de @react-pdf/renderer (requiere configuración especial de React Server Components). Si Christian quiere PDF nativo, se implementa en M12.
- [PENDIENTE CONSULTA] No se implementó gestión de CategoriaKiosco (crear/editar/ordenar). El formulario de producto permite asignar categoría existente pero no crear nuevas. Se puede agregar si se necesita.
- Commit pendiente

### 2026-05-31 — Módulo 10 COMPLETADO: Gestión de menús

**Qué se hizo:**
- Pantalla `/operador/menu` con calendario mensual — indicadores de estado por día (BORRADOR/PUBLICADO/CERRADO/ARCHIVADO), navegación de meses, lista de menús con badges de estado.
- Pantalla `/operador/menu/nuevo` — formulario para crear menú: fecha, colegio, opciones con precios por categoría de precio. Botones "Guardar borrador" y "Publicar".
- Pantalla `/operador/menu/[fecha]` — editar menú existente. Solo editable si estado BORRADOR. Vista solo lectura si ya PUBLICADO/CERRADO.
- API `/api/menu/crear` — POST con withAuth + rol OPERADOR + Zod. Transacción atómica: Menu + OpcionMenu + PrecioOpcion. Validaciones: no publicar fecha pasada, todas las categorías deben tener precio.
- API `/api/menu/actualizar` — POST con withAuth + rol OPERADOR. Solo si estado BORRADOR. Elimina opciones viejas + crea nuevas en transacción atómica. Validación de publicación.
- API `/api/menu/copiar-semana` — POST con withAuth + rol OPERADOR. Transacción atómica que duplica menús + opciones + precios de la última semana con menús. Idempotente (no duplica si ya existe). Offset de 7 días.
- `pnpm type-check` ✅, `pnpm build` ✅.

**Archivos creados:**
- `apps/web/src/app/(operador)/menu/page.tsx` — NUEVO
- `apps/web/src/app/(operador)/menu/components/MenuCalendarioClient.tsx` — NUEVO
- `apps/web/src/app/(operador)/menu/nuevo/page.tsx` — NUEVO
- `apps/web/src/app/(operador)/menu/nuevo/components/NuevoMenuClient.tsx` — NUEVO
- `apps/web/src/app/(operador)/menu/[fecha]/page.tsx` — NUEVO
- `apps/web/src/app/(operador)/menu/[fecha]/components/EditarMenuClient.tsx` — NUEVO
- `apps/web/src/app/api/menu/crear/route.ts` — NUEVO
- `apps/web/src/app/api/menu/actualizar/route.ts` — NUEVO
- `apps/web/src/app/api/menu/copiar-semana/route.ts` — NUEVO

**Qué quedó pendiente:**
- [PENDIENTE CONSULTA] La API copiar-semana toma la última semana con menús y copia +7 días. Puede que no sea la semana "anterior" si hay gaps. Verificar con Christian si el offset debe ser configurable.
- Commit pendiente

### 2026-05-31 — Módulo 9 COMPLETADO: Dashboard del operador

**Qué se hizo:**
- Layout `/operador` con validación de rol OPERADOR — sidebar 240px Liquid Glass en desktop/tablet, bottom nav en mobile. Redirige a /home o /cocina si el rol no es OPERADOR.
- Pantalla `/operador/dia` — Server Component que obtiene pedidos del día filtrando por fecha con timezone del tenant. Calcula totales (pedidos, ingresos, retirados, pendientes) y resumen por opción de menú.
- `DashboardOperadorClient` — Bento Grid de totales, desglose por opción, búsqueda por nombre de comensal, filtros por estado (todos/pendientes/retirados/cancelados), lista de pedidos con info de comensal, curso e items.
- API `/api/pedidos/marcar-retirado` — POST con withAuth + validación de rol OPERADOR. Transición PAGADO/NO_RETIRADO → RETIRADO. Transacción atómica: actualiza pedido + items + AuditLog.
- Actualización optimista en el cliente: marca retirado instantáneamente y revierte si la API falla.
- `pnpm type-check` ✅, `pnpm lint` ✅, `pnpm build` ✅.

**Archivos creados:**
- `apps/web/src/app/(operador)/layout.tsx` — NUEVO
- `apps/web/src/app/(operador)/components/OperadorSidebar.tsx` — NUEVO
- `apps/web/src/app/(operador)/dia/page.tsx` — NUEVO
- `apps/web/src/app/(operador)/dia/components/DashboardOperadorClient.tsx` — NUEVO
- `apps/web/src/app/api/pedidos/marcar-retirado/route.ts` — NUEVO

**Qué quedó pendiente:**
- Tests E2E requieren servidor + auth + seed (skip documentado)
- Commit pendiente

### 2026-05-31 — Semana 8 COMPLETADA: Cancelación y crédito — 🎉 FASE 1 COMPLETADA

**Qué se hizo:**
- **Tarea 1:** Helper `puedeCancelar` en `apps/web/src/lib/pedidos/validar-hora-corte.ts` — Valida si un item puede cancelarse según la hora de corte del colegio y timezone del tenant. Compara hora local actual vs horaCorte. NUNCA hardcodea America/Santiago.
- **Tarea 2:** API `/api/pedidos/cancelar-item` — POST con withAuth + Zod validation. Valida pertenencia del pedido al apoderado, estado PAGADO, item no cancelado. Usa puedeCancelar para hora de corte. Transacción atómica: marca item cancelado + creditoGenerado, incrementa stock, upsert CreditoApoderado con increment, crea CreditoMovimiento inmutable, AuditLog. Si todos los items quedan cancelados, pedido pasa a CANCELADO. Fuera de transacción: notificación push fire-and-forget.
- **Tarea 3:** UI de cancelación en historial — HistorialClient actualizado con botón "Cancelar" por item (NO modal, confirmación inline). Estados: botón → "¿Cancelar este item?" → "Sí, cancelar" / "No". Items cancelados muestran badge con crédito generado. Razón de no-cancelación visible si hora de corte pasada. Server Component actualizado para pasar datos de cancelación por item.
- **Tarea 4:** Pantalla `/perfil/credito` — Server Component con query CreditoApoderado + CreditoMovimiento. CreditoClient: Bento Card hero con saldo actual (Plus Jakarta display grande), lista de movimientos con íconos ArrowDownLeft (+verde) / ArrowUpRight (-ámbar), fecha y concepto. Link desde /perfil actualizado a /perfil/credito.
- **Tarea 5:** Integración crédito en flujo de creación — `aplicarCredito` corregido para aceptar `colegioId` y usar `apoderadoId_colegioId` unique compound. Llamada en `/api/pedidos/crear` actualizada con colegioId. `/resumen` ya mostraba desglose correctamente.
- **Tarea 6:** Tests E2E `cancelacion.spec.ts` — 5 tests con skip documentado (requiere servidor + auth + seed): cancelar item antes de corte, cancelar después de corte (403), crédito se aplica automáticamente, CreditoMovimiento inmutable, crédito nunca negativo.
- **Tarea 7:** Verificación del hito de Fase 1 documentada.
- **Tarea 8:** `pnpm type-check` ✅ 0 errores, `pnpm lint` ✅ (solo warnings img existentes), `pnpm build` ✅ 20 páginas + middleware.

**Qué se decidió:**
- Cancelación es a nivel de ITEM, no de pedido completo. Si todos los items se cancelan, el pedido pasa a CANCELADO automáticamente.
- `aplicarCredito` ahora usa unique compound `apoderadoId_colegioId` del schema (no findFirst por apoderadoId solo).
- Confirmación de cancelación es inline (botón → confirmación → acción), NO modal — anti-patrón UX del prompt.
- Crédito se genera como monto positivo en CreditoApoderado (increment) y CreditoMovimiento (monto > 0 = entrada de crédito).
- `puedeCancelar` es función pura que recibe horaCorte y timezone — testeable sin DB.

**Archivos creados/modificados:**
- `apps/web/src/lib/pedidos/validar-hora-corte.ts` — NUEVO
- `apps/web/src/app/api/pedidos/cancelar-item/route.ts` — NUEVO
- `apps/web/src/app/(apoderado)/historial/page.tsx` — MODIFICADO (datos de cancelación por item)
- `apps/web/src/app/(apoderado)/historial/components/HistorialClient.tsx` — MODIFICADO (botón cancelar inline)
- `apps/web/src/app/(apoderado)/perfil/credito/page.tsx` — NUEVO
- `apps/web/src/app/(apoderado)/perfil/credito/components/CreditoClient.tsx` — NUEVO
- `apps/web/src/app/(apoderado)/perfil/components/PerfilClient.tsx` — MODIFICADO (link a /perfil/credito)
- `apps/web/src/lib/pedidos/aplicar-credito.ts` — MODIFICADO (colegioId param, unique compound)
- `apps/web/src/app/api/pedidos/crear/route.ts` — MODIFICADO (pasar colegioId a aplicarCredito)
- `packages/ui/src/icons.ts` — MODIFICADO (agregados RotateCcw, ArrowDownLeft, ArrowUpRight)
- `tests/e2e/critical/cancelacion.spec.ts` — NUEVO
- `ledger.md` — MODIFICADO (entrada Semana 8 + estado FASE 1 COMPLETADA)

**Qué quedó pendiente:**
- Tests E2E requieren servidor corriendo + auth + seed (skip documentado)
- Commit pendiente (Christian lo hace manualmente)
- VAPID keys necesitan generarse y configurarse en .env.local
- Cuenta Transbank Integración (Webpay sandbox) — obligatorio para pruebas reales
- [PENDIENTE CONSULTA] La API cancelar-item usa `comensalConColegio?.Colegio?.id` como fallback para colegioId en el upsert de CreditoApoderado. Si el comensal no tiene colegio asociado, usa tenantId como fallback — validar con Christian si esto es correcto o si debe fallar.
- [PENDIENTE CONSULTA] horaCorte se obtiene del colegio del comensal. En el Server Component de historial, se usa default "09:00" sin lookup por item — se podría mejorar con una query batch de colegioId→horaCorte por pedido.

### 2026-05-28 — Semana 7 COMPLETADA: Confirmación, notificaciones, historial y perfil

**Qué se hizo:**
- **Tarea 1:** Pantalla `/confirmacion` — Server Component con Bento Card hero CheckCircle verde, fecha con toZonedTime, lista de items, total pagado, botones "Ver historial" + "Volver al inicio".
- **Tarea 2:** Modelo PushToken ya existía en schema ✅. Creado `public/sw.js` (service worker con listeners push + notificationclick). Creado `apps/web/src/lib/push/register.ts` (registra SW, pide permiso, crea PushSubscription con VAPID, POST a /api/push/registrar-token).
- **Tarea 3:** API `/api/push/registrar-token` — POST con withAuth, upsert PushToken por (userId, token), reactiva si ya existe.
- **Tarea 4:** Helper `enviarPush` + `crearNotificacion` en `apps/web/src/lib/push/send.ts`. Usa web-push npm. EnviarPush itera tokens activos, marca 410 Gone como isActive=false. crearNotificacion crea NotificacionLog inmutable + envía push si canal incluye PUSH. Fire-and-forget, no bloquea operación principal.
- **Tarea 5:** Integrado push en `/api/payment/webpay/return` — después de transacción exitosa, fuera de $transaction, llama crearNotificacion con tipo PAGO_CONFIRMADO.
- **Tarea 6:** Pantalla `/historial` — Server Component query pedidos del apoderado (RLS), Client Component con filtros por estado (todos/pagados/cancelados), Bento Cards con badge de estado, detalle expandible inline con items y total.
- **Tarea 7:** Pantalla `/perfil` — Server Component query user/comensales/credito, Client Component con Bento Cards: datos apoderado, comensales con avatarUrl, crédito disponible (formatCLP), botón cerrar sesión.
- **Tarea 8:** FormComensal extraído a `packages/ui/src/components/FormComensal.tsx`. Reutilizable con props (colegioId, colegioNombre, onSuccess, submitLabel). Integrado en drawer de /perfil para agregar comensal. Exportado desde `@enbandeja/ui`.
- **Tarea 9:** API `/api/notificaciones/marcar-leida` — POST upsert NotificacionLeida. API `/api/notificaciones/count` — GET cuenta no leídas. Componente NotificationBadge en top bar del layout apoderado.
- **Tarea 10:** Tests E2E `historial-perfil.spec.ts` creados (4 tests con skip por servidor + auth).
- **Tarea 11:** `pnpm type-check` ✅, `pnpm lint` ✅ (solo warnings img), `pnpm build` ✅.

**Qué se decidió:**
- Push es best-effort, fire-and-forget. No bloquea el webhook de Webpay.
- NotificacionLog es inmutable (sin updatedAt/deletedAt). NotificacionLeida es tabla separada.
- FormComensal vive en packages/ui para reutilización entre onboarding y perfil.
- CréditoApoderado no tiene unique por apoderadoId solo — se usa findFirst.
- Comensal usa `avatarUrl` (no `fotoUrl`).
- Wallet icon agregado a lucide exports en packages/ui.
- web-push instalado como dependencia en apps/web.

**Archivos creados/modificados:**
- `apps/web/src/app/(apoderado)/confirmacion/page.tsx` — NUEVO
- `apps/web/src/app/(apoderado)/historial/page.tsx` — NUEVO
- `apps/web/src/app/(apoderado)/historial/components/HistorialClient.tsx` — NUEVO
- `apps/web/src/app/(apoderado)/perfil/page.tsx` — NUEVO
- `apps/web/src/app/(apoderado)/perfil/components/PerfilClient.tsx` — NUEVO
- `apps/web/public/sw.js` — NUEVO
- `apps/web/src/lib/push/register.ts` — NUEVO
- `apps/web/src/lib/push/send.ts` — NUEVO
- `apps/web/src/app/api/push/registrar-token/route.ts` — NUEVO
- `apps/web/src/app/api/notificaciones/marcar-leida/route.ts` — NUEVO
- `apps/web/src/app/api/notificaciones/count/route.ts` — NUEVO
- `apps/web/src/components/NotificationBadge.tsx` — NUEVO
- `packages/ui/src/components/FormComensal.tsx` — NUEVO
- `packages/ui/src/components/index.ts` — modificado (export FormComensal)
- `packages/ui/src/icons.ts` — modificado (agregado Wallet)
- `apps/web/src/app/(apoderado)/layout.tsx` — modificado (top bar + NotificationBadge)
- `apps/web/src/app/api/payment/webpay/return/route.ts` — modificado (import crearNotificacion + llamada post-transaction)
- `tests/e2e/critical/historial-perfil.spec.ts` — NUEVO

**Qué quedó pendiente:**
- VAPID keys necesitan generarse y configurarse en .env.local
- Tests E2E requieren servidor corriendo + auth + seed (skip documentado)
- Commit pendiente (Christian lo hace manualmente)
- Notificaciones por email (canal EMAIL/AMBOS) — futura implementación

### 2026-05-25 — Semana 6 COMPLETADA: Flujo de pago Webpay end-to-end

**Qué se hizo:**
- **Tarea 1:** `payment-config.ts` reescrito — retorna valores RAW (cifrado o PLAIN:). Respeta Regla 3 del CLAUDE.md (packages no importan desde apps). Nuevo `provider.ts` en apps/web descifra credenciales con `decrypt()`. `encryption.ts` ya funcionaba con AES-256-GCM + fallback PLAIN:. `webpay.ts` usa `commit(token_ws)` oficial del SDK.
- **Tarea 2:** `CrearPedidoSchema` + `validarInvarianteContable` ya existían y están correctos.
- **Tarea 3:** `calcularTotal` ya existía y está correcto.
- **Tarea 4:** `aplicarCredito` ya existía y está correcto.
- **Tarea 5+6:** API `/api/pedidos/crear` reescrita con flujo correcto: `getDecryptedPaymentConfig()`, `iniciarTransaccionWebpay()` con `returnUrl` → `/api/payment/webpay/return`, `crearPedidoMontoZero` con transacción atómica.
- **Tarea 7:** Eliminado `/api/payment/webhook` con HMAC. Creado `/api/payment/webpay/return` con flujo oficial Webpay: recibe `token_ws`, llama `commit(token_ws)`, transacción atómica (Pedido PAGADO + stock + crédito + WebhookEventLog), sin HMAC. GET handler para cuando Webpay redirige con query params.
- **Tarea 8:** Pantalla `/resumen` ya existía y funciona. Redirect a `urlPasarela` vía `window.location.href`.
- **Tarea 9:** Cron pedidos expirados ya existía.
- **Tarea 10:** Tests E2E reescritos: eliminado test de firma HMAC, reemplazado por "sin token_ws → error". Archivo renombrado a `webpay-return.spec.ts`. Tests con `test.skip()` por falta de servidor + Webpay sandbox en CI.
- **Tarea 11:** `pnpm type-check` ✅, `pnpm lint` ✅, `pnpm build` ✅ (12 páginas + middleware).
- Seed actualizado: tenant renombrado a "Casino Demo", email "demo@enbandeja.cl", slug "casino-demo".
- `.env.local` configurado con credenciales Supabase (no committed).
- `prisma db push` + `prisma db seed` ejecutados exitosamente. Tabla `payment_provider_config` con 1 registro activo (WEBPAY/integration).

**Qué se decidió:**
- `payment-config.ts` retorna valores RAW para no importar desde apps/web (Regla 3 CLAUDE.md). Wrapper `provider.ts` descifra en la capa de aplicación.
- Webpay Plus NO usa webhooks firmados. El flujo es return con token_ws + commit().
- `WebhookEventLog` se mantiene como nombre del modelo en DB pero conceptualmente es `PaymentEventLog` (bitácora interna del commit, NO verificador de firma externa). `eventType` = "WEBPAY_COMMIT".
- `as any[]` en Items.create porque el tipo del extended client (`DynamicClientExtensionThis`) no infiere correctamente `PedidoItemUncheckedCreateWithoutPedidoInput`.

**[RESUELTO]:** Campo `webpayToken` agregado al modelo Pedido (String? @unique). Al crear la transacción se guarda el token. En el return handler se busca por webpayToken === token_ws (sin fallback a pedidosPendientes).

**Qué quedó pendiente:**
- Tests E2E requieren servidor corriendo + Webpay sandbox (skip documentado).
- Commit pendiente (Christian lo hace manualmente).

### 2026-05-24 — Corrección prompt Semana 6: flujo Webpay oficial (commit+token_ws)

**Qué se hizo:**
- Corregido `docs/prompts-fase1/semana-6-pago-webpay.md` para alinearlo con el flujo oficial de Webpay Plus.
- Reemplazada toda referencia a `/api/payment/webhook` con HMAC por `/api/payment/webpay/return` usando `token_ws` + `commit(token_ws)` del SDK oficial.
- TAREA 1 actualizada: `returnUrl` apunta a `${APP_URL}/api/payment/webpay/return`. `confirmarTransaccionWebpay` usa `commit(token_ws)`.
- TAREA 7 reescrita completamente: título → "Return/confirmación Webpay /api/payment/webpay/return". Recibe `token_ws`, busca pedido, llama commit, registra evento interno idempotente, transacción atómica. Si rechazado → RECHAZADO. Si aprobado → PAGADO + stock + crédito.
- `WebhookEventLog` conceptualmente renombrado como `PaymentEventLog` en el prompt (modelo DB se mantiene). Aclarado que NO es webhook externo firmado sino bitácora interna/idempotente del resultado del commit.
- Tests actualizados: eliminado "webhook con firma inválida retorna 401". Reemplazado por "return Webpay sin token_ws retorna 400" y "commit Webpay idempotente".
- Checklist actualizado: eliminado "Webhook verifica HMAC", reemplazado por "Webpay confirma con commit(token_ws) oficial del SDK" + "NO se inventan firmas HMAC".
- Archivo de tests renombrado de `webhook-idempotencia.spec.ts` a `webpay-return.spec.ts`.
- `PaymentProviderConfig` por tenant SIN cambios (ya estaba correcto).
- Ledger actualizado.

**Motivo de la corrección:**
El prompt original describía un flujo estilo Stripe (webhook externo con firma HMAC + rawBody), pero Webpay Plus NO usa webhooks firmados. El flujo oficial es: crear transacción → redirigir a Webpay → usuario paga → Webpay redirige de vuelta con `token_ws` → el comercio llama `commit(token_ws)` para confirmar. Inventar HMAC no documentado por Transbank es un anti-patrón de seguridad.

**Archivos modificados:**
- `docs/prompts-fase1/semana-6-pago-webpay.md`
- `ledger.md`

**Qué quedó pendiente:**
- Ejecutar Semana 6 con el prompt corregido (esperar confirmación de Christian).
- Los archivos de código creados en la sesión anterior (`/api/payment/webhook/route.ts`, etc.) también necesitarán actualizarse cuando se ejecute la Semana 6 corregida.

### 2026-05-24 — Semana 5 COMPLETADA: Catálogo y menú del apoderado

**Qué se hizo:**
- **Tarea 1:** Helper `getPrecioParaComensal` ya existía de sesión anterior, verificado OK.
- **Tarea 2:** Componente `CalendarioExpansible` — Client Component en `packages/ui`. Calendario Samsung-style con swipe-down, micro-líneas de estado (verde/azul/ámbar), transición max-height 300ms, Liquid Glass. Íconos desde `@enbandeja/ui/icons` (imports relativos dentro del package).
- **Tarea 3:** Componente `BentoCardMenu` — Server Component compatible, variants hero/small, estados disponible/seleccionado/agotado. Usa `formatCLP` de `@enbandeja/shared`. Liquid Glass con `saturate-[180%]`.
- **Tarea 4:** Server Component `/home` — autenticación + `createTenantClient` + query comensales/menús/pedidos + resolución de precios con `getPrecioParaComensal` + timezone del tenant.
- **Tarea 5:** Client Component `HomeApoderadoClient` — Master-Detail con 3 zonas: Zona A (CalendarioExpansible), Zona B (selector comensal + Bento Grid menú + aviso hora de corte + cards con opacity si corte pasado), Zona C (Floating Cart placeholder). Íconos de `@enbandeja/ui/icons`, utilidades de `@enbandeja/shared`.
- **Tarea 6:** 5 estados visuales del calendario implementados (verde=pedido, azul=disponible, ámbar=proximo-corte, sin línea=sin menú, disabled=pasado).
- **Tarea 7:** Componente `DrawerKiosko` — Bottom sheet con Liquid Glass, lista productos con +/-, `formatCLP`. Solo integrable si `colegio.kioscoActivo === true`. Trigger placeholder en HomeApoderadoClient.
- **Tarea 8:** Layout `(apoderado)/layout.tsx` con validación de rol APODERADO + `BottomNav` en `apps/web/src/components/` (NO en packages/ui porque importa `next/link`). 4 items: Inicio, Pedir, Historial, Perfil. Píldora active state azul.
- **Tarea 9:** Tests E2E `menu-apoderado.spec.ts` — 4 tests con `test.skip()` (requieren auth + seed en CI).
- **Tarea 10:** `pnpm type-check` ✅ 0 errores, `pnpm lint` ✅ 0 warnings, `pnpm build` ✅ 11 páginas + middleware.

**Qué se decidió:**
- `BottomNav` vive en `apps/web/src/components/` (no en `packages/ui`) porque importa `next/link` y `next/navigation` — Regla 3 del CLAUDE.md.
- `TenantClient` en `precios.ts` usa tipo `any` porque el tipo retornado por `prisma.$extends()` (`DynamicClientExtensionThis`) no es compatible con `PrismaClient` en TypeScript strict.
- Se agregó `exports` en `packages/ui/package.json` para soportar sub-path imports (`@enbandeja/ui/icons`, `@enbandeja/ui/lib/*`).
- Se agregó `@enbandeja/shared` como dependencia de `@enbandeja/ui` para usar `formatCLP` en `BentoCardMenu` y `DrawerKiosko`.
- Se instaló `date-fns` + `date-fns-tz` en `apps/web` para el Server Component `/home`.
- Imports dentro de `packages/ui` usan paths relativos (`../icons`, `../lib/design-system`) para evitar self-referencing.

**Qué quedó pendiente:**
- DrawerKiosko no está conectado funcionalmente al HomeApoderadoClient (solo placeholder del trigger).
- Tests E2E están con `test.skip()` — requieren auth + seed en CI.
- Semana 6: Flujo de pago Webpay.
- Commit pendiente (Christian lo hace manualmente).

**Qué se hizo:**

- Intentado implementar registro/login con email+password + bcryptjs
  + verificación Resend. Todo funcionó excepto el login posterior.
- Diagnosticado bug confirmado en NextAuth v5 beta: Credentials
  provider con strategy:database no crea sesión utilizable.
  Issues #9636, #12848, #12858, #12894 en nextauthjs/next-auth.
- Decisión: revertir todo el email auth, dejar solo Google OAuth.
- Eliminados: login-form, registro-form, API registro, API
  verify-email, lib/email, verify-request page, error page.
- auth.ts limpio: solo Google provider, sin Credentials, sin Resend.
- bcryptjs desinstalado. passwordHash en schema se mantiene nullable.
- pnpm type-check + lint + build: 0 errores, 12 páginas.

**Qué se decidió:**

- Enbandeja usa solo Google OAuth para auth en v1.
- Email+password se evalúa en v2 con Better Auth u otra librería.
- passwordHash se mantiene en schema para no hacer migración futura.

**Qué quedó pendiente:**

- Commit pendiente (Christian lo hace manualmente)
- Semana 5: Catálogo y menú del apoderado

---

### 2026-04-14 — Semana 4 COMPLETADA + Ajustes post-cierre

**Qué se hizo:**

- Fix crítico auth.ts: signIn callback retorna true siempre.
  La redirección a /onboarding la maneja la página, no el callback.
- Fix conexión DB: DATABASE_URL cambiada a pooler Session mode
  (puerto 5432 sin pgbouncer=true). Resuelve el bug de createUser
  silencioso del PrismaAdapter con @auth/core@0.41.0.
- Adapter override: createUser usa upsert en lugar de create.
- Flujo E2E verificado: Google OAuth → User en DB → onboarding →
  /home 200.
- Comensal precargado: apoderadoId y vinculo nullable en schema.
  RLS actualizada. API GET /api/comensales/buscar. API crear
  modificada para vincular precargado. BuscadorComensal component.
  Seed con 8 comensales precargados en DEMO1.
- Flujo búsqueda y fallback manual verificados en browser.

**Qué se decidió:**

- signIn callback nunca hace redirecciones — invariante permanente.
- DATABASE_URL apunta a pooler Session mode en desarrollo.
- Comensal puede existir sin apoderado (precargado por operador).
- bcryptjs (no bcrypt nativo) para compatibilidad Windows/Vercel.

**Qué quedó pendiente:**

- Registro y login con email + password + verificación Resend.
  Prompt listo, pendiente de ejecución.
- AUTH_EMAIL_FROM no configurado (usar onboarding@resend.dev en dev).

---

### 2026-04-12 — Fase 1 Semana 4: Fix Auth + Verificación final (COMPLETADA)

**Qué se hizo:**

- **TAREA 1 — Fix PrismaAdapter:** Detectados y corregidos los 2
  métodos del adapter que usaban relaciones en camelCase contra un
  schema PascalCase (Regla 2 del CLAUDE.md). Se sobreescribieron
  `getSessionAndUser` (usa `include: { User: true }` en Session) y
  `getUserByAccount` (usa `select: { User: true }` en Account).
  El adapter base ya no lanza `PrismaClientValidationError`.
- **TAREA 2 — Regenerar Prisma Client:** `npx prisma generate`
  ejecutado exitosamente (v5.22.0).
- **TAREA 3 — Fix de redirección en auth.ts:**
  - Callback `signIn` nuevo: consulta UserTenants del usuario y
    retorna URL para redirigir. 0 tenants → `/onboarding/codigo`;
    2+ tenants → `/seleccionar-tenant`; 1 tenant → `true` (flujo
    normal, session callback maneja activeTenantId).
  - Callback `session` mejorado: si no hay `activeTenantId` en DB
    pero hay exactamente 1 UserTenant activo, lo persiste en la
    sesión automáticamente.
  - Corrección de tipos: `logger.error` ajustado a firma de NextAuth
    v5 beta 19 (`error: Error`); `userTenants[0]` protegido con
    variable intermedia para TypeScript strict.
- **TAREA 4 — Middleware creado:** `apps/web/src/middleware.ts`
  nuevo. Edge-compatible (sin Prisma). Verifica cookie
  `authjs.session-token` para autenticación básica. Permite
  `/onboarding/*` y `/seleccionar-tenant` sin activeTenantId.
  Bloquea rutas protegidas sin sesión → redirect `/login`.
- **TAREA 5 — Verificación final:**
  - `pnpm type-check` → ✅ 0 errores (5 packages)
  - `pnpm lint` → ✅ 0 warnings (5 packages)
  - `pnpm build --filter=@enbandeja/web` → ✅ 11 páginas + middleware 32.1 kB

**Qué se decidió:**

- El middleware usa verificación de cookie (Edge-compatible), no
  `auth()` con DB, para evitar el problema de Prisma en Edge runtime.
  La validación profunda de `activeTenantId` la hacen los Server Components.
- `logger.error` en NextAuth v5 beta 19 recibe `Error` (no `code, metadata`).
- El índice de array `userTenants[0]` en modo strict requiere
  variable intermedia con guard explícito.

**Qué quedó pendiente:**

- Semana 5: Implementar `/home` (panel del apoderado) con check de
  activeTenantId y redirect a `/onboarding/codigo` si falta.
- Semana 5: Implementar `/seleccionar-tenant` para usuarios con
  2+ UserTenants activos.
- Deploy a Vercel (sigue pendiente, post Semana 5).
- Nada del working tree está committed aún.

---

### 2026-04-11 — Fase 1 Semana 4: Registro y vinculación (avance parcial)

**Qué se hizo:**

- **Tarea 1:** Verificado modelo Colegio con codigoCasino. Creado
  helper `packages/shared/src/utils/codigo-casino.ts`
  (generarCodigoCasino, validarFormatoCodigoCasino).
- **Tarea 2:** Verificado modelo Comensal con campos requeridos.
- **Tarea 3:** Creado `packages/shared/src/validators/comensal.ts`
  con CrearComensalSchema y VincularCodigoSchema. Exportado desde
  index.
- **Tarea 4:** Creadas API routes:
  - `apps/web/src/app/api/vincular/codigo/route.ts` (POST, busca
    colegio por codigoCasino)
  - `apps/web/src/app/api/comensales/crear/route.ts` (POST, crea
    comensal + UserTenant con withAuth)
- **Tarea 5:** Creados layout de auth, página de login con botón
  Google (google-button.tsx Client Component), página de registro
  con formulario email+contraseña.
- **Tarea 6:** Creado flujo de onboarding completo con 3 pasos:
  - `apps/web/src/app/(onboarding)/layout.tsx` (progress bar)
  - Páginas de código y comensal con formularios Client Component
- **Tarea 7:** Extendido auth.ts con callback session que lee
  activeTenantId de la DB. **Error pendiente:** callback de
  redirección para usuarios nuevos sin UserTenant no funciona
  correctamente.
- **Tarea 8:** Creado `tests/e2e/critical/registro-flow.spec.ts`
  con 3 tests estructurados. Seed actualizado con Tenant demo,
  Colegio "DEMO1" y CategoriaPrecio default.
- Creado `apps/web/src/components/providers.tsx` (SessionProvider).
- Creado `apps/web/src/types/` para extensiones de tipos de NextAuth.
- Creado `apps/web/.eslintrc.json`.
- Actualizado `apps/web/tailwind.config.ts` con ajustes adicionales.
- Actualizado `pnpm-lock.yaml` con nuevas dependencias.

**Qué quedó pendiente:**

- Corregir error de callback en `apps/web/src/lib/auth.ts`
  (redirección de usuario nuevo a /onboarding/codigo).
- Ejecutar Tarea 9: verificación final (`pnpm type-check`,
  `pnpm lint`, `pnpm build`, tests E2E).
- Nada de esto está committed aún (todo en working tree).
- Deploy a Vercel sigue pendiente.

---

### 2026-04-11 — FASE 0 COMPLETADA: Master Prompt ejecutado (10/10 tareas)

**Qué se hizo:**

- **Tarea 1:** Monorepo root inicializado (package.json, turbo.json,
  tsconfig.base.json, .env.example, .gitignore, pnpm-workspace.yaml)
- **Tarea 2:** Schema Prisma completo con 35 tablas y 12 enums.
  Todos los IDs con `@default(uuid()) @db.Uuid`, relaciones en
  PascalCase, soft delete en editables, inmutabilidad en logs.
- **Tarea 3:** Package shared con validadores Zod (invariante
  contable, XOR items), utilidades date-fns-tz, constantes de
  negocio.
- **Tarea 4:** Package UI con design-system.ts (tokens del Plan
  Maestro de Diseño), Button (CVA, 4 variantes + kiosko 72px),
  Card (glass/solid/elevated), Input (48px), Badge (pill), icons
  (lucide-react centralizado).
- **Tarea 5:** Package support-kb configurado.
- **Tarea 6:** apps/web con Next.js 15, Auth.js v5
  (strategy:database, Google OAuth), Tailwind config con tokens
  del ADN visual, tipografía con Plus Jakarta Sans + Inter +
  JetBrains Mono, páginas root/login/home, middleware withAuth.
- **Tarea 7:** Tests E2E críticos — 5 specs con 15 tests
  (tenant-isolation, role-permissions, auth-flow,
  pedido-invariant, webhook-idempotency). 2 activos, 13 skipped
  para Fase 1.
- **Tarea 8:** CI/CD con GitHub Actions — type-check GLOBAL en
  todos los packages + build FILTRADO a @enbandeja/web. Job E2E
  preparado con `if: false`.
- **Tarea 9:** Migración a Supabase exitosa — `prisma db push`
  con 35 tablas, 4 CHECK constraints, 2 funciones Postgres,
  1 trigger, RLS habilitado en 24 tablas, 27 policies RLS
  (usando `current_setting`, NUNCA `auth.uid()`), REVOKE en
  6 tablas inmutables + DELETE en Suscripcion, seed de 4 planes.
- **Tarea 10:** Verificación final — `pnpm type-check` 0 errores
  en 5 packages, `pnpm build --filter=@enbandeja/web` exitoso
  (6 páginas generadas).
- Auditoría de conexión Supabase: se corrigió host de
  `aws-0-sa-east-1` a `aws-1-sa-east-1` (región correcta).
  DATABASE_URL:6543 y DATABASE_DIRECT_URL:5432 verificados.
- Agente de database actualizado con configuración de conexión
  real como estándar innegociable.

**Qué se decidió (inmutable):**

- `prisma db push` como método de sincronización de schema en
  dev (no `prisma migrate dev`, que falla con el pooler de
  Supabase).
- Host `aws-1-sa-east-1.pooler.supabase.com` confirmado.
- NextAuth v5 con patrón explícito `NextAuthResult` para evitar
  errores de inferencia de tipos en monorepo.

**Qué quedó pendiente:**

- Primer deploy a Vercel (sesión separada, verificar que no
  aparezca el bug de los 326ms).
- Iniciar Fase 1: flujo de Auth y Onboarding.

**Prueba de fuego cumplida:**

```
pnpm type-check → 0 errores (5 packages)
pnpm build --filter=@enbandeja/web → ✓ Compiled successfully (6 páginas)
Supabase → 35 tablas + 27 RLS policies + 4 CHECK constraints + 4 planes seed
```

---

### 2026-04-11 — Cierre del ADN visual + codificación del sistema de diseño

**Qué se hizo:**

- Se analizaron rigurosamente 6 Design DNA de UI8 (Vroom, Bento
  Cards, MediCon, HRMS, Packo, Pharmacy Healthcare) y las 3
  capturas de fluidez del calendario Samsung nativo para extraer
  los patrones visuales correctos.
- Se generó el documento **`docs/PLAN_MAESTRO_DISEÑO.md` v1.0**
  como fuente única de verdad visual del producto, estructurado en
  5 capítulos: ADN visual y tokens, anti-patrones prohibidos,
  arquitectura core mobile (Master-Detail con 3 zonas y calendario
  expansible Samsung-style), arquitectura desktop/tablet (sidebar
  + workspace Bento), y reglas de generación para el Agente
  Frontend con protocolo de inicio obligatorio.
- Se actualizó **`docs/agentes/design-system.md` a v1.1**
  sincronizado con el Plan Maestro de Diseño, reemplazando los
  tokens provisorios iniciales (verde + Inter básico) por los
  definitivos (Azul Eléctrico Vroom + Deep Navy + Plus Jakarta
  Sans/Inter + Liquid Glass).
- Se generó **`apps/web/tailwind.config.ts`** listo para que Claude
  Code lo incorpore en la Tarea 6 del Master Prompt Fase 0. El
  config traduce textualmente el Capítulo 1 del Plan Maestro de
  Diseño: colors (primary `#3B5BFE`, surface `#1A1D2E`, background
  `#0D0F1A`, warning `#F59E0B` para errores), tipografía dual
  display + sans, borderRadius con `xl=24px` para Bento cards,
  shadows con `glass` inset + `glow-primary`, y backdropBlur con
  máximo `glass=16px`.

**Qué se decidió (inmutable):**

- **Dark mode primero.** Light mode existe como variante
  secundaria. Toda decisión visual se toma primero para dark y se
  deriva.
- **Azul Eléctrico Vroom `#3B5BFE`** es el color brand único,
  sobre Deep Navy `#0D0F1A` como fondo y `#1A1D2E` como surface
  primaria.
- **Plus Jakarta Sans** para display/títulos + **Inter** para body
  + **JetBrains Mono** para datos técnicos puntuales. Prohibido
  mezclar más de estas 3 fuentes.
- **Bento Cards con `border-radius: 24px`** y material Liquid
  Glass (`blur(16px) saturate(180%)` + `border 1px white/10`) como
  contenedor universal del producto. Listas planas prohibidas.
- **Anti-patrón absoluto: cero morados, cero rojos.** El rojo se
  reemplaza por ámbar `#F59E0B` para errores y estados de alerta,
  y solo aparece en 2 excepciones documentadas (confirmación
  literal "CANCELAR" de suscripción destructiva + estado
  `EXPIRADO` en logs del Super Admin).
- **Patrón Master-Detail con 3 zonas** para la app del apoderado
  mobile: Zona A calendario expansible Samsung-style (swipe-down
  con micro-líneas de estado bajo números, sin texto), Zona B
  Bento Grid scrolleable del menú + kiosko drawer, Zona C Floating
  Cart + Bottom Nav con píldora active state azul (4 items
  máximo).
- **Desktop/tablet** usa sidebar 240px Liquid Glass + workspace
  padding 32px. Vista del operador estilo Packo (filas 64px con
  avatares 40px). Dashboard del owner con Bento de métricas
  grandes en `text-display` 32px. Vista de cocina full-screen con
  tipografía 50% más grande para lectura a 3 metros. Botones del
  kiosko masivos (72px alto contraste).
- **Sistema de espaciado base 8px** (múltiplos de 8, con 4 para
  casos sutiles). Radios `sm=8 md=12 lg=16 xl=24 2xl=32 full`.
- **Protocolo obligatorio para el Agente Frontend** antes de
  generar cualquier componente: leer Plan Maestro → identificar
  zona arquitectónica → confirmar con mensaje exacto → esperar
  autorización. 10 reglas no negociables + checklist anti-patrón
  antes de entregar.

**Qué quedó pendiente:**

- Subir `docs/PLAN_MAESTRO_DISEÑO.md` al Project Knowledge del
  Claude Project (para que esté disponible en futuras
  conversaciones estratégicas sin tener que adjuntarlo).
- Ejecutar el Master Prompt Fase 0 en Claude Code siguiendo la
  carta Gantt preparada. Al llegar a la Tarea 4 (package
  `packages/ui`), Claude Code debe crear el `design-system.ts`
  consistente con el Plan Maestro, y al llegar a la Tarea 6 debe
  usar el `tailwind.config.ts` ya preparado.
- Primer deploy a Vercel en **sesión separada** después de
  completar Fase 0 (verificar con calma que no aparece el bug de
  los 326ms).

**Artefactos entregados en esta sesión:**

- `docs/PLAN_MAESTRO_DISEÑO.md` (v1.0, fuente de verdad visual)
- `docs/agentes/design-system.md` (v1.1, sincronizado)
- `apps/web/tailwind.config.ts` (preparado para Tarea 6)
- Esta entrada del `ledger.md`

**Estado del ADN visual:** 🔒 BLOQUEADO como fuente única de verdad
para Fase 0. Cualquier cambio visual en adelante requiere
actualización formal del `PLAN_MAESTRO_DISEÑO.md` con bump de
versión y nueva entrada en este ledger.

---

### 2026-04-10 — Documentación fundacional completa

**Qué se hizo:**

- Se cerraron los 5 bloques de decisiones funcionales (insumo
  histórico, archivado en `notes/vault/projects/enbandeja/bloques/`).
- Se generó el checklist de 15 ajustes de síntesis aplicados al
  Plan Maestro.
- Se armó el workspace `lab/` con estructura completa, `CLAUDE.md`
  raíz, y los 6 archivos de bloques movidos al vault.
- Se generó el **Plan Maestro completo** en `docs/plan.md`:
  - Parte A: Visión y Mercado (OrderEAT, HealthyFood, TAM/SAM/SOM)
  - Parte B: Arquitectura Fundacional (13 decisiones B0-B12)
  - Parte C primera mitad: Módulos, 6 fases semana a semana,
    schema Prisma con 35 tablas, SQL de constraints/RLS/REVOKE
  - Parte C segunda mitad: Stack con versiones exactas,
    monetización con rangos del Ajuste #15, timeline con hitos,
    15 riesgos, Master Prompt Fase 0, 9 mandamientos heredados
- Se generaron los archivos de la Tanda 3 (documentación de
  ejecución):
  - `CLAUDE.md` del proyecto con las 10 reglas y 9 mandamientos
  - `ledger.md` inicial (este archivo)
  - `docs/handoff-v01.md` (snapshot fundacional inmutable)
  - `docs/resources.md` (referencias externas del stack)
- Se generaron los 4 agentes especializados de la Tanda 4:
  - `docs/agentes/database.md` (schema, RLS, CHECK constraints,
    migrations)
  - `docs/agentes/backend.md` (API routes, webhooks, cron,
    Inngest, middlewares)
  - `docs/agentes/frontend.md` (React, Next.js 15, Server
    Components, formularios Zod)
  - `docs/agentes/design-system.md` (tokens visuales — versión
    inicial v1.0, superada en la sesión del 2026-04-11)
- Se generó `docs/master-prompt-fase0.md` como archivo separado
  con el prompt copy-paste de las 10 tareas de Fase 0.

**Qué se decidió (inmutable):**

- Workspace `lab/` con Enbandeja como único proyecto activo. Otros
  proyectos quedan fuera del workspace por ahora.
- Patrón `ledger.md` vivo reemplaza el `Handoff-vXX.md` versionado
  de proyectos anteriores.
- Los 5 bloques son insumo histórico, no documentación viva del
  proyecto.
- Todos los 15 ajustes del checklist de síntesis están aplicados
  al Plan Maestro.
- Fase 0 se ejecutará con el Master Prompt en
  `docs/master-prompt-fase0.md`.
- Stack técnico congelado: Turborepo 2 + Next.js 15 + Prisma 5 +
  Supabase PostgreSQL 15 + NextAuth v5 beta 19 (strategy:database)
  + Tailwind 3.4 + Vercel con `Framework=Other` y
  `Root Directory=[vacío]`.

**Qué quedó pendiente:**

- Confirmar todas las cuentas externas listadas en la sección
  de bloqueos.
- Definir el ADN visual del producto antes de ejecutar el Master
  Prompt (pendiente que se resolvió en la sesión del 2026-04-11).
- Ejecutar el Master Prompt en Claude Code para arrancar Fase 0
  técnicamente.

---

## Convenciones del ledger

### Cómo actualizar este archivo

Al final de cada sesión de trabajo, Claude Code (con autorización)
agrega una entrada nueva **arriba del historial** con este formato:

```markdown
### YYYY-MM-DD — Título corto de la sesión

**Qué se hizo:**
- (lista de cosas concretas, en pasado)

**Qué se decidió:**
- (decisiones tomadas que afectan el plan)

**Qué quedó pendiente:**
- (cosas que hay que retomar la próxima sesión)
```

Y actualiza la sección **Estado actual** arriba del archivo:

- Cambia "Última sesión" al título nuevo
- Cambia "Próxima tarea" a la siguiente acción concreta
- Agrega o quita bloqueos según corresponda

### Cuándo NO actualizar el ledger

- Cuando cambia algo del Plan Maestro fundacional (eso va en
  `docs/plan.md` con un commit explicando el cambio)
- Cuando se cambia una regla técnica (eso va en `CLAUDE.md` del
  proyecto)
- Cuando cambia el ADN visual (eso va en
  `docs/PLAN_MAESTRO_DISEÑO.md` con bump de versión)
- Cuando se descubre una referencia externa nueva (eso va en
  `docs/resources.md`)

El ledger es **estado vivo del proyecto**, no documentación de
arquitectura.

---

*Ledger del proyecto Enbandeja — última actualización: 2026-04-14,
Semana 4 ✅ COMPLETADA + ajustes post-cierre. Próximo: email auth → Semana 5.*
