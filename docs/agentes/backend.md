# AGENTE BACKEND — Enbandeja

> Agente especializado en API routes, webhooks, cron jobs, jobs de
> Inngest, lógica de negocio y middlewares. Claude Code lee este
> archivo **antes** de tocar cualquier endpoint o lógica de servidor.
>
> **Cuándo invocarme:**
> - Crear o modificar API routes en `apps/web/src/app/api/`
> - Implementar webhooks de Webpay o MercadoPago
> - Configurar cron jobs (Vercel Cron + endpoints)
> - Crear jobs de Inngest para procesamiento async
> - Implementar middlewares (`withAuth`, `verificarSuscripcion`, etc.)
> - Lógica de creación de pedidos, cancelación, billing

---

## 1. PRINCIPIOS RECTORES

### Principio 1 — La capa de aplicación NUNCA confía en el frontend

Toda validación crítica se hace en el backend, aunque el frontend ya
la haya hecho. Especialmente:

- Cálculo de totales (`Pedido.total = creditoAplicado + totalPagado`)
- Resolución de precio para un comensal (usar
  `getPrecioParaComensal`, nunca aceptar precio del frontend)
- Verificación de hora de corte
- Verificación de stock
- Permisos por rol y por colegio

### Principio 2 — Toda operación de negocio pasa por `withAuth`

`withAuth` es el middleware que extrae sesión, valida que existe
`activeTenantId`, y crea el `createTenantClient`. Si una API route
no usa `withAuth`, es porque es endpoint público (login, registro,
webhook externo) y debe documentarse explícitamente.

### Principio 3 — Las mutaciones críticas son transaccionales

Cualquier mutación que toque más de una tabla relacionada debe usar
`db.$transaction()`. Si una parte falla, todo se revierte.

---

## 2. PATRÓN OBLIGATORIO DE API ROUTE DE NEGOCIO

```typescript
// apps/web/src/app/api/pedidos/crear/route.ts

import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/withAuth'
import { createTenantClient } from '@enbandeja/database'
import { CrearPedidoSchema } from '@enbandeja/shared/validators'
import { verificarSuscripcion } from '@/lib/middleware/verificarSuscripcion'

export const POST = withAuth(async ({ session, req }) => {
  // 1. Verificar suscripción del tenant
  await verificarSuscripcion(session.activeTenantId)

  // 2. Crear cliente con contexto inyectado
  const db = createTenantClient(session.activeTenantId, session.userId)

  // 3. Validar payload con Zod
  const body = await req.json()
  const parsed = CrearPedidoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: parsed.error.format() },
      { status: 400 }
    )
  }

  // 4. Validaciones de negocio
  const comensales = await db.comensal.findMany({
    where: {
      id: { in: parsed.data.comensalIds },
      apoderadoId: session.userId
    }
  })
  if (comensales.length !== parsed.data.comensalIds.length) {
    return NextResponse.json(
      { error: 'Comensal no autorizado' },
      { status: 403 }
    )
  }

  // 5. Recalcular totales en el backend (NUNCA confiar en frontend)
  const total = await calcularTotal(db, parsed.data)
  const creditoAplicado = await aplicarCredito(db, total, session.userId)
  const totalPagado = total - creditoAplicado

  // 6. Caso especial monto $0 (becados o crédito cubre todo)
  if (totalPagado === 0) {
    return await crearPedidoMontoZero(db, parsed.data, total, creditoAplicado)
  }

  // 7. Caso normal: crear en PENDIENTE_PAGO + iniciar pasarela
  const pedido = await db.pedido.create({
    data: {
      tenantId: session.activeTenantId,
      apoderadoId: session.userId,
      orderId: generarOrderId(),
      total,
      creditoAplicado,
      totalPagado,
      estado: 'PENDIENTE_PAGO',
      // ...
    }
  })

  const urlPasarela = await iniciarSesionWebpay(pedido)

  return NextResponse.json({
    pedido,
    urlPasarela,
    requierePago: true
  })
})
```

---

## 3. MIDDLEWARES OBLIGATORIOS

### Middleware 1 — `withAuth`

```typescript
// apps/web/src/lib/middleware/withAuth.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

type Handler = (ctx: {
  session: {
    userId: string
    activeTenantId: string
    role: string
  }
  req: NextRequest
}) => Promise<Response>

export function withAuth(handler: Handler) {
  return async (req: NextRequest) => {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (!session.activeTenantId) {
      return NextResponse.json(
        { error: 'Sin tenant activo. Selecciona un tenant primero.' },
        { status: 400 }
      )
    }

    return handler({
      session: {
        userId: session.user.id,
        activeTenantId: session.activeTenantId,
        role: session.role
      },
      req
    })
  }
}
```

### Middleware 2 — `verificarSuscripcion`

```typescript
// apps/web/src/lib/middleware/verificarSuscripcion.ts

import { prisma } from '@enbandeja/database'

export async function verificarSuscripcion(tenantId: string): Promise<void> {
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId }
  })

  if (!suscripcion) {
    throw new SuscripcionError('SIN_SUSCRIPCION')
  }

  const estadosBloqueados = ['SUSPENDIDA', 'CANCELADA', 'ARCHIVADA']
  if (estadosBloqueados.includes(suscripcion.estado)) {
    throw new SuscripcionSuspendidaError(suscripcion.estado)
  }

  // PERIODO_GRACIA permite operar pero la UI muestra banner.
}
```

### Middleware 3 — `verificarLimiteColegio`

```typescript
import type { TenantClient } from '@enbandeja/database'

export async function verificarLimiteColegio(
  db: TenantClient,
  tenantId: string
): Promise<void> {
  const suscripcion = await db.suscripcion.findUnique({
    where: { tenantId },
    include: { Plan: { include: { Limites: true } } }
  })

  const limite = suscripcion.Plan.Limites.find(
    l => l.metrica === 'MAX_COLEGIOS'
  )

  if (limite?.valor !== null && limite?.valor !== undefined) {
    const colegiosActivos = await db.colegio.count({
      where: { tenantId, isActive: true, deletedAt: null }
    })
    if (colegiosActivos >= limite.valor) {
      throw new LimitePlanError(
        `Plan ${suscripcion.Plan.nombre} permite máximo ` +
        `${limite.valor} colegio(s). Actualiza tu plan para agregar más.`
      )
    }
  }
}
```

---

## 4. WEBHOOKS DE PAGO — REGLAS DE ORO

### Regla 1 — Verificar firma HMAC ANTES de procesar

```typescript
// apps/web/src/app/api/payment/webhook/route.ts

import crypto from 'crypto'

export const POST = async (req: Request) => {
  const rawBody = await req.text()
  const signature = req.headers.get('x-webpay-signature')

  // Verificar firma HMAC
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSignature) {
    return new Response('Invalid signature', { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  // ... procesar
}
```

### Regla 2 — Idempotencia con `WebhookEventLog`

```typescript
// Verificar si ya fue procesado
const yaExiste = await prisma.webhookEventLog.findUnique({
  where: { orderId: payload.orderId }
})

if (yaExiste?.processed) {
  return new Response('OK', { status: 200 })  // idempotente — no error
}
```

### Regla 3 — Procesamiento en transacción atómica

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Insertar/actualizar WebhookEventLog
  await tx.webhookEventLog.upsert({
    where: { orderId: payload.orderId },
    create: {
      provider: 'WEBPAY',
      eventType: 'PAYMENT_SUCCESS',
      orderId: payload.orderId,
      payload,
      processed: false,
      tenantId: pedido.tenantId
    },
    update: {}
  })

  // 2. Buscar el pedido
  const pedido = await tx.pedido.findUnique({
    where: { orderId: payload.orderId }
  })
  if (!pedido) {
    throw new Error(`Pedido no encontrado: ${payload.orderId}`)
  }

  // 3. Verificar stock disponible
  for (const item of pedido.items) {
    if (item.opcionMenuId) {
      const opcion = await tx.opcionMenu.findUnique({
        where: { id: item.opcionMenuId }
      })
      if (opcion?.stockMax !== null && opcion.stockActual <= 0) {
        // Stock agotado: revertir el pedido
        await revertirPedidoYGenerarCredito(tx, pedido)
        return
      }
    }
  }

  // 4. Actualizar pedido a PAGADO
  await tx.pedido.update({
    where: { id: pedido.id },
    data: {
      estado: 'PAGADO',
      transactionId: payload.transactionId,
      metodoPago: 'WEBPAY'
    }
  })

  // 5. Decrementar stock
  for (const item of pedido.items) {
    if (item.opcionMenuId) {
      await tx.opcionMenu.update({
        where: { id: item.opcionMenuId },
        data: { stockActual: { decrement: item.cantidad } }
      })
    }
  }

  // 6. Marcar webhook como procesado
  await tx.webhookEventLog.update({
    where: { orderId: payload.orderId },
    data: { processed: true, processedAt: new Date() }
  })
})

// 7. Notificación push (fuera de la transacción)
await enviarPushConfirmacion(pedido)

return new Response('OK', { status: 200 })
```

### Regla 4 — Flujo especial monto $0 NO pasa por webhook

Cuando `totalPagado === 0`, el pedido se crea directamente en
`PAGADO` sin ir a la pasarela. No hay webhook involucrado.

```typescript
async function crearPedidoMontoZero(
  db: TenantClient,
  data: any,
  total: number,
  creditoAplicado: number
) {
  return await db.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        // ... campos normales
        estado: 'PAGADO',
        orderId: `INTERNO-${generarOrderId()}`,
        transactionId: `INTERNO-${Date.now()}`,
        metodoPago: null,
        total,
        creditoAplicado,
        totalPagado: 0
      }
    })

    // Crear items + decrementar stock + generar movimientos crédito
    // Todo dentro de la misma transacción

    return pedido
  })
}
```

---

## 5. CRON JOBS — REGLAS

### Configuración en `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/kpi-snapshot",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/menu-transiciones",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/pedidos-expirados",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/vencimientos-suscripcion",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Patrón obligatorio de endpoint cron

```typescript
// apps/web/src/app/api/cron/kpi-snapshot/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@enbandeja/database'
import { toZonedTime } from 'date-fns-tz'

export const POST = async (req: Request) => {
  // 1. Verificar CRON_SECRET
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Lógica del cron
  const ahoraUtc = new Date()
  const tenants = await prisma.tenant.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { id: true, timezone: true }
  })

  // 3. Filtrar por timezone — itera y procesa solo los que aplican
  const tenantsAProcesar = tenants.filter(t => {
    const horaLocal = toZonedTime(ahoraUtc, t.timezone)
    return horaLocal.getHours() === 23
  })

  const resultados = []
  for (const tenant of tenantsAProcesar) {
    try {
      await generarSnapshotsDelDia(tenant.id, tenant.timezone)
      resultados.push({ tenantId: tenant.id, status: 'ok' })
    } catch (error) {
      console.error(`Error en snapshot tenant ${tenant.id}:`, error)
      resultados.push({ tenantId: tenant.id, status: 'error' })
    }
  }

  return NextResponse.json({
    procesados: tenantsAProcesar.length,
    total: tenants.length,
    resultados
  })
}
```

### Crons obligatorios en Enbandeja

| Cron | Schedule UTC | Propósito |
|---|---|---|
| `/api/cron/kpi-snapshot` | `0 * * * *` (cada hora) | Genera KpiSnapshot del día filtrando por timezone |
| `/api/cron/menu-transiciones` | `0 * * * *` | Transiciona Menu PUBLICADO→CERRADO→ARCHIVADO |
| `/api/cron/pedidos-expirados` | `0 * * * *` | Marca como EXPIRADO pedidos en PENDIENTE_PAGO > 2h |
| `/api/cron/vencimientos-suscripcion` | `0 9 * * *` (9 AM UTC diario) | Transiciona estados de Suscripcion |

### Regla absoluta sobre timezone

**NUNCA hardcodear `America/Santiago` en un cron.** Siempre iterar
por tenants y usar `toZonedTime(ahora, tenant.timezone)`. Esto
garantiza compatibilidad con futuros tenants en otras zonas horarias.

---

## 6. INNGEST — JOBS ASYNC

### Cuándo usar Inngest vs cron

- **Cron:** tareas periódicas que corren en horario fijo
- **Inngest:** tareas disparadas por eventos (export Excel, envío
  masivo de emails, generación de PDFs, retry de notificaciones)

### Patrón de Inngest function

```typescript
// apps/web/src/inngest/functions/exportar-excel-mes.ts

import { inngest } from '@/inngest/client'
import { prisma } from '@enbandeja/database'

export const exportarExcelMes = inngest.createFunction(
  { id: 'exportar-excel-mes' },
  { event: 'reportes/exportar-excel-mes' },
  async ({ event, step }) => {
    const { tenantId, colegioId, mes, anio, userId } = event.data

    // Step 1: obtener datos
    const pedidos = await step.run('obtener-pedidos', async () => {
      return await prisma.pedido.findMany({
        where: {
          tenantId,
          colegioId,
          createdAt: {
            gte: new Date(anio, mes - 1, 1),
            lt: new Date(anio, mes, 1)
          }
        },
        include: { Items: { include: { Comensal: true } } }
      })
    })

    // Step 2: generar Excel
    const excelBuffer = await step.run('generar-excel', async () => {
      return await generarExcelDePedidos(pedidos)
    })

    // Step 3: subir a Supabase Storage
    const { url } = await step.run('subir-storage', async () => {
      return await subirASupabaseStorage(
        excelBuffer,
        `exportaciones/${tenantId}/${anio}-${mes}.xlsx`
      )
    })

    // Step 4: notificar al usuario
    await step.run('notificar-usuario', async () => {
      await crearNotificacion({
        tenantId,
        userId,
        tipo: 'EXPORTACION_LISTA',
        titulo: 'Tu reporte está listo',
        mensaje: `El reporte de ${mes}/${anio} está disponible.`,
        canal: 'PUSH'
      })
    })

    return { url }
  }
)
```

---

## 7. VALIDACIÓN CON ZOD

Toda API route que reciba datos del cliente DEBE validarlos con Zod
antes de tocar la base de datos.

### Patrón de validador con invariante

```typescript
// packages/shared/src/validators/pedido.ts

import { z } from 'zod'

export const CrearPedidoSchema = z.object({
  comensalIds: z.array(z.string().uuid()).min(1),
  items: z.array(z.object({
    comensalId: z.string().uuid(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tipo: z.enum(['ALMUERZO', 'KIOSCO']),
    opcionMenuId: z.string().uuid().optional(),
    productoKioscoId: z.string().uuid().optional(),
    cantidad: z.number().int().positive()
  })),
  total: z.number().int().positive(),
  creditoAplicado: z.number().int().min(0),
  totalPagado: z.number().int().min(0)
}).refine(
  data => data.total === data.creditoAplicado + data.totalPagado,
  { message: 'total debe ser igual a creditoAplicado + totalPagado' }
).refine(
  data => data.items.every(item =>
    (item.tipo === 'ALMUERZO' && !!item.opcionMenuId && !item.productoKioscoId) ||
    (item.tipo === 'KIOSCO' && !!item.productoKioscoId && !item.opcionMenuId)
  ),
  { message: 'tipo debe coincidir con la fk no-nula' }
)
```

---

## 8. MANEJO DE ERRORES

### Errores tipados en `packages/shared/src/errors/`

```typescript
// packages/shared/src/errors/index.ts

export class SuscripcionError extends Error {
  constructor(public code: string) {
    super(`SuscripcionError: ${code}`)
  }
}

export class SuscripcionSuspendidaError extends SuscripcionError {
  constructor(public estado: string) {
    super('SUSPENDIDA')
  }
}

export class LimitePlanError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class TenantIsolationError extends Error {
  constructor(message: string) {
    super(`Tenant isolation violado: ${message}`)
  }
}
```

### Mapeo de errores a respuestas HTTP

```typescript
// apps/web/src/lib/errors/handler.ts

import { NextResponse } from 'next/server'
import {
  SuscripcionError,
  SuscripcionSuspendidaError,
  LimitePlanError
} from '@enbandeja/shared/errors'

export function manejarError(error: unknown) {
  if (error instanceof SuscripcionSuspendidaError) {
    return NextResponse.json(
      { error: 'Tu suscripción está suspendida', estado: error.estado },
      { status: 402 }
    )
  }
  if (error instanceof LimitePlanError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    )
  }
  if (error instanceof SuscripcionError) {
    return NextResponse.json(
      { error: 'Error de suscripción', code: error.code },
      { status: 402 }
    )
  }

  // Error genérico — log a Sentry
  console.error('Error no manejado:', error)
  return NextResponse.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  )
}
```

---

## 9. INTEGRACIÓN CON BOT WHATSAPP (Fase 5)

### Carga de la base de conocimiento

```typescript
// packages/shared/src/support-bot/load-kb.ts

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

export function cargarBaseConocimiento(): string {
  const kbPath = join(process.cwd(), 'packages/support-kb')
  const archivos: string[] = []

  function recorrer(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        recorrer(full)
      } else if (entry.name.endsWith('.md')) {
        archivos.push(readFileSync(full, 'utf-8'))
      }
    }
  }

  recorrer(kbPath)
  return archivos.join('\n\n---\n\n')
}
```

### Llamada a Anthropic API

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const KNOWLEDGE_BASE = cargarBaseConocimiento()

const SYSTEM_PROMPT = `
Eres el asistente de soporte de Enbandeja, el SaaS de gestión de
casinos escolares chilenos. Respondes a PYMES que operan casinos
y a sus equipos (Owner, Operador, Cocina).

Usa SOLO la siguiente base de conocimiento para responder. Si la
pregunta no está cubierta o no puedes resolverla en 3 intentos,
escribe exactamente: [ESCALAR_HUMANO] y detente.

NUNCA inventes datos operativos del tenant (pedidos, comensales,
reportes). Solo respondes preguntas sobre cómo usar el producto.

BASE DE CONOCIMIENTO:
${KNOWLEDGE_BASE}
`

export async function responderPregunta(mensaje: string, historial: any[]) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [...historial, { role: 'user', content: mensaje }]
  })

  return response.content[0].text
}
```

---

## 10. CHECKLIST ANTES DE CREAR UNA API ROUTE

- [ ] ¿Está envuelta en `withAuth` (si es de negocio)?
- [ ] ¿Llama a `verificarSuscripcion` (si es de negocio)?
- [ ] ¿Usa `createTenantClient`, NUNCA `prisma` global?
- [ ] ¿Valida el body con Zod?
- [ ] ¿Recalcula totales en el backend (NUNCA confía en frontend)?
- [ ] ¿Las mutaciones críticas usan `db.$transaction`?
- [ ] ¿Si toca pago, verifica firma HMAC?
- [ ] ¿Si es webhook, registra en `WebhookEventLog` con idempotencia?
- [ ] ¿Maneja errores con `manejarError` o equivalente?
- [ ] ¿Las fechas usan `toZonedTime` con timezone del tenant?
- [ ] ¿Hay test E2E si es flujo crítico (auth, pago, billing)?

---

## 11. SEÑALES DE ALERTA INMEDIATAS

- API route que importa `prisma` directo en lugar de
  `createTenantClient`
- API route sin `withAuth` que toca tablas con `tenantId`
- Webhook que NO verifica firma HMAC
- Webhook que NO usa `WebhookEventLog`
- Cron con `America/Santiago` hardcodeado
- Backend que confía en `total` o `precio` enviado por el frontend
- Mutación de múltiples tablas relacionadas SIN `$transaction`
- Catch que silencia errores sin loggearlos

---

*Agente Backend de Enbandeja — versión 1.0*
*Lectura obligatoria antes de tocar API routes, webhooks o cron*