# AGENTE DATABASE — Enbandeja

> Agente especializado en `schema.prisma`, RLS policies, migraciones,
> CHECK constraints y queries a Postgres. Claude Code lee este
> archivo **antes** de tocar cualquier cosa relacionada con la base
> de datos.
>
> **Cuándo invocarme:**
> - Modificaciones al `schema.prisma`
> - Creación o edición de RLS policies
> - Migraciones nuevas (Prisma o SQL manual)
> - Queries complejas con `createTenantClient`
> - CHECK constraints, triggers, funciones Postgres
> - Cambios en seeds

---

## 1. PRINCIPIO RECTOR

La base de datos es la **última línea de defensa** del aislamiento
multi-tenant. Si la aplicación falla, RLS protege los datos. Si RLS
falla, los CHECK constraints y los REVOKE protegen la integridad.

**Test mental obligatorio antes de cada query:**

> "Si el `WHERE` de mi query está mal escrito, ¿puede Tenant A ver
> datos de Tenant B?"

Si la respuesta es "sí" o "no estoy seguro", la query DEBE pasar
por `createTenantClient`.

---

## 2. REGLAS INNEGOCIABLES DEL SCHEMA

### Regla 1 — Estructura obligatoria de IDs

```prisma
id String @id @default(uuid()) @db.Uuid
```

Sin excepciones. Sin `cuid()`. Sin omitir `@default(uuid())`. Si un
modelo no tiene esta línea exacta, el schema se considera roto.

### Regla 2 — Relaciones en PascalCase siempre

```prisma
// ✅ CORRECTO
model Pedido {
  apoderadoId String @db.Uuid
  Apoderado   User   @relation(fields: [apoderadoId], references: [id])
  Items       PedidoItem[]
}
```

```prisma
// ❌ PROHIBIDO
model Pedido {
  apoderado User @relation(fields: [apoderadoId], references: [id])
  items     PedidoItem[]
}
```

### Regla 3 — `tenantId` obligatorio en toda tabla de negocio

Todo modelo que represente datos de negocio (no de auth ni de
sistema) debe tener:

```prisma
tenantId String @db.Uuid
Tenant   Tenant @relation(fields: [tenantId], references: [id])

@@index([tenantId])
```

**Excepciones (tablas globales sin `tenantId`):**

- `User` (global a la plataforma, ver Mandamiento Ajuste #1)
- `Account` (NextAuth)
- `Session` (NextAuth, con `activeTenantId` opcional)
- `VerificationToken` (NextAuth)
- `SuperAdmin` (sistema separado)
- `Plan` (catálogo público)
- `PlanLimite` (catálogo público)

### Regla 4 — Soft delete vs inmutable

**Tablas editables** tienen siempre:

```prisma
deletedAt DateTime?
version   Int       @default(1)
createdAt DateTime  @default(now())
updatedAt DateTime  @updatedAt
```

**Tablas inmutables** **NUNCA** tienen `updatedAt`, `deletedAt`, ni
`version`. Solo `createdAt`. Y en producción se les aplica:

```sql
REVOKE UPDATE, DELETE ON "TablaInmutable" FROM PUBLIC;
```

**Lista exacta de tablas inmutables en Enbandeja:**

- `AuditLog`
- `WebhookEventLog`
- `KpiSnapshot`
- `NotificacionLog`
- `CreditoMovimiento`
- `PagoSuscripcion`
- `PedidoItem` (sin `deletedAt` porque es registro histórico de
  negocio, pero sí tiene `updatedAt` para campos como `retiradoAt`,
  `canceladoAt`)

### Regla 5 — Enums en lugar de String libre

Cualquier campo con un conjunto cerrado de valores se declara como
enum, no como `String`. Esto da autocompletado, validación en
compile-time y claridad en queries.

```prisma
// ✅ CORRECTO
enum MetodoPago {
  WEBPAY
  WEBPAY_ONECLICK
  MERCADOPAGO
  MERCADOPAGO_SUSCRIPCION
  MANUAL
}

model Pedido {
  metodoPago MetodoPago?
}
```

```prisma
// ❌ PROHIBIDO
model Pedido {
  metodoPago String?  // "WEBPAY", "MERCADOPAGO"
}
```

**Enums declarados en Enbandeja (referencia):** `UserRole`,
`VinculoComensal`, `TenantStatus`, `InvitationStatus`, `EstadoMenu`,
`EstadoOpcionMenu`, `EstadoPedido`, `TipoPedidoItem`, `MetodoPago`,
`TipoSuscripcion`, `EstadoSuscripcion`, `TipoPlan`.

### Regla 6 — `User` es global, no tenant-scoped

`User` no tiene `tenantId`. La pertenencia a uno o más tenants vive
en `UserTenant`. Un mismo `User` puede tener:

- Hijos en 2 tenants distintos como `APODERADO`
- Ser `OWNER` de su PYME y además `APODERADO` en otro colegio

**Implicación:** `User.email` es único a nivel **plataforma global**,
no por tenant.

### Regla 7 — `Session.activeTenantId` para tenant activo

El modelo `Session` de NextAuth está extendido con
`activeTenantId String? @db.Uuid` para soportar el cambio de tenant
sin nuevo login.

```prisma
model Session {
  id             String   @id @default(uuid()) @db.Uuid
  sessionToken   String   @unique
  userId         String   @db.Uuid
  expires        DateTime
  activeTenantId String?  @db.Uuid

  User         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  ActiveTenant Tenant? @relation("SessionActiveTenant", fields: [activeTenantId], references: [id])
}
```

---

## 3. EL `createTenantClient` — PIEZA CRÍTICA

**Esta función es la más importante del sistema.** Vive en
`packages/database/src/client.ts` y debe usarse en **toda** ruta de
negocio.

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Cliente global — SOLO para seed, migraciones y operaciones
// del Super Admin. NUNCA usar en rutas de negocio.
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Cliente con contexto inyectado. OBLIGATORIO en rutas de negocio.
export function createTenantClient(tenantId: string, userId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Inyecta tenantId al contexto de Postgres para RLS.
          // TRUE = scope local de la transacción.
          await prisma.$executeRaw`
            SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)
          `
          // Inyecta userId también. NextAuth strategy:database
          // no emite JWTs de Supabase, así que NUNCA usamos auth.uid().
          await prisma.$executeRaw`
            SELECT set_config('app.current_user_id', ${userId}, TRUE)
          `
          return query(args)
        }
      }
    }
  })
}
```

**Patrón de uso obligatorio en API routes:**

```typescript
// ✅ CORRECTO
export const GET = withAuth(async ({ session, req }) => {
  const db = createTenantClient(session.activeTenantId, session.userId)
  const pedidos = await db.pedido.findMany()
  return NextResponse.json(pedidos)
})
```

```typescript
// ❌ PROHIBIDO
export const GET = withAuth(async ({ session, req }) => {
  const pedidos = await prisma.pedido.findMany({
    where: { tenantId: session.activeTenantId }  // RLS no inyectado
  })
  return NextResponse.json(pedidos)
})
```

---

## 4. RLS POLICIES — REGLAS DE ORO

### Regla 1 — `current_setting`, NUNCA `auth.uid()`

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
-- ❌ PROHIBIDO (NextAuth strategy:database no emite JWTs Supabase)
CREATE POLICY "..." ON "Pedido"
FOR ALL USING ("apoderadoId" = auth.uid());
```

### Regla 2 — Habilitar RLS en cada tabla nueva

Toda tabla de negocio nueva DEBE habilitar RLS:

```sql
ALTER TABLE "NombreTabla" ENABLE ROW LEVEL SECURITY;
```

Sin esto, las policies no se aplican y la tabla queda expuesta.

### Regla 3 — Patrón estándar de policy de aislamiento

```sql
CREATE POLICY "nombre_descriptivo_aislamiento" ON "NombreTabla"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);
```

### Regla 4 — Policies de propiedad por usuario

Cuando una tabla tiene tanto `tenantId` como un campo de propiedad
por usuario (ej: `apoderadoId`), se crean DOS policies:

```sql
-- Policy general de aislamiento por tenant
CREATE POLICY "tabla_aislamiento" ON "Pedido"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- Policy específica de propiedad del apoderado
CREATE POLICY "tabla_apoderado_propio" ON "Pedido"
FOR SELECT USING (
  "apoderadoId" = current_setting('app.current_user_id')::uuid
  AND "tenantId" = current_setting('app.current_tenant_id')::uuid
);
```

### Regla 5 — Tablas globales con lectura pública

`Plan` y `PlanLimite` son catálogo público — todos los usuarios
autenticados pueden leerlos:

```sql
CREATE POLICY "plan_lectura_publica" ON "Plan"
FOR SELECT USING (true);

CREATE POLICY "plan_limite_lectura_publica" ON "PlanLimite"
FOR SELECT USING (true);
```

---

## 5. CHECK CONSTRAINTS APLICADOS

Estos constraints están en
`packages/database/prisma/migrations/01_constraints_rls/migration.sql`
y son **bloqueantes** — sin ellos el schema no está completo.

### Constraint 1 — Invariante contable del Pedido

```sql
ALTER TABLE "Pedido"
ADD CONSTRAINT "pedido_total_invariant"
CHECK ("total" = "creditoAplicado" + "totalPagado");
```

**Razón:** garantiza a nivel DB que `total = creditoAplicado +
totalPagado`. Aunque el código backend recalcule esto, el constraint
es la última red de seguridad.

### Constraint 2 — Polimorfismo XOR en PedidoItem

```sql
ALTER TABLE "PedidoItem"
ADD CONSTRAINT "pedido_item_xor_referencia"
CHECK (
  ("opcionMenuId" IS NOT NULL AND "productoKioscoId" IS NULL)
  OR
  ("opcionMenuId" IS NULL AND "productoKioscoId" IS NOT NULL)
);
```

**Razón:** un `PedidoItem` es un almuerzo (`opcionMenuId`) o un
producto del kiosco (`productoKioscoId`). Exactamente uno, nunca
ambos, nunca ninguno.

### Constraint 3 — Crédito nunca negativo

```sql
ALTER TABLE "CreditoApoderado"
ADD CONSTRAINT "credito_apoderado_no_negativo"
CHECK ("monto" >= 0);
```

### Constraint 4 — Precio de opción nunca negativo

```sql
ALTER TABLE "PrecioOpcion"
ADD CONSTRAINT "precio_opcion_no_negativo"
CHECK ("precio" >= 0);
```

**Nota:** `precio = 0` SÍ es válido (becados). Solo se prohíbe
`precio < 0`.

---

## 6. FUNCIONES POSTGRES AUXILIARES

### Función 1 — `check_tenant_activo()`

Defense-in-depth para suspensiones. Se llama desde el middleware
`verificarSuscripcion` del backend.

```sql
CREATE OR REPLACE FUNCTION check_tenant_activo()
RETURNS void AS $$
DECLARE
  estado_tenant text;
BEGIN
  SELECT s."estado" INTO estado_tenant
  FROM "Suscripcion" s
  WHERE s."tenantId" = current_setting('app.current_tenant_id')::uuid;

  IF estado_tenant IS NULL THEN
    RAISE EXCEPTION 'sin_suscripcion: tenant sin suscripción registrada';
  END IF;

  IF estado_tenant IN ('SUSPENDIDA', 'CANCELADA', 'ARCHIVADA') THEN
    RAISE EXCEPTION 'tenant_suspendido: %', estado_tenant;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Trigger — Unicidad de `CategoriaPrecio.esDefault`

Garantiza que solo exista una `CategoriaPrecio` con `esDefault=true`
por colegio. Al marcar una como default, desmarca las demás.

```sql
CREATE OR REPLACE FUNCTION unicidad_categoria_default()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."esDefault" = true THEN
    UPDATE "CategoriaPrecio"
    SET "esDefault" = false
    WHERE "colegioId" = NEW."colegioId"
      AND "id" <> NEW."id"
      AND "esDefault" = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_unicidad_categoria_default
BEFORE INSERT OR UPDATE OF "esDefault" ON "CategoriaPrecio"
FOR EACH ROW
EXECUTE FUNCTION unicidad_categoria_default();
```

---

## 7. REVOKE DE TABLAS INMUTABLES

```sql
REVOKE UPDATE, DELETE ON "CreditoMovimiento" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "WebhookEventLog" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "NotificacionLog" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "KpiSnapshot" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "PagoSuscripcion" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "AuditLog" FROM PUBLIC;

-- Suscripcion: DELETE bloqueado, UPDATE permitido (cambia estado)
REVOKE DELETE ON "Suscripcion" FROM PUBLIC;
```

---

## 8. PATRONES DE QUERY OBLIGATORIOS

### Patrón 1 — Resolver precio de opción para un comensal

```typescript
export async function getPrecioParaComensal(
  db: TenantClient,
  opcionMenuId: string,
  comensalId: string
): Promise<number> {
  const comensal = await db.comensal.findUniqueOrThrow({
    where: { id: comensalId }
  })

  // Fallback a categoría default del colegio si el comensal no tiene
  const categoriaPrecioId = comensal.categoriaPrecioId
    ?? (await db.categoriaPrecio.findFirstOrThrow({
        where: {
          colegioId: comensal.colegioId,
          esDefault: true,
          isActive: true,
          deletedAt: null
        }
      })).id

  const precioOpcion = await db.precioOpcion.findUniqueOrThrow({
    where: {
      opcionMenuId_categoriaPrecioId: { opcionMenuId, categoriaPrecioId }
    }
  })

  return precioOpcion.precio
}
```

### Patrón 2 — Crear pedido con transacción atómica

```typescript
const pedido = await db.$transaction(async (tx) => {
  // 1. Crear el pedido
  const p = await tx.pedido.create({
    data: { /* ... */ }
  })

  // 2. Crear los items con snapshot de precio
  for (const itemData of items) {
    await tx.pedidoItem.create({
      data: {
        pedidoId: p.id,
        nombre: itemData.nombre,    // snapshot
        precio: itemData.precio,    // snapshot
        subtotal: itemData.subtotal, // snapshot
        // ...
      }
    })
  }

  // 3. Decrementar stock (en webhook normalmente, pero ejemplo)
  // 4. Generar movimientos de crédito si aplica
  return p
})
```

### Patrón 3 — Webhook idempotente con WebhookEventLog

```typescript
// Verificar si ya fue procesado
const yaExiste = await prisma.webhookEventLog.findUnique({
  where: { orderId: payload.orderId }
})

if (yaExiste?.processed) {
  return new Response('OK', { status: 200 })  // idempotente
}

// Insertar registro y procesar en transacción
await prisma.$transaction(async (tx) => {
  await tx.webhookEventLog.upsert({
    where: { orderId: payload.orderId },
    create: { /* ... */ processed: false },
    update: {}
  })

  // Procesar el pago
  await procesarPago(tx, payload)

  // Marcar como procesado
  await tx.webhookEventLog.update({
    where: { orderId: payload.orderId },
    data: { processed: true, processedAt: new Date() }
  })
})
```

---

## 9. CONEXIÓN A SUPABASE — CONFIGURACIÓN REAL INNEGOCIABLE

### Variables de entorno (Mandamiento 6)

```
# Transaction Pooler — puerto 6543 — para la app (runtime queries)
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session Pooler — puerto 5432 — para migraciones (schema engine)
DATABASE_DIRECT_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

**Reglas innegociables de conexión:**

- La variable de conexión directa se llama **EXACTAMENTE**
  `DATABASE_DIRECT_URL` (no `DIRECT_URL`, no `DATABASE_DIRECT`).
- `DATABASE_URL` usa **puerto 6543** con `?pgbouncer=true` (Transaction
  Pooler de Supabase).
- `DATABASE_DIRECT_URL` usa **puerto 5432** (Session Pooler de Supabase,
  necesario para `prisma migrate` y `prisma db push`).
- El host regional es `aws-1-sa-east-1.pooler.supabase.com` — verificar
  en el dashboard de Supabase si cambia al crear un proyecto nuevo.
- `schema.prisma` siempre tiene ambas líneas:
  ```prisma
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DATABASE_DIRECT_URL")
  }
  ```

### Ubicación de las credenciales

| Archivo | Propósito | ¿Se commitea? |
|---|---|---|
| `apps/web/.env.local` | Runtime de Next.js (dev local) | **NO** |
| `packages/database/.env` | Prisma CLI (migrate, push, seed) | **NO** |
| `.env.example` | Template con placeholders | Sí |
| Vercel Environment Variables | Runtime en producción | N/A |

Ambos `.env` deben tener los **mismos valores** para `DATABASE_URL` y
`DATABASE_DIRECT_URL`. Si se cambia uno, se cambia el otro.

### Migraciones

#### Orden de aplicación (Fase 0 completada)

1. `npx prisma db push` → sincroniza schema con Supabase
2. Ejecutar SQL manual vía Prisma `$executeRawUnsafe` o Supabase SQL
   Editor: CHECK constraints → funciones → triggers → RLS ENABLE →
   RLS policies → REVOKE
3. `npx prisma db seed` → seed de los 4 planes

#### Reglas para migraciones nuevas

- **Nunca** editar migraciones ya aplicadas en producción
- **Nunca** usar `prisma db push` en producción (solo en dev)
- Toda migración SQL manual va en
  `packages/database/prisma/migrations/[timestamp]_[descripcion]/migration.sql`
- Antes de cualquier migración, hacer dump de Supabase
- Después de migrar, ejecutar tests E2E críticos

---

## 10. CHECKLIST ANTES DE TOCAR EL SCHEMA

- [ ] ¿La tabla nueva tiene `tenantId` (si es de negocio)?
- [ ] ¿Tiene `@@index([tenantId])`?
- [ ] ¿Los IDs son `String @id @default(uuid()) @db.Uuid`?
- [ ] ¿Las relaciones están en PascalCase?
- [ ] ¿Los enums están declarados en lugar de String libre?
- [ ] ¿Soft delete (`deletedAt`, `version`, `updatedAt`) o inmutable
  (sin esos campos)?
- [ ] ¿Hay RLS policy que use `current_setting`?
- [ ] ¿RLS está habilitado con `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`?
- [ ] ¿Si es inmutable, hay `REVOKE UPDATE, DELETE`?
- [ ] ¿Hay CHECK constraint si hay invariantes?
- [ ] ¿El test E2E de tenant-isolation cubre la tabla nueva?
- [ ] ¿`prisma format` y `prisma validate` pasan?

---

## 11. SEÑALES DE ALERTA INMEDIATAS

Si Claude Code detecta cualquiera de estas situaciones, **detiene
toda ejecución y reporta**:

- Una policy RLS con `auth.uid()` → reemplazar por `current_setting`
- Un modelo Prisma sin `@default(uuid())` en el ID
- Una relación Prisma en camelCase
- Un campo enum-cerrado declarado como `String`
- Un `prisma.tabla.findMany()` sin filtro de `tenantId` en una ruta
  de negocio
- Un `INSERT` directo a `WebhookEventLog`, `KpiSnapshot`,
  `NotificacionLog`, `PagoSuscripcion`, `AuditLog` o
  `CreditoMovimiento` que NO sea idempotente
- Una migración `ALTER TABLE` que elimine o renombre una columna sin
  estrategia de migración de datos previa

---

*Agente Database de Enbandeja — versión 1.0*
*Lectura obligatoria antes de tocar `schema.prisma` o RLS*