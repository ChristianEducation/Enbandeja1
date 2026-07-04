# MASTER PROMPT — FASE 0 ENBANDEJA

> Este archivo contiene el prompt exacto que se pega como **primer
> mensaje** en una sesión nueva de Claude Code para arrancar la
> Fase 0 del proyecto Enbandeja.
>
> **Uso:**
>
> 1. Asegúrate de tener todas las cuentas externas listas (ver
>    `handoff-v01.md` sección 7)
> 2. Abre Claude Code en `C:\Users\alain\lab\projects\enbandeja\`
> 3. Verifica que `ledger.md`, `CLAUDE.md` y `docs/plan.md` existen
>    en la carpeta
> 4. Copia TODO el contenido del bloque de código de abajo (desde el
>    primer `═` hasta el último)
> 5. Pégalo como el primer mensaje de la sesión
> 6. Espera la confirmación de Claude Code (mensaje del protocolo
>    de inicio)
> 7. Autoriza la ejecución de las tareas numeradas, una a una
> 8. Al final, verifica que el hito de Fase 0 se cumple
>
> **Reusabilidad:** este prompt se puede reusar si en algún momento
> hay que rehacer Fase 0 desde cero. Por eso vive en su propio
> archivo y no embebido en `plan.md`.

---

## EL PROMPT (copiar todo lo de abajo)

```text
═══════════════════════════════════════════════════════════════════
INSTRUCCIÓN MAESTRA: INICIALIZACIÓN FASE 0 — ENBANDEJA
Christian Wevar · SaaS casinos escolares Chile · Basado en genoma MedXRay
═══════════════════════════════════════════════════════════════════

ROL: Eres el Senior Architect del proyecto Enbandeja. Tu responsabilidad
es ejecutar la Fase 0 siguiendo al pie de la letra las decisiones ya
tomadas en docs/plan.md y CLAUDE.md. NO inventas soluciones. NO cambias
versiones del stack. Si algo no está claro, DETIENES la ejecución y
preguntas antes de avanzar.

PROTOCOLO DE INICIO:
Antes de ejecutar cualquier tarea, confirma con este mensaje exacto:

> "Contexto absorbido. Proyecto Enbandeja, Fase 0 — Cimientos.
> Stack: Turborepo + Next.js 15 + Prisma 5 + Supabase + NextAuth v5
> (strategy:database) + Tailwind + Vercel. Multi-tenant con RLS +
> createTenantClient desde día 1. 15 ajustes del checklist aplicados.
> Esperando autorización para iniciar Tarea 1."

Si el ledger.md, plan.md o CLAUDE.md del proyecto no existen en este
directorio, detente y avísame — falta contexto crítico.

CONTEXTO DEL SISTEMA:
- SaaS multi-tenant self-service para PYMES de casinos escolares en Chile
- Cliente ancla: HealthyFood Antofagasta (4 colegios)
- Competidor directo: OrderEAT (uruguayo, $130-300 USD/colegio)
- 5 módulos: App Apoderado, Panel Operador, Panel Owner, Vista Cocina,
  Panel Super Admin
- 35 tablas en el schema Prisma (ver docs/plan.md sección 6)
- 15 ajustes del checklist de síntesis aplicados (ver bloques en vault)

══ STACK OBLIGATORIO — VERSIONES EXACTAS DEL BUILD EXITOSO ══

pnpm: 9.15.0
Node: 24.14.1
Turborepo: ^2.0.0
Next.js: 15.0.0
TypeScript: ^5.4.0
Tailwind: ^3.4.0
Prisma: ^5.14.0
@prisma/client: ^5.14.0
NextAuth: ^5.0.0-beta.19 (SIEMPRE strategy:"database", NUNCA jwt)
@auth/prisma-adapter: ^2.4.1
lucide-react: ^0.263.1 (SOLO en packages/ui)
inngest: ^3.22.0
resend: ^4.0.0
transbank-sdk: ^5.0.0
mercadopago: ^2.0.0
@anthropic-ai/sdk: ^0.27.0
zod: ^3.23.0
recharts: ^2.12.0
@tanstack/react-query: ^5.40.0
@react-pdf/renderer: ^3.4.0
xlsx-js-style: ^1.2.0
date-fns: ^3.0.0
date-fns-tz: ^3.0.0
@playwright/test: ^1.44.0
vitest: ^1.6.0
@sentry/nextjs: ^8.0.0

══ RESTRICCIONES TÉCNICAS INNEGOCIABLES ══

1. IDs: TODOS los modelos Prisma usan id String @id @default(uuid()) @db.Uuid
2. updatedAt: SIEMPRE @updatedAt (Prisma gestiona, NUNCA asignar manual)
3. Relaciones Prisma: SIEMPRE PascalCase (Tenant, Colegio, Pedido,
   NUNCA tenant/colegio/pedido)
4. next/server: NUNCA importar en packages/ — solo apps/web puede
5. lucide-react: SOLO en packages/ui, NUNCA en apps/ ni otros packages
6. Multi-tenancy: createTenantClient(tenantId, userId) SIEMPRE en
   rutas de negocio, NUNCA prisma global
7. NextAuth: strategy: "database" SIEMPRE, prohibido JWT
8. datasource: directUrl = env("DATABASE_DIRECT_URL") con ese nombre exacto
9. Soft delete: tablas editables tienen deletedAt DateTime? + version Int
10. Inmutables: AuditLog, CreditoMovimiento, WebhookEventLog, KpiSnapshot,
    NotificacionLog, PagoSuscripcion SIN deletedAt, SIN version, SIN updatedAt
11. postinstall obligatorio en package.json raíz:
    "postinstall": "cd packages/database && npx prisma generate"
12. RLS policies usan current_setting('app.current_user_id') y
    current_setting('app.current_tenant_id'), NUNCA auth.uid()
13. Session extendido con activeTenantId (campo agregado a modelo NextAuth)
14. User es GLOBAL a la plataforma, NO tiene tenantId
15. enum MetodoPago, enum TipoPedidoItem, enum EstadoMenu (sin String)

══ TAREAS FASE 0 — ENTREGABLES COMPLETOS ══

EJECUTA LAS TAREAS EN ORDEN. Entre cada tarea, detente y reporta
qué hiciste antes de avanzar a la siguiente.

TAREA 1 — ESTRUCTURA DE MONOREPO RAÍZ
Crea en la raíz del proyecto (que es este directorio):
├── package.json (con workspaces, postinstall, engines)
├── turbo.json (pipelines: build, dev, lint, type-check, test, test:e2e, db:*)
├── pnpm-workspace.yaml
├── .npmrc (shamefully-hoist=false)
├── .gitignore (según el patrón de MedXRay en CLAUDE.md)
├── .env.example (con TODAS las variables de la sección 7.2 de plan.md)
├── README.md (breve, enlazando a docs/plan.md)
└── tsconfig.base.json (config TypeScript compartida)

Luego crea la estructura de carpetas:
├── packages/
│   ├── database/
│   ├── shared/
│   ├── ui/
│   └── support-kb/
├── apps/
│   └── web/
└── tests/
    └── e2e/
        └── critical/

Ejecuta pnpm install y confirma que no hay errores.

TAREA 2 — PACKAGE packages/database
Crea:
├── package.json (con @prisma/client, prisma, scripts db:*)
├── tsconfig.json (extiende de tsconfig.base.json raíz)
├── src/
│   ├── index.ts (exports)
│   └── client.ts (prisma global + createTenantClient completo)
├── prisma/
│   ├── schema.prisma (COMPLETO — ver docs/plan.md sección 6.1)
│   └── seed.ts (seed de los 4 planes — ver plan.md sección 5 Fase 4
                 para referencia)

El schema.prisma debe contener TODAS las 35 tablas listadas en
docs/plan.md sección 6.1 sin omisiones. Cópialas textualmente del
plan.md aplicando las reglas fundacionales del stack.

Al terminar, ejecuta:
  pnpm --filter=@enbandeja/database prisma format
  pnpm --filter=@enbandeja/database prisma validate

Reporta el resultado. Si hay errores, DETENTE y avísame.

TAREA 3 — PACKAGE packages/shared
Crea:
├── package.json (con zod, date-fns, date-fns-tz)
├── tsconfig.json
└── src/
    ├── index.ts
    ├── types/index.ts (tipos compartidos: TenantId, UserId, CodigoCasino)
    ├── validators/
    │   ├── index.ts
    │   ├── tenant.ts
    │   ├── colegio.ts
    │   ├── menu.ts
    │   ├── pedido.ts (con el refine de la invariante contable)
    │   └── billing.ts
    └── constants/index.ts (PLAN_LIMITS, timezones, etc.)

TAREA 4 — PACKAGE packages/ui
Crea:
├── package.json (con react, lucide-react ^0.263.1, @radix-ui/*)
├── tsconfig.json
└── src/
    ├── index.ts
    ├── lib/
    │   └── design-system.ts (patrón MedXRay — ver docs/agentes/design-system.md)
    └── components/
        ├── Button.tsx
        ├── Card.tsx
        ├── Input.tsx
        ├── Badge.tsx
        └── index.ts

lucide-react SOLO en este package. apps/web lo consume re-exportado.

TAREA 5 — PACKAGE packages/support-kb
Crea la estructura vacía (archivos se llenan en Fase 5):
├── README.md (explica el propósito)
├── package.json (sin dependencias, solo archivos .md)
├── index.md (placeholder)
└── (carpetas vacías: onboarding/, operacion/, apoderados/, billing/,
    problemas-comunes/)

TAREA 6 — APP apps/web
Crea:
├── package.json (con next@15.0.0, next-auth@^5.0.0-beta.19,
                   @auth/prisma-adapter@^2.4.1, tailwindcss@^3.4.0)
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts (importa tokens del design-system)
├── postcss.config.js
├── .env.local (copia del .env.example raíz)
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx (redirect a /home si auth, /login si no)
    │   ├── globals.css
    │   ├── (auth)/
    │   │   └── login/page.tsx
    │   ├── (apoderado)/
    │   │   └── home/page.tsx (placeholder)
    │   └── api/
    │       └── auth/
    │           └── [...nextauth]/route.ts
    ├── lib/
    │   ├── auth.ts (NextAuth v5 config con strategy:database)
    │   └── middleware/
    │       └── withAuth.ts
    └── components/
        └── (placeholder)

TAREA 7 — TESTS E2E CRÍTICOS (estructura inicial)
Crea:
├── tests/e2e/critical/
│   ├── tenant-isolation.spec.ts (con test que valida RLS básico)
│   ├── role-permissions.spec.ts (placeholder)
│   └── [los demás como placeholders con test.skip por ahora]
├── playwright.config.ts (en la raíz del monorepo)

TAREA 8 — CI/CD GitHub Actions
Crea:
├── .github/
│   └── workflows/
│       ├── ci.yml (lint → type-check → unit → E2E critical)
│       └── deploy.yml (deploy a Vercel en push a main)

TAREA 9 — APLICAR MIGRATION INICIAL EN SUPABASE
Ejecuta:
  pnpm --filter=@enbandeja/database prisma migrate dev --name init

Esto aplicará el schema.prisma a Supabase. Avísame si falla.

Luego, ejecuta el archivo de migration manual SQL de docs/plan.md
sección 6.3 (CHECK constraints, RLS policies, REVOKE). Crea un
archivo manual en prisma/migrations/[timestamp]_constraints_rls/
migration.sql con el contenido de esa sección y ejecútalo con
prisma migrate deploy.

Ejecuta el seed:
  pnpm --filter=@enbandeja/database prisma db seed

TAREA 10 — VERIFICACIÓN FINAL
Ejecuta en este orden:
  pnpm install
  pnpm --filter=@enbandeja/database prisma generate
  pnpm type-check
  pnpm lint
  pnpm build

TODAS deben pasar con 0 errores. Si alguna falla, DETENTE y avísame
con el error exacto.

══ REGLAS DE ENTREGA ══
- ARCHIVOS COMPLETOS — NUNCA "// ... existing code" o "// resto aquí"
- Lee el archivo existente ANTES de modificarlo
- TypeScript estricto — 0 any, 0 as any
- ESLint debe pasar
- Comentarios en español
- Si algo no está claro, DETENTE y pregunta antes de asumir

══ VERIFICACIÓN FINAL OBLIGATORIA ══
Antes de dar por terminada la Fase 0, verifica manualmente:

[ ] Todos los IDs tienen @default(uuid()) @db.Uuid
[ ] Todas las relaciones Prisma están en PascalCase
[ ] Ningún package importa next/server
[ ] lucide-react está SOLO en packages/ui
[ ] createTenantClient inyecta tenantId Y userId con set_config
[ ] postinstall en package.json raíz existe y es correcto
[ ] datasource usa env("DATABASE_DIRECT_URL") (nombre exacto)
[ ] NextAuth config tiene strategy: "database"
[ ] Schema.prisma tiene las 35 tablas del plan.md
[ ] RLS policies aplicadas usan current_setting, NUNCA auth.uid()
[ ] CHECK constraints aplicados (pedido_total_invariant,
    pedido_item_xor_referencia)
[ ] REVOKE UPDATE/DELETE aplicado en tablas inmutables
[ ] Seed de 4 planes ejecutado exitosamente
[ ] pnpm build completa en 2-3 minutos sin errores

Al completar Fase 0, actualiza ledger.md con:
- Fecha de completitud
- Resumen de lo hecho
- Estado: "Fase 0 COMPLETADA. Siguiente: Fase 1 — Flujo del Apoderado"
- Bloqueos: (ninguno, o listar si hay)

═══════════════════════════════════════════════════════════════════
```

---

## NOTAS DE USO

### Cuándo NO usar este prompt

- Cuando ya estás en Fase 1, 2, 3, etc. — este prompt es solo para
  el arranque inicial
- Cuando solo quieres modificar un archivo específico — para eso usa
  una sesión normal con `ledger.md` actualizado
- Cuando estás debugging — el prompt asume que arrancas de cero

### Qué hacer si Fase 0 falla a mitad de camino

Si durante la ejecución del prompt Claude Code falla o reporta un
error que no puede resolver:

1. Detén la sesión
2. Revisa el error contra el `CLAUDE.md` del proyecto y los agentes
   especializados
3. Consulta `docs/plan.md` Parte C sección 12 (las 9 lecciones
   heredadas) para ver si es uno de los errores conocidos
4. Si es un error nuevo, documéntalo en el `ledger.md` como bloqueo
5. Resuélvelo manualmente o pide ayuda
6. Vuelve a ejecutar el Master Prompt desde el principio (es
   idempotente — no rompe nada existente)

### Qué hacer al completar Fase 0

1. Verificar que el `ledger.md` quedó actualizado con "Fase 0
   COMPLETADA"
2. Hacer `git commit -m "feat: completa Fase 0 - cimientos del monorepo"`
3. Hacer `git push` al repo de GitHub
4. Verificar que el deploy de Vercel pasa exitosamente
5. Tomarse un café — Fase 0 es la fase más densa del proyecto
6. Iniciar Fase 1 con una sesión nueva de Claude Code (ya no usa
   este Master Prompt, usa el read order normal del proyecto)

---

*Master Prompt Fase 0 — Enbandeja*
*Christian Wevar — Antofagasta, Chile*
*Última revisión: cierre de la documentación fundacional*