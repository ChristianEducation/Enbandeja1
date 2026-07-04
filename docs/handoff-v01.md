# ENBANDEJA — HANDOFF v01

**Fecha:** Abril 2026
**Versión:** 1.0 — Snapshot fundacional
**Estado del documento:** ⛔ INMUTABLE — no se modifica después de creado
**Autor:** Christian Wevar

> Este archivo es el **acta de nacimiento** del proyecto Enbandeja.
> Captura el estado del proyecto en el momento exacto previo a
> escribir la primera línea de código de Fase 0.
>
> A diferencia del `ledger.md` que es estado vivo y se actualiza
> sesión a sesión, este Handoff v01 es **inmutable**: queda como
> referencia histórica del punto de partida. Cualquier evolución
> posterior del proyecto se refleja en el `ledger.md` o en
> `docs/plan.md`, nunca acá.

---

## 1. Identidad del proyecto

**Nombre:** Enbandeja
**Tipo:** SaaS multi-tenant self-service
**Dominio:** Gestión operativa de casinos escolares en Chile
**Mercado objetivo:** PYMES concesionarias de casinos en colegios
particulares y subvencionados que cobran directamente al apoderado
(fuera del programa JUNAEB)
**Cliente ancla identificado:** HealthyFood Antofagasta (4 colegios:
San Esteban, Antonio Rendic, San Agustín, Netland)
**Competidor directo:** OrderEAT (Uruguay)

**Fundador y único desarrollador en v1:** Christian Wevar
(Antofagasta, Chile)

---

## 2. Estado del proyecto en el momento de este Handoff

**Fase actual:** Fase 0 — Cimientos
**Línea de código escrita:** 0
**Repositorio Git creado:** No (se crea en la primera tarea del
Master Prompt Fase 0)
**Schema Prisma aplicado:** No (se aplica en la Tarea 9 del Master
Prompt)
**Deploy Vercel funcional:** No (se logra al cierre de Fase 0)

**Lo que sí existe ya:**

- Documentación fundacional completa (`docs/plan.md` con sus 3 partes)
- Reglas técnicas innegociables (`CLAUDE.md` del proyecto)
- Estructura de workspace `lab/` armada en disco
- Ledger del proyecto con estado inicial
- 5 bloques de decisiones funcionales archivados en el vault
- Checklist de 15 ajustes aplicados al Plan Maestro
- Master Prompt para arrancar Fase 0 (próximo paso)

---

## 3. Decisiones fundacionales tomadas (referenciadas)

Las decisiones de arquitectura están detalladas en `docs/plan.md`
Parte B (B0 a B12). Este Handoff las lista solo para referencia
rápida:

| ID | Decisión | Documentado en |
|---|---|---|
| **B0** | Workspace `lab/` con `ledger.md` vivo | plan.md §B0 |
| **B1** | Monorepo Turborepo con `packages/` y `apps/` | plan.md §B1 |
| **B2** | Multi-tenancy con RLS + `createTenantClient` | plan.md §B2 |
| **B3** | `User` global, `UserTenant` para pertenencia, `Session.activeTenantId` | plan.md §B3 |
| **B4** | Flujo de pago con webhook idempotente y snapshot inmutable | plan.md §B4 |
| **B5** | Catálogo con `CategoriaPrecio` + `PrecioOpcion`, `Menu.estado` única fuente | plan.md §B5 |
| **B6** | Dashboard con `KpiSnapshot` por cron horario filtrando timezone | plan.md §B6 |
| **B7** | Billing SaaS con ciclo de suspensión 0→3→31→121 | plan.md §B7 |
| **B8** | Onboarding self-service + asistido, KB del bot en markdown | plan.md §B8 |
| **B9** | `NotificacionLog` inmutable + `NotificacionLeida` mutable separadas | plan.md §B9 |
| **B10** | Timezone configurable por tenant, fechas en UTC | plan.md §B10 |
| **B11** | 12 tests E2E críticos bloquean deploy | plan.md §B11 |
| **B12** | 12 candados de seguridad consolidados | plan.md §B12 |

---

## 4. Los 15 ajustes del checklist de síntesis — todos aplicados

| # | Ajuste | Aplicado en |
|---|---|---|
| 1 | `User` global a la plataforma | plan.md §B3 |
| 2 | RLS con `current_setting`, NUNCA `auth.uid()` | plan.md §B2, schema SQL §6.3 |
| 3 | `Session.activeTenantId` para tenant activo | plan.md §B3, schema §6.1 |
| 4 | Enum `MetodoPago` (no String) | plan.md §B4, §B7, schema §6.1 |
| 5 | Invariante `Pedido.total = creditoAplicado + totalPagado` | plan.md §B4, schema SQL §6.3 |
| 6 | Stock kiosco reposición manual en v1 | plan.md §B5, fase 2 |
| 7 | CHECK constraint XOR en `PedidoItem` | plan.md §B4, schema SQL §6.3 |
| 8 | Eliminar `Menu.publicado`, dejar solo `Menu.estado` | plan.md §B5, schema §6.1 |
| 9 | Flujo especial para `precio = 0` (becados) | plan.md §B4 |
| 10 | Scope de kiosco v1 documentado | plan.md §B5 |
| 11 | Cron `KpiSnapshot` itera por timezone de cada tenant | plan.md §B6, §B10 |
| 12 | `NotificacionLog` inmutable + `NotificacionLeida` separada | plan.md §B9, schema §6.1 |
| 13 | Bot WhatsApp con KB en markdown plano en `packages/support-kb/` | plan.md §B8 |
| 14 | Cobro manual de suscripción en v1 vía panel Super Admin | plan.md §B7 |
| 15 | Rangos orientativos de precios para los 4 planes | plan.md §8.2 |

---

## 5. Stack técnico congelado para Fase 0

Las versiones que se usarán están listadas en `CLAUDE.md` del
proyecto sección 2 y en `docs/plan.md` sección 7.1.

**Resumen del genoma técnico:**

- **Monorepo:** Turborepo `^2.0.0` con pnpm 9.15.0 y Node 24.14.1
- **Frontend + API:** Next.js 15.0.0 con TypeScript ^5.4.0 y
  Tailwind ^3.4.0
- **ORM:** Prisma ^5.14.0 sobre PostgreSQL 15 (Supabase)
- **Auth:** NextAuth `^5.0.0-beta.19` con `strategy: "database"`
- **Email:** Resend ^4.0.0
- **Pago apoderados:** `transbank-sdk` ^5.0.0 + `mercadopago` ^2.0.0
- **Soporte IA:** `@anthropic-ai/sdk` ^0.27.0
- **Background jobs:** Inngest ^3.22.0
- **Testing:** Playwright ^1.44.0 + Vitest ^1.6.0
- **Monitoreo:** Sentry ^8.0.0
- **Deploy:** Vercel con `Framework=Other`, `Root Directory=[vacío]`

**Genoma heredado de:** MedXRay Enterprise (build de producción
exitoso, ~87 modelos Prisma multi-tenant).

---

## 6. Variables de entorno requeridas

Lista completa en `docs/plan.md` sección 7.2.

**Bloques de variables:**

- Database (Supabase) — `DATABASE_URL`, `DATABASE_DIRECT_URL`
- Auth NextAuth v5 — `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
  `NEXT_PUBLIC_APP_URL`
- Google OAuth — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Apple OAuth — `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`,
  `APPLE_TEAM_ID`, `APPLE_KEY_ID`
- Super Admin 2FA — `SUPER_ADMIN_TOTP_SECRET`
- Supabase Storage — `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  buckets (`menu-fotos`, `logos`, `kits-apoderados`,
  `exportaciones`)
- Email — `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Pasarelas pago apoderados — Webpay y MercadoPago
- Pasarelas billing v2 — Webpay OneClick, MercadoPago Suscripciones
- Anthropic — `ANTHROPIC_API_KEY`
- Meta WhatsApp Business — `META_WHATSAPP_TOKEN`,
  `META_PHONE_NUMBER_ID`, `META_WEBHOOK_VERIFY_TOKEN`
- Inngest — `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- Web Push — `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `VAPID_SUBJECT`
- Cron — `CRON_SECRET`
- Sentry — `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- Demo y adquisición — `NEXT_PUBLIC_LOOM_VIDEO_ID`,
  `NEXT_PUBLIC_ARCADE_TOUR_URL`, `NEXT_PUBLIC_CALENDLY_URL`

---

## 7. Prerequisitos antes de ejecutar Master Prompt Fase 0

Estas son las cuentas externas que tienen que estar listas antes de
correr la Tarea 9 del Master Prompt (que aplica el schema en Supabase):

- [ ] Cuenta de Supabase Pro con proyecto Enbandeja creado
- [ ] Cuenta de Vercel Pro vinculada a GitHub
- [ ] Repositorio GitHub `enbandeja` creado (vacío)
- [ ] Dominio registrado (`enbandeja.cl` o alternativo)
- [ ] Cuenta de Resend con dominio verificado
- [ ] Cuenta de Transbank Integración (Webpay sandbox)
- [ ] Cuenta de MercadoPago developer
- [ ] Cuenta de Anthropic con API key activa
- [ ] Proyecto en Google Cloud Console con OAuth configurado
- [ ] Cuenta de Apple Developer (USD 99/año)
- [ ] Cuenta de Sentry con proyecto Enbandeja
- [ ] Cuenta de Inngest

**Costo mensual estimado de infraestructura Fase 0-1:** USD 100-130
(CLP 90.000-120.000)

---

## 8. Próximo paso concreto

**Acción única:** abrir Claude Code en
`C:\Users\alain\lab\projects\enbandeja\` y pegar el contenido de
`docs/master-prompt-fase0.md` como primer mensaje de la sesión.

**Lo que Claude Code debe hacer al recibirlo:**

1. Leer `ledger.md`, `docs/plan.md`, `CLAUDE.md` (en ese orden)
2. Confirmar contexto absorbido con el mensaje del protocolo de
   inicio (sección 0 del CLAUDE.md del proyecto)
3. Esperar autorización para iniciar Tarea 1
4. Ejecutar las 10 tareas del Master Prompt en orden, deteniéndose
   entre cada una para reportar avance
5. Al completar Tarea 10, actualizar el `ledger.md` con "Fase 0
   COMPLETADA"

**Hito de cierre de Fase 0:**

```bash
pnpm build --filter=@enbandeja/web
# → 0 errores TypeScript
# → Deploy Vercel toma 2-3 minutos (NO 326ms)
# → Schema Prisma con 35 tablas aplicado en Supabase
# → Login Google y email funcional
# → Super Admin accede con 2FA
# → Test E2E tenant-isolation pasa al 100%
```

---

## 9. Lo que NO está incluido en este Handoff

- **No hay código.** Cero líneas. La primera línea de código se
  escribe cuando se ejecute el Master Prompt.
- **No hay decisiones de v2 cerradas.** Las features mencionadas
  como "v2" en el plan (DTE/SII, restricciones alimentarias
  estructuradas, QR de identificación, billing automático recurrente)
  son referencia para no cerrar puertas, no compromisos.
- **No hay precios finales.** Los rangos del Ajuste #15 son
  orientativos. Los precios definitivos se cierran con los primeros
  3-5 clientes beta en Fase 4-5.
- **No hay roadmap más allá de Fase 6.** Después de los primeros
  5-10 tenants pagadores en Antofagasta, las prioridades se
  reevaluarán con datos reales del producto.

---

## 10. Firma del Handoff

Este documento queda **sellado** al momento de su creación. Las
modificaciones posteriores al estado del proyecto se reflejan en:

- `ledger.md` — para estado vivo y avances semana a semana
- `docs/plan.md` — para cambios de decisiones fundacionales
  (raros, requieren commit explicativo)
- `CLAUDE.md` del proyecto — para cambios de reglas técnicas
  innegociables

**Este Handoff v01 nunca se sobrescribe.** Si en el futuro cambia
algo sustancial del proyecto, se crea un Handoff v02 al lado de
este, manteniendo el v01 como historia.

---

*Handoff v01 — Acta de nacimiento del proyecto Enbandeja*
*Christian Wevar — Antofagasta, Chile — Abril 2026*
*Próximo paso: ejecutar `docs/master-prompt-fase0.md` en Claude Code*