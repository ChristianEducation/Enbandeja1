# ENBANDEJA — Resources

> Referencias externas del stack del proyecto. Claude Code consulta
> este archivo cuando necesita documentación oficial actualizada de
> alguna tecnología o servicio externo.
>
> **Regla de uso:** preferir siempre la documentación oficial sobre
> blogs o tutoriales. Si una versión específica del stack tiene su
> propia sección de docs, usar esa (no la versión "latest").

---

## 1. Stack core

### Turborepo
- Documentación oficial: https://turborepo.com/docs
- Guías de monorepo: https://turborepo.com/docs/guides
- Versión usada en Enbandeja: `^2.0.0`

### pnpm
- Documentación oficial: https://pnpm.io
- Workspaces: https://pnpm.io/workspaces
- Versión usada en Enbandeja: **9.15.0**

### Node.js
- Sitio oficial: https://nodejs.org
- Versión usada en Enbandeja: **24.14.1** (mínimo 24.0.0)

### TypeScript
- Documentación oficial: https://www.typescriptlang.org/docs
- Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Versión usada en Enbandeja: `^5.4.0`

---

## 2. Frontend y framework

### Next.js 15
- Documentación oficial: https://nextjs.org/docs
- App Router (lo que usa Enbandeja):
  https://nextjs.org/docs/app
- Server Components:
  https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Server Actions:
  https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Route Handlers (API routes en App Router):
  https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Versión usada en Enbandeja: **15.0.0**

### React
- Documentación oficial: https://react.dev
- Hooks reference: https://react.dev/reference/react

### Tailwind CSS
- Documentación oficial: https://tailwindcss.com/docs
- Configuration: https://tailwindcss.com/docs/configuration
- Plugin con Next.js: https://tailwindcss.com/docs/installation/framework-guides/nextjs
- Versión usada en Enbandeja: `^3.4.0`

### React Query (TanStack Query)
- Documentación oficial: https://tanstack.com/query/latest/docs/framework/react/overview
- Server-Side Rendering: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
- Versión usada en Enbandeja: `^5.40.0`

### Recharts
- Documentación oficial: https://recharts.org
- Ejemplos: https://recharts.org/en-US/examples
- Versión usada en Enbandeja: `^2.12.0`

### Lucide React
- Documentación oficial: https://lucide.dev
- Iconos disponibles: https://lucide.dev/icons
- Guía React: https://lucide.dev/guide/packages/lucide-react
- **Versión usada en Enbandeja: `^0.263.1` (SOLO en `packages/ui`)**

---

## 3. Base de datos y ORM

### Prisma
- Documentación oficial: https://www.prisma.io/docs
- Schema reference: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
- Migrations:
  https://www.prisma.io/docs/orm/prisma-migrate
- Prisma Client: https://www.prisma.io/docs/orm/prisma-client
- Connection pooling con Supabase:
  https://www.prisma.io/docs/orm/overview/databases/supabase
- Versión usada en Enbandeja: `^5.14.0`

### Supabase
- Documentación oficial: https://supabase.com/docs
- Database (Postgres 15): https://supabase.com/docs/guides/database
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Storage: https://supabase.com/docs/guides/storage
- Realtime: https://supabase.com/docs/guides/realtime
- Connection strings: https://supabase.com/docs/guides/database/connecting-to-postgres
- Versión de Postgres usada en Enbandeja: **PostgreSQL 15**

### PostgreSQL
- Documentación oficial 15: https://www.postgresql.org/docs/15/index.html
- CHECK constraints: https://www.postgresql.org/docs/15/ddl-constraints.html
- Row Security Policies: https://www.postgresql.org/docs/15/ddl-rowsecurity.html
- Funciones PL/pgSQL: https://www.postgresql.org/docs/15/plpgsql.html

---

## 4. Autenticación

### NextAuth v5 (Auth.js)
- Documentación oficial: https://authjs.dev
- Database adapters: https://authjs.dev/getting-started/database
- Prisma adapter: https://authjs.dev/getting-started/adapters/prisma
- Providers: https://authjs.dev/getting-started/authentication
- Session management: https://authjs.dev/concepts/session-strategies
- Versión usada en Enbandeja: **`^5.0.0-beta.19`** con
  `strategy: "database"`

### Google OAuth
- Cloud Console: https://console.cloud.google.com
- Setup OAuth: https://developers.google.com/identity/protocols/oauth2

### Apple Sign in
- Apple Developer: https://developer.apple.com/sign-in-with-apple
- Configuración: https://developer.apple.com/documentation/sign_in_with_apple

---

## 5. Pasarelas de pago (Chile/LATAM)

### Transbank Webpay (Chile)
- Documentación oficial: https://www.transbankdevelopers.cl
- Webpay Plus REST: https://www.transbankdevelopers.cl/documentacion/webpay-plus
- SDK Node: https://www.transbankdevelopers.cl/referencia/webpay#sdk-node
- Webpay OneClick (para v2 billing recurrente):
  https://www.transbankdevelopers.cl/documentacion/oneclick
- Ambiente integración (sandbox):
  https://www.transbankdevelopers.cl/documentacion/como_empezar
- Paquete: `transbank-sdk` `^5.0.0`

### MercadoPago
- Documentación oficial: https://www.mercadopago.cl/developers/es/docs
- Checkout Pro: https://www.mercadopago.cl/developers/es/docs/checkout-pro
- Webhooks: https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
- Suscripciones (para v2 billing):
  https://www.mercadopago.cl/developers/es/docs/subscriptions
- SDK Node: https://github.com/mercadopago/sdk-nodejs
- Paquete: `mercadopago` `^2.0.0`

---

## 6. Email transaccional

### Resend
- Documentación oficial: https://resend.com/docs
- React Email (para templates):
  https://react.email
- Send API: https://resend.com/docs/send-with-nextjs
- Versión usada en Enbandeja: `^4.0.0`

---

## 7. Background jobs

### Inngest
- Documentación oficial: https://www.inngest.com/docs
- Next.js setup: https://www.inngest.com/docs/getting-started/nextjs-quick-start
- Functions: https://www.inngest.com/docs/functions
- Step functions: https://www.inngest.com/docs/learn/inngest-steps
- Versión usada en Enbandeja: `^3.22.0`

---

## 8. IA para soporte

### Anthropic (Claude API)
- Documentación oficial: https://docs.claude.com
- Messages API:
  https://docs.claude.com/en/api/messages
- SDK TypeScript:
  https://docs.claude.com/en/api/client-sdks
- Modelo recomendado para el bot de soporte:
  Claude Sonnet 4.6 (`claude-sonnet-4-6`)
- Prompting guide:
  https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview
- Paquete: `@anthropic-ai/sdk` `^0.27.0`

---

## 9. WhatsApp Business

### Meta WhatsApp Cloud API
- Documentación oficial: https://developers.facebook.com/docs/whatsapp/cloud-api
- Webhooks setup: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks
- Templates de mensaje: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
- Phone number setup: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started

---

## 10. Generación de archivos

### React PDF
- Documentación oficial: https://react-pdf.org
- Components: https://react-pdf.org/components
- Styling: https://react-pdf.org/styling
- Versión usada en Enbandeja: `^3.4.0`

### xlsx-js-style
- Documentación: https://github.com/gitbrent/xlsx-js-style
- Estilos: https://github.com/gitbrent/xlsx-js-style#cell-styles
- Versión usada en Enbandeja: `^1.2.0`

---

## 11. Validación y formularios

### Zod
- Documentación oficial: https://zod.dev
- API reference: https://zod.dev/?id=basic-usage
- Refinements (para invariantes como `Pedido.total`):
  https://zod.dev/?id=refine
- Versión usada en Enbandeja: `^3.23.0`

---

## 12. Fechas y timezone

### date-fns
- Documentación oficial: https://date-fns.org/docs
- Versión usada en Enbandeja: `^3.0.0`

### date-fns-tz
- Repositorio: https://github.com/marnusw/date-fns-tz
- `toZonedTime`, `fromZonedTime`: usados en Enbandeja para
  convertir entre UTC y timezone del tenant
- Versión usada en Enbandeja: `^3.0.0`

### IANA Time Zone Database
- Lista de timezones válidos: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
- Default de Enbandeja: `America/Santiago`

---

## 13. Testing

### Playwright
- Documentación oficial: https://playwright.dev
- Test runner: https://playwright.dev/docs/intro
- Locators: https://playwright.dev/docs/locators
- Best practices: https://playwright.dev/docs/best-practices
- Versión usada en Enbandeja: `^1.44.0`

### Vitest
- Documentación oficial: https://vitest.dev
- Configuration: https://vitest.dev/config
- Versión usada en Enbandeja: `^1.6.0`

---

## 14. Monitoreo y observabilidad

### Sentry
- Documentación oficial: https://docs.sentry.io
- Next.js setup: https://docs.sentry.io/platforms/javascript/guides/nextjs
- Versión usada en Enbandeja: `^8.0.0`

---

## 15. Despliegue

### Vercel
- Documentación oficial: https://vercel.com/docs
- Deployments: https://vercel.com/docs/deployments
- Environment Variables: https://vercel.com/docs/projects/environment-variables
- Cron Jobs: https://vercel.com/docs/cron-jobs
- Configuración crítica para Enbandeja: ver `CLAUDE.md` del proyecto
  sección "Mandamiento 5"

---

## 16. Servicios chilenos relevantes

### Servicio de Impuestos Internos (SII)
- Sitio oficial: https://www.sii.cl
- Documentación API DTE: https://www.sii.cl/factura_electronica
- (Solo para v2: facturación electrónica del tenant)

### MINEDUC
- Establecimientos educacionales: https://datosabiertos.mineduc.cl
- (Solo para research de mercado)

---

## 17. Referencias internas del proyecto

| Documento | Ubicación | Propósito |
|---|---|---|
| Plan Maestro | `docs/plan.md` | Visión, arquitectura, fases, schema |
| CLAUDE.md proyecto | `CLAUDE.md` | Reglas técnicas innegociables |
| Ledger | `ledger.md` | Estado vivo del proyecto |
| Handoff v01 | `docs/handoff-v01.md` | Snapshot fundacional |
| Master Prompt Fase 0 | `docs/master-prompt-fase0.md` | Disparador de Fase 0 (próximo a generar) |
| Agente Database | `docs/agentes/database.md` | Schema, RLS, migrations (próximo) |
| Agente Backend | `docs/agentes/backend.md` | API, webhooks, cron (próximo) |
| Agente Frontend | `docs/agentes/frontend.md` | React, Next.js (próximo) |
| Agente Design System | `docs/agentes/design-system.md` | Tokens visuales (próximo) |

---

## 18. Referencias internas del workspace `lab/`

| Documento | Ubicación | Propósito |
|---|---|---|
| CLAUDE.md raíz | `lab/CLAUDE.md` | Instrucciones globales del workspace |
| Vault — bloques | `lab/notes/vault/projects/enbandeja/bloques/` | 5 bloques de decisiones funcionales (insumo histórico) |
| Vault — research | `lab/notes/vault/projects/enbandeja/research/` | Investigación externa |
| Vault — tasks | `lab/notes/vault/tasks.md` | Backlog global cruzado |
| Vault — goals | `lab/notes/vault/goals.md` | Objetivos de negocio |

---

*Resources del proyecto Enbandeja — versión 1.0*
*Actualizar este archivo cuando se incorpore una herramienta nueva al stack
o cuando una URL de documentación oficial cambie.*