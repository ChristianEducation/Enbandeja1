# ENBANDEJA — CLAUDE.md del Proyecto

> Este archivo es el manual de reglas técnicas innegociables del
> proyecto Enbandeja. Claude Code lo lee al iniciar **cada sesión**
> dentro de `lab/projects/enbandeja/`. Es la "constitución técnica"
> que rige cómo se escribe el código.
>
> Si una decisión no está aquí ni en `docs/plan.md`, **se detiene la
> ejecución y se pregunta**. No se inventan respuestas.

---

## 0. PROTOCOLO DE INICIO OBLIGATORIO

Antes de ejecutar cualquier tarea en una sesión nueva, Claude Code
**debe** confirmar con un mensaje exacto del estilo:

> "Contexto absorbido. Proyecto Enbandeja, fase [X], última sesión:
> [resumen en 1 línea según ledger.md]. Próxima tarea según ledger:
> [tarea]. Esperando autorización."

Si cualquiera de estos archivos no existe, Claude Code se detiene y
avisa antes de cualquier acción:

- `ledger.md`
- `docs/plan.md`
- `CLAUDE.md` (este archivo)

---

## 1. READ ORDER OBLIGATORIO AL INICIAR SESIÓN

ledger.md             → estado actual y próxima tarea
docs/plan.md          → Plan Maestro (visión, arquitectura, fases)
CLAUDE.md             → este archivo (reglas innegociables)
docs/resources.md     → referencias externas (cuando aplique)


Si la sesión va a tocar un dominio específico, Claude Code lee
también el agente correspondiente:

- Schema, RLS, migraciones → `docs/agentes/database.md`
- API routes, webhooks, cron → `docs/agentes/backend.md`
- Componentes React, layouts → `docs/agentes/frontend.md`
- Colores, tipografía, UI tokens → `docs/agentes/design-system.md`

---

## 2. STACK OBLIGATORIO — VERSIONES EXACTAS

Estas versiones son las que produjeron el build exitoso de MedXRay
Enterprise. **No se cambian sin correr `pnpm build` primero.**

| Capa | Tecnología | Versión exacta |
|---|---|---|
| Package manager | pnpm | **9.15.0** |
| Runtime | Node.js | **24.14.1** (mínimo 24.0.0) |
| Monorepo | Turborepo | `^2.0.0` |
| Frontend | Next.js | **15.0.0** |
| Lenguaje | TypeScript | `^5.4.0` |
| Estilos | Tailwind CSS | `^3.4.0` |
| ORM | Prisma | `^5.14.0` |
| DB | PostgreSQL (Supabase) | **PostgreSQL 15** |
| Auth | NextAuth | **`^5.0.0-beta.19`** (strategy:`"database"`) |
| Auth adapter | `@auth/prisma-adapter` | `^2.4.1` |
| Background jobs | Inngest | `^3.22.0` |
| Email | Resend | `^4.0.0` |
| Pago CL | `transbank-sdk` | `^5.0.0` |
| Pago LATAM | `mercadopago` | `^2.0.0` |
| IA soporte | `@anthropic-ai/sdk` | `^0.27.0` |
| Íconos | `lucide-react` | `^0.263.1` (SOLO en `packages/ui`) |
| Charts | Recharts | `^2.12.0` |
| PDF | `@react-pdf/renderer` | `^3.4.0` |
| Excel | `xlsx-js-style` | `^1.2.0` |
| Validación | Zod | `^3.23.0` |
| Data fetching | `@tanstack/react-query` | `^5.40.0` |
| Fechas | `date-fns` + `date-fns-tz` | `^3.0.0` |
| Test E2E | Playwright | `^1.44.0` |
| Test unit | Vitest | `^1.6.0` |
| Monitoreo | Sentry | `^8.0.0` |

---

## 3. LAS 10 REGLAS INNEGOCIABLES

### Regla 1 — Multi-tenancy estricto

Toda ruta de negocio usa `createTenantClient(tenantId, userId)`.
**Nunca** `prisma` global en rutas autenticadas. El cliente global
se reserva para seed, migraciones y operaciones del Super Admin.

Test mental obligatorio antes de cada query nueva:

> "Si el `WHERE` de mi query está mal escrito, ¿puede Tenant A
> ver datos de Tenant B?"

Si la respuesta es "sí" o "no estoy seguro", la query DEBE pasar
por `createTenantClient`.

### Regla 2 — Modelos Prisma siempre completos

Todos los IDs se declaran exactamente así:

```prisma
id String @id @default(uuid()) @db.Uuid
```

Sin excepciones. Sin abreviar. Sin `cuid()`. Sin omitir
`@default(uuid())`.

Todas las relaciones en **PascalCase**:

```prisma
// ✅ CORRECTO
Tenant Tenant @relation(fields: [tenantId], references: [id])
Items  PedidoItem[]
```

```prisma
// ❌ PROHIBIDO
tenant tenant @relation(...)
items  pedidoItem[]
```

Todas las consultas también consumen las relaciones en PascalCase:

```typescript
// ✅ CORRECTO
await db.pedido.findMany({ include: { Apoderado: true, Items: true } })

// ❌ PROHIBIDO
await db.pedido.findMany({ include: { apoderado: true, items: true } })
```

### Regla 3 — Fronteras estrictas entre packages y app

`next/server`, `next/navigation`, `next/headers` y cualquier otro
módulo de Next.js se usan **SOLO** en `apps/web`. Los packages
compartidos (`database`, `shared`, `ui`, `support-kb`) **nunca** los
importan.

Si un package necesita devolver un error, lanza una excepción
tipada. `apps/web` la captura y la convierte a respuesta HTTP.

### Regla 4 — Dependencias en el package que las consume

Cada dependencia se instala en el `package.json` del package que la
importa directamente. **No se duplican entre packages.**

- `lucide-react` vive **SOLO** en `packages/ui/package.json`.
  `apps/web` lo consume re-exportado desde `@enbandeja/ui`.
- `@prisma/client` vive **SOLO** en `packages/database/package.json`.
- `next` vive **SOLO** en `apps/web/package.json`.

### Regla 5 — Soft delete vs inmutable

**Tablas editables** (User, Tenant, Colegio, Comensal, Menu,
OpcionMenu, Pedido, Suscripcion, etc.) tienen siempre:

```prisma
deletedAt DateTime?
version   Int       @default(1)
updatedAt DateTime  @updatedAt
```

**Tablas inmutables** (`AuditLog`, `CreditoMovimiento`,
`WebhookEventLog`, `KpiSnapshot`, `NotificacionLog`,
`PagoSuscripcion`, `PedidoItem`) **nunca** tienen `updatedAt`,
`deletedAt`, ni `version`. Y en producción se les aplica:

```sql
REVOKE UPDATE, DELETE ON "TablaInmutable" FROM PUBLIC;
```

### Regla 6 — NextAuth con strategy:"database"

NextAuth v5 SIEMPRE configurado con `strategy: "database"`. Nunca
JWT. La invalidación de sesión es trivial:

```typescript
await db.session.deleteMany({ where: { userId } })
```

El modelo `Session` está extendido con `activeTenantId` para soportar
usuarios con hijos en múltiples tenants.

### Regla 7 — RLS sin `auth.uid()`

En policies RLS **NUNCA** se usa `auth.uid()`. Esa función es de
Supabase Auth, y NextAuth con strategy:database no emite JWTs de
Supabase.

```sql
-- ✅ CORRECTO
CREATE POLICY "tenant_aislamiento" ON "Pedido"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "apoderado_propio" ON "Pedido"
FOR SELECT USING (
  "apoderadoId" = current_setting('app.current_user_id')::uuid
);
```

```sql
-- ❌ PROHIBIDO
CREATE POLICY "..." ON "..." FOR ALL USING (
  "userId" = auth.uid()
);
```

### Regla 8 — Fechas y timezone

Todas las fechas se guardan en UTC (`TIMESTAMPTZ` en Postgres).

Toda comparación de "hora local" usa `toZonedTime(fecha, tenant.timezone)`
de `date-fns-tz`. Nunca se asume `America/Santiago` hardcodeado.

Los crons que dependen del fin del día corren cada hora en UTC y
filtran tenants donde `horaLocal.getHours() === 23`.

### Regla 9 — Invariante contable del Pedido

`Pedido.total = Pedido.creditoAplicado + Pedido.totalPagado` siempre.

Garantizado en 3 niveles:

1. **Zod** en el validator del endpoint de creación
2. **Backend** recalcula `totalPagado = total - creditoAplicado`
   antes de pasarle datos a Prisma
3. **Postgres** con `CHECK constraint`:
```sql
   ALTER TABLE "Pedido"
   ADD CONSTRAINT "pedido_total_invariant"
   CHECK ("total" = "creditoAplicado" + "totalPagado");
```

**Nunca confiar en lo que viene del frontend para estos cálculos.**

### Regla 10 — Webhook de pago idempotente

Todo webhook de Webpay/MercadoPago entra por `WebhookEventLog` con
`orderId` único. Si el `orderId` ya existe con `processed=true`, se
retorna 200 sin efecto.

El webhook **siempre** verifica firma HMAC del payload antes de
procesar lógica de negocio.

El `PedidoItem` tiene snapshot inmutable de `nombre`, `precio` y
`subtotal` al momento del pago. **No se modifican retroactivamente**
aunque el operador cambie el precio de la opción después.

---

## 4. LOS 9 MANDAMIENTOS HEREDADOS DE MEDXRAY

Estos son lecciones de proyectos anteriores que costaron horas o
días de debugging. **Se aplican desde la primera línea de código de
Enbandeja.**

### Mandamiento 1 — IDs siempre con `@default(uuid())`
Si un ID no tiene `@default(uuid())`, Prisma exige el UUID manual en
cada `create`. La regla es: declaración completa siempre, sin
excepciones.

### Mandamiento 2 — Relaciones Prisma siempre PascalCase
Las relaciones en camelCase causan errores TypeScript en cascada en
toda la aplicación. PascalCase consistente entre schema y código.

### Mandamiento 3 — `next/server` solo en `apps/web`
Importar módulos de Next.js en packages compartidos rompe el build
completo. Frontera estricta: packages no conocen Next.js.

### Mandamiento 4 — `lucide-react` solo en `packages/ui`
Las dependencias se instalan en el package que las consume
directamente. Cero duplicación entre packages.

### Mandamiento 5 — Vercel: `Framework=Other`, `Root Directory=[vacío]`
Cualquier otra configuración produce el bug del "deploy de 326ms"
donde Vercel usa cache viejo sin ejecutar el build.
Framework Preset:     Other
Root Directory:       [VACÍO]
Build Command:        cd apps/web && pnpm build
Output Directory:     apps/web/.next
Install Command:      pnpm install

**Sin `vercel.json` en la raíz.** Si el primer deploy de Fase 0
tarda menos de 1 minuto, es este bug. Detener, Clear Build Cache,
revisar config, redesplegar.

### Mandamiento 6 — Variable `DATABASE_DIRECT_URL` con nombre exacto
La variable de entorno de conexión directa a Postgres se llama
**EXACTAMENTE** `DATABASE_DIRECT_URL` en todos los lugares:
`schema.prisma`, `.env.example`, `.env.local`, Vercel, documentación.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL")
}
```

### Mandamiento 7 — `postinstall` obligatorio en `package.json` raíz
Sin él, Vercel despliega sin Prisma Client generado y todo el build
falla con `Namespace 'Prisma' has no exported member`.

```json
{
  "scripts": {
    "postinstall": "cd packages/database && npx prisma generate"
  }
}
```

### Mandamiento 8 — Design system centralizado en un solo archivo
Toda la información visual (colores, tipografía, espaciado, bordes,
sombras) vive en `packages/ui/src/lib/design-system.ts` como fuente
única de verdad. Ningún componente hardcodea valores visuales.

Cambiar el tema visual completo es un cambio de un solo archivo. Ver
`docs/agentes/design-system.md` para detalles.

### Mandamiento 9 — Fronteras estrictas Server/Client Components
Si un componente tiene `"use client"`, no puede importar:

- `@enbandeja/database`
- Variables de entorno privadas (sin prefijo `NEXT_PUBLIC_`)
- `next/headers`, `next/server`
- Funciones que accedan al filesystem

Los Server Components hablan con la base de datos. Los Client
Components reciben datos resueltos como props. Ver
`docs/agentes/frontend.md` para el patrón completo.

---

## 5. CONVENCIONES DE TRABAJO

### Idioma
- **Código, comentarios, commits y mensajes de error:** español
- **Nombres de variables y funciones:** inglés técnico estándar
  (camelCase, PascalCase)
- **Nombres de tablas Prisma:** PascalCase (`Comensal`, `Pedido`,
  `OpcionMenu`)

### Commits (conventional commits en español)
feat: agrega creación de pedido con validación de stock
fix: corrige cálculo de crédito en cancelación post-webhook
refactor: extrae lógica de precios a getPrecioParaComensal
docs: documenta flujo de pago con monto cero
test: agrega test E2E de aislamiento entre tenants
chore: actualiza dependencias de Prisma a 5.14.1

### Trabajo con archivos
- **Nunca entregar código parcial.** Archivos completos siempre.
  Nada de `// ... existing code` ni `// resto igual`.
- **Leer el archivo antes de modificarlo.** Nunca asumir contenido.
- **TypeScript estricto.** Cero `any`, cero `as any`, cero errores
  de compilación.
- **ESLint debe pasar** antes de dar por terminada cualquier tarea.

### Decisiones explícitas
Si hay ambigüedad y no hay contexto suficiente para decidir, Claude
Code **se detiene y pregunta** antes de inventar. Una sola pregunta
clara y específica, no una lista de 5 puntos.

---

## 6. CHECKLIST ANTES DE CODIFICAR (cualquier feature nueva)

- [ ] ¿Esta tarea está en `docs/plan.md`? Si no, detener y avisar.
- [ ] ¿Existe un agente especializado para este dominio? Leerlo.
- [ ] ¿La query usa `createTenantClient`? (si toca tabla con `tenantId`)
- [ ] ¿Las relaciones Prisma están en PascalCase?
- [ ] ¿Hay validación Zod en el endpoint?
- [ ] ¿La operación es atómica con `$transaction` cuando corresponde?
- [ ] ¿Hay test E2E si toca auth, multi-tenancy, billing o pagos?
- [ ] ¿Las fechas usan `toZonedTime` con timezone del tenant?
- [ ] ¿El frontend respeta la frontera Server/Client?
- [ ] ¿Los colores y tokens visuales vienen del design-system?

---

## 7. DEFINITION OF DONE POR FEATURE

Una feature se considera terminada cuando:

- [ ] El código compila con 0 errores TypeScript
- [ ] ESLint pasa sin warnings
- [ ] Tests E2E correspondientes pasan al 100%
- [ ] El `ledger.md` se actualiza con qué se hizo
- [ ] El commit sigue conventional commits en español
- [ ] Si tocó `schema.prisma`, las migrations están aplicadas
- [ ] Si tocó variables de entorno, `.env.example` está actualizado
- [ ] Si tocó documentación, está reflejado en el archivo correcto

---

## 8. CÓMO INVOCAR AGENTES ESPECIALIZADOS

Cuando una tarea requiere conocimiento profundo de un dominio
específico, Claude Code **debe leer el agente correspondiente** antes
de avanzar.

| Tarea | Agente a leer |
|---|---|
| Modificar `schema.prisma` | `docs/agentes/database.md` |
| Crear/editar RLS policies | `docs/agentes/database.md` |
| Crear API route nueva | `docs/agentes/backend.md` |
| Trabajar en webhooks de pago | `docs/agentes/backend.md` |
| Configurar cron job | `docs/agentes/backend.md` |
| Crear componente React nuevo | `docs/agentes/frontend.md` |
| Implementar Server Action | `docs/agentes/frontend.md` |
| Cambiar colores, tipografía, espaciados | `docs/agentes/design-system.md` |

Si el agente especializado no existe todavía o está incompleto,
Claude Code **se detiene y avisa** en lugar de adivinar.

---

## 9. SEÑALES DE ALERTA INMEDIATAS

Si Claude Code detecta cualquiera de estas situaciones, **detiene
toda ejecución** y reporta antes de continuar:

- Un deploy de Vercel que tarda menos de 1 minuto (Mandamiento 5)
- Error `Namespace 'Prisma' has no exported member` (Mandamiento 7)
- Imports de `next/server` fuera de `apps/web` (Mandamiento 3)
- Relaciones Prisma en camelCase (Mandamiento 2)
- `prisma` global usado en una ruta de negocio (Regla 1)
- Policy RLS con `auth.uid()` (Regla 7)
- Componente con `"use client"` que importa `@enbandeja/database`
  (Mandamiento 9)
- Hardcoded `#hex` o color literal en componente React (Mandamiento 8)

---

## 10. FUENTES DE VERDAD POR DOMINIO

| Pregunta | Dónde está la respuesta |
|---|---|
| ¿Qué es Enbandeja? | `docs/plan.md` Parte A |
| ¿Por qué se decidió X arquitectura? | `docs/plan.md` Parte B |
| ¿En qué fase estamos? | `ledger.md` |
| ¿Cuál es el schema Prisma? | `docs/plan.md` Parte C sección 6 |
| ¿Qué versiones del stack? | Sección 2 de este archivo |
| ¿Cuáles son las reglas técnicas? | Este archivo (CLAUDE.md) |
| ¿Cómo se ve el diseño? | `docs/agentes/design-system.md` |
| ¿Cómo configuro un cron job? | `docs/agentes/backend.md` |
| ¿Cómo creo un componente nuevo? | `docs/agentes/frontend.md` |
| ¿Cómo hago una migration? | `docs/agentes/database.md` |
| ¿Qué referencias externas usa el stack? | `docs/resources.md` |

---

*CLAUDE.md del proyecto Enbandeja — versión 1.0*
*Este archivo se actualiza solo si cambian las reglas innegociables.*
*Cambios menores van al `ledger.md`, no acá.*