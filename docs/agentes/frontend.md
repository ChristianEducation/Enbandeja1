# AGENTE FRONTEND — Enbandeja

> Agente especializado en componentes React, páginas Next.js 15,
> Server/Client Components, formularios con Zod y consumo de
> componentes del design system. Claude Code lee este archivo
> **antes** de crear o modificar cualquier archivo de UI.
>
> **Cuándo invocarme:**
> - Crear o modificar componentes React en `apps/web/src/components/`
> - Crear o modificar páginas en `apps/web/src/app/`
> - Implementar Server Actions
> - Crear formularios con validación Zod
> - Configurar layouts y navegación
> - Integrar componentes de `packages/ui`

---

## 1. PRINCIPIOS RECTORES

### Principio 1 — Mobile-first siempre

La app del apoderado se usa principalmente en celular antes de las
10 AM cuando los apoderados piden el almuerzo del día. Todo lo que
tocamos se diseña primero para móvil y se escala a desktop.

### Principio 2 — Server Components por default

En Next.js 15 con App Router, los componentes son Server Components
por default. Solo se marcan con `"use client"` cuando es
estrictamente necesario (interactividad del lado del cliente, hooks
de React, browser APIs).

### Principio 3 — Frontera estricta entre Server y Client

Si un componente tiene `"use client"`, **NO PUEDE** importar:

- `@enbandeja/database` (Prisma client)
- Variables de entorno privadas (sin prefijo `NEXT_PUBLIC_`)
- `next/headers`, `next/server`
- Funciones que accedan al filesystem

Los Server Components hablan con la base de datos. Los Client
Components reciben datos resueltos como props o disparan Server
Actions.

---

## 2. ESTRUCTURA DE RUTAS DE `apps/web/`

```
apps/web/src/app/
├── layout.tsx                    # Layout raíz de toda la app
├── page.tsx                       # Redirect a /home si auth, /login si no
├── globals.css
│
├── (auth)/                        # Grupo de rutas de auth (público)
│   ├── login/page.tsx
│   ├── registro/page.tsx
│   ├── registro/codigo/page.tsx
│   └── registro/comensal/page.tsx
│
├── (apoderado)/                   # Grupo de rutas del apoderado (auth)
│   ├── layout.tsx                 # Layout específico del apoderado
│   ├── home/page.tsx
│   ├── pedir/page.tsx
│   ├── resumen/page.tsx
│   ├── confirmacion/page.tsx
│   ├── historial/page.tsx
│   └── perfil/page.tsx
│
├── (operador)/                    # Grupo del operador (auth + rol)
│   ├── layout.tsx
│   ├── operador/dia/page.tsx
│   ├── operador/semana/page.tsx
│   ├── operador/menu/page.tsx
│   ├── operador/menu/nuevo/page.tsx
│   ├── operador/menu/[fecha]/page.tsx
│   ├── operador/kiosco/page.tsx
│   ├── operador/comensales/page.tsx
│   └── operador/reportes/page.tsx
│
├── (owner)/                       # Grupo del owner (auth + rol)
│   ├── layout.tsx
│   ├── owner/dashboard/page.tsx
│   ├── owner/dashboard/[colegioId]/page.tsx
│   ├── owner/empresa/page.tsx
│   ├── owner/colegios/page.tsx
│   ├── owner/usuarios/page.tsx
│   └── owner/billing/page.tsx
│
├── (cocina)/                      # Grupo de cocina (auth + rol)
│   ├── layout.tsx
│   └── cocina/page.tsx
│
├── (super-admin)/                 # Grupo super admin (separado)
│   ├── layout.tsx
│   ├── super-admin/login/page.tsx
│   ├── super-admin/dashboard/page.tsx
│   └── super-admin/tenants/[id]/page.tsx
│
└── api/                           # API routes (ver agente backend)
    ├── auth/[...nextauth]/route.ts
    ├── pedidos/crear/route.ts
    ├── payment/webhook/route.ts
    └── ...
```

---

## 3. SERVER COMPONENTS — PATRÓN OBLIGATORIO

### Patrón 1 — Página con data fetching del servidor

```typescript
// apps/web/src/app/(operador)/operador/dia/page.tsx

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createTenantClient } from '@enbandeja/database'
import { ListaDelDiaClient } from './components/ListaDelDiaClient'

// Server Component — habla con Prisma directamente
export default async function ListaDelDiaPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (!['OPERADOR', 'OWNER'].includes(session.role)) {
    redirect('/')
  }

  const db = createTenantClient(session.activeTenantId, session.user.id)

  const hoy = new Date()
  const pedidosHoy = await db.pedido.findMany({
    where: {
      colegioId: session.colegioId,
      estado: 'PAGADO',
      Items: {
        some: {
          fecha: {
            gte: new Date(hoy.setHours(0, 0, 0, 0)),
            lt: new Date(hoy.setHours(23, 59, 59, 999))
          }
        }
      }
    },
    include: {
      Apoderado: { select: { name: true } },
      Items: { include: { Comensal: true, OpcionMenu: true } }
    }
  })

  // Pasa los datos resueltos al Client Component
  return <ListaDelDiaClient pedidos={pedidosHoy} />
}
```

### Regla — Server Components no llevan `"use client"`

Si una página es Server Component (la mayoría), NO tiene `"use client"`
en la primera línea. Solo los componentes interactivos lo tienen.

---

## 4. CLIENT COMPONENTS — CUÁNDO USARLOS

### Casos válidos para `"use client"`:

- Hooks de React (`useState`, `useEffect`, `useReducer`, etc.)
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- Browser APIs (`localStorage`, `window`, `document`)
- Bibliotecas que requieren cliente (Recharts, libraries con
  context)
- Componentes que usan React Query con fetch dinámico

### Patrón de Client Component que recibe datos del servidor

```typescript
// apps/web/src/app/(operador)/operador/dia/components/ListaDelDiaClient.tsx
'use client'

import { useState } from 'react'
import { Button, Card, Input } from '@enbandeja/ui'
import { marcarComoRetiradoAction } from '../actions'

interface Props {
  pedidos: PedidoConItems[]
}

export function ListaDelDiaClient({ pedidos }: Props) {
  const [filtro, setFiltro] = useState('')

  const pedidosFiltrados = pedidos.filter(p =>
    p.Items.some(i =>
      i.Comensal.nombre.toLowerCase().includes(filtro.toLowerCase())
    )
  )

  return (
    <div className="space-y-4 p-4">
      <Input
        placeholder="Buscar por nombre..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
      />

      {pedidosFiltrados.map(pedido => (
        <Card key={pedido.id}>
          {/* Renderizado de cada pedido */}
        </Card>
      ))}
    </div>
  )
}
```

---

## 5. SERVER ACTIONS — PATRÓN OBLIGATORIO

Server Actions son funciones marcadas con `"use server"` que se
ejecutan en el servidor pero pueden ser invocadas desde Client
Components. Reemplazan API routes para mutaciones simples.

### Patrón de Server Action

```typescript
// apps/web/src/app/(operador)/operador/dia/actions.ts
'use server'

import { auth } from '@/lib/auth'
import { createTenantClient } from '@enbandeja/database'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MarcarRetiradoSchema = z.object({
  pedidoItemId: z.string().uuid()
})

export async function marcarComoRetiradoAction(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  if (!['OPERADOR', 'OWNER'].includes(session.role)) {
    throw new Error('Sin permisos')
  }

  const parsed = MarcarRetiradoSchema.safeParse({
    pedidoItemId: formData.get('pedidoItemId')
  })

  if (!parsed.success) {
    throw new Error('Datos inválidos')
  }

  const db = createTenantClient(session.activeTenantId, session.user.id)

  await db.pedidoItem.update({
    where: { id: parsed.data.pedidoItemId },
    data: { retirado: true, retiradoAt: new Date() }
  })

  // Revalidar la página para que se refresquen los datos
  revalidatePath('/operador/dia')
}
```

### Uso desde Client Component

```typescript
'use client'

import { marcarComoRetiradoAction } from '../actions'

export function BotonRetirar({ pedidoItemId }: { pedidoItemId: string }) {
  return (
    <form action={marcarComoRetiradoAction}>
      <input type="hidden" name="pedidoItemId" value={pedidoItemId} />
      <button type="submit">Marcar como retirado</button>
    </form>
  )
}
```

---

## 6. FORMULARIOS CON ZOD

### Patrón de formulario validado

```typescript
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button, Input } from '@enbandeja/ui'

const RegistroSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  nombre: z.string().min(2, 'Nombre muy corto')
})

type RegistroFormData = z.infer<typeof RegistroSchema>

export function FormularioRegistro() {
  const [datos, setDatos] = useState<Partial<RegistroFormData>>({})
  const [errores, setErrores] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validar con Zod
    const parsed = RegistroSchema.safeParse(datos)
    if (!parsed.success) {
      const newErrores: Record<string, string> = {}
      parsed.error.issues.forEach(issue => {
        newErrores[issue.path[0]] = issue.message
      })
      setErrores(newErrores)
      return
    }

    // Llamar Server Action o API route
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify(parsed.data)
      })
      if (!res.ok) throw new Error('Error en registro')
      // ... redirect
    } catch (error) {
      setErrores({ general: 'Error al registrar. Intenta nuevamente.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={datos.email || ''}
        onChange={e => setDatos({ ...datos, email: e.target.value })}
        error={errores.email}
      />
      <Input
        label="Contraseña"
        type="password"
        value={datos.password || ''}
        onChange={e => setDatos({ ...datos, password: e.target.value })}
        error={errores.password}
      />
      <Input
        label="Nombre"
        value={datos.nombre || ''}
        onChange={e => setDatos({ ...datos, nombre: e.target.value })}
        error={errores.nombre}
      />
      {errores.general && (
        <p className="text-error text-sm">{errores.general}</p>
      )}
      <Button type="submit">Registrarse</Button>
    </form>
  )
}
```

### Regla — Validar también en el backend

Aunque el frontend valide con Zod, el backend SIEMPRE valida de
nuevo. La validación frontend es solo UX, no seguridad.

---

## 7. LAYOUTS Y NAVEGACIÓN

### Layout raíz

```typescript
// apps/web/src/app/layout.tsx

import './globals.css'

export const metadata = {
  title: 'Enbandeja',
  description: 'Gestión de casinos escolares para Chile'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
```

### Layout por grupo de rutas

```typescript
// apps/web/src/app/(operador)/layout.tsx

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NavOperador } from './components/NavOperador'

export default async function OperadorLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (!['OPERADOR', 'OWNER'].includes(session.role)) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <NavOperador />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
```

---

## 8. CONSUMO DE COMPONENTES DE `packages/ui`

### Patrón obligatorio de import

```typescript
// ✅ CORRECTO
import { Button, Card, Input, Badge } from '@enbandeja/ui'
```

```typescript
// ❌ PROHIBIDO
import { Button } from '@enbandeja/ui/components/Button'
import lucideReact from 'lucide-react'  // ← lucide-react NO en apps/web
```

### Iconos — re-exportados desde `@enbandeja/ui`

```typescript
// ✅ CORRECTO
import { Calendar, User, ChevronRight } from '@enbandeja/ui/icons'
```

```typescript
// ❌ PROHIBIDO
import { Calendar } from 'lucide-react'  // lucide-react SOLO en packages/ui
```

### Estilos — usar Tailwind con tokens del design system

```typescript
// ✅ CORRECTO
<div className="bg-primary text-primary-foreground rounded-lg p-4">

// ❌ PROHIBIDO
<div style={{ backgroundColor: '#2563eb', padding: '16px' }}>
<div className="bg-blue-600 text-white">  // ← color hardcodeado
```

---

## 9. DATA FETCHING — REGLAS POR TIPO

### Server Components → Prisma directo via `createTenantClient`

```typescript
const db = createTenantClient(session.activeTenantId, session.user.id)
const pedidos = await db.pedido.findMany({ /* ... */ })
```

### Client Components con datos dinámicos → React Query

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export function PedidosEnTiempoReal() {
  const { data: pedidos } = useQuery({
    queryKey: ['pedidos-hoy'],
    queryFn: async () => {
      const res = await fetch('/api/pedidos/hoy')
      return res.json()
    },
    refetchInterval: 30_000  // refetch cada 30 segundos
  })

  // ...
}
```

### Mutaciones → Server Actions o API routes con React Query

```typescript
'use client'

import { useMutation } from '@tanstack/react-query'

const mutation = useMutation({
  mutationFn: async (data: any) => {
    const res = await fetch('/api/pedidos/crear', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return res.json()
  },
  onSuccess: () => {
    // Refetch o redirect
  }
})
```

---

## 10. NOTIFICACIONES PUSH (PWA)

### Suscripción a push notifications

```typescript
'use client'

import { useEffect } from 'react'

export function PushSubscription() {
  useEffect(() => {
    async function suscribir() {
      if (!('serviceWorker' in navigator)) return
      if (!('PushManager' in window)) return

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Guardar token en backend
      await fetch('/api/push/registrar-token', {
        method: 'POST',
        body: JSON.stringify({ subscription })
      })
    }

    suscribir()
  }, [])

  return null
}
```

---

## 11. ERROR BOUNDARIES Y LOADING STATES

### Página de error por grupo de rutas

```typescript
// apps/web/src/app/(operador)/error.tsx
'use client'

import { Button } from '@enbandeja/ui'

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="mt-4">
        Intentar nuevamente
      </Button>
    </div>
  )
}
```

### Loading state por ruta

```typescript
// apps/web/src/app/(operador)/operador/dia/loading.tsx

export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-12 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded bg-muted" />
    </div>
  )
}
```

---

## 12. CHECKLIST ANTES DE CREAR UN COMPONENTE

- [ ] ¿Es Server Component (default) o Client Component (`"use client"`)?
- [ ] Si es Client, ¿NO importa `@enbandeja/database` ni
  variables `NEXT_PUBLIC_*`?
- [ ] ¿Los iconos vienen de `@enbandeja/ui/icons`, NUNCA de
  `lucide-react`?
- [ ] ¿Los colores y estilos usan tokens del design system, NO
  valores hardcodeados?
- [ ] ¿Los formularios validan con Zod (frontend) Y backend?
- [ ] ¿Los Server Components hacen data fetching con `createTenantClient`?
- [ ] ¿Los Client Components reciben datos como props o usan React Query?
- [ ] ¿Las páginas con auth redirigen a `/login` si no hay sesión?
- [ ] ¿Las páginas con rol redirigen si el rol no corresponde?
- [ ] ¿Hay loading state (`loading.tsx`) y error state (`error.tsx`)?
- [ ] ¿Es mobile-first (probado en viewport pequeño)?

---

## 13. SEÑALES DE ALERTA INMEDIATAS

- Componente con `"use client"` que importa `@enbandeja/database`
- Componente con `"use client"` que usa `process.env.X` sin
  prefijo `NEXT_PUBLIC_`
- Import directo de `lucide-react` fuera de `packages/ui`
- Color hardcodeado (`#hex`, `bg-blue-600`, `style={{}}` con valores
  literales)
- Form que NO valida con Zod
- Server Action sin verificación de auth y rol
- Página sin redirect si no hay sesión
- Server Component que importa hooks de React (no son válidos
  fuera de Client Components)

---

*Agente Frontend de Enbandeja — versión 1.0*
*Lectura obligatoria antes de tocar componentes o páginas*