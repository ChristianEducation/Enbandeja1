// ═══════════════════════════════════════════════════════════════════
// /home — Panel del apoderado (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Flujo:
// 1. Verifica sesión → si no, redirect /login
// 2. Verifica activeTenantId → si no, redirect /onboarding/codigo
// 3. Crea db = createTenantClient(tenantId, userId)
// 4. Query comensales del apoderado con colegio incluido
// 5. Query menús publicados de los próximos 7 días
// 6. Query pedidos existentes del apoderado para esos días
// 7. Resuelve precios con getPrecioParaComensal por cada opción
// 8. Pasa datos a HomeApoderadoClient como props
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient, getPrecioParaComensal } from "@enbandeja/database"
import { HomeApoderadoClient } from "./components/HomeApoderadoClient"
import { format, addDays, startOfDay } from "date-fns"
import { toZonedTime } from "date-fns-tz"

// ───────────────────────────────────────────────────────────────────
// TIPOS (serializables — se pasan como props al Client Component)
// ───────────────────────────────────────────────────────────────────

export interface ComensalConColegio {
  id: string
  nombre: string
  apellido: string
  curso: string | null
  categoriaPrecioId: string | null
  colegio: {
    id: string
    nombre: string
    kioscoActivo: boolean
    horaCorte: string
    timezone: string
  }
}

export interface OpcionConPrecio {
  id: string
  nombre: string
  descripcion: string | null
  fotoUrl: string | null
  categoria: string | null
  estado: string
  /** Precio resuelto para el comensal activo */
  precio: number
}

export interface MenuDelDia {
  fecha: string
  opciones: OpcionConPrecio[]
}

export interface PedidoExistente {
  id: string
  estado: string
  fecha: string
  items: Array<{
    comensalId: string
    opcionMenuId: string | null
    nombre: string
  }>
}

export interface DatosDia {
  fecha: string
  menu: MenuDelDia | null
  pedido: PedidoExistente | null
}

// ───────────────────────────────────────────────────────────────────
// SERVER COMPONENT
// ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // 1. Verificar sesión
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (!session.activeTenantId) redirect("/onboarding/codigo")

  const userId = session.user.id
  const tenantId = session.activeTenantId

  // 2. Crear cliente con contexto de tenant
  const db = createTenantClient(tenantId, userId)

  // 3. Query comensales del apoderado con colegio
  const comensalesRaw = await db.comensal.findMany({
    where: {
      apoderadoId: userId,
      isActive: true,
      deletedAt: null,
    },
    include: {
      Colegio: {
        select: {
          id: true,
          nombre: true,
          kioscoActivo: true,
          horaCorte: true,
          Tenant: { select: { timezone: true } },
        },
      },
    },
    orderBy: { nombre: "asc" },
  })

  // Mapear comensales al tipo serializable
  const comensales: ComensalConColegio[] = comensalesRaw.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    apellido: c.apellido,
    curso: c.curso,
    categoriaPrecioId: c.categoriaPrecioId,
    colegio: {
      id: c.Colegio.id,
      nombre: c.Colegio.nombre,
      kioscoActivo: c.Colegio.kioscoActivo,
      horaCorte: c.Colegio.horaCorte,
      timezone: c.Colegio.Tenant.timezone,
    },
  }))

  // 4. Colegios del apoderado
  const colegioIds = [...new Set(comensales.map((c) => c.colegio.id))]

  // Si no tiene comensales, pasar arrays vacíos
  if (colegioIds.length === 0) {
    return <HomeApoderadoClient comensales={[]} datosPorDia={[]} />
  }

  // 5. Rango de fechas: próximos 7 días en timezone del tenant
  const timezone = comensales[0]?.colegio.timezone ?? "America/Santiago"
  const ahoraZoned = toZonedTime(new Date(), timezone)
  const hoy = startOfDay(ahoraZoned)

  const fechas = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(hoy, i)
    return format(date, "yyyy-MM-dd")
  })

  // 6. Query menús publicados
  const menus = await db.menu.findMany({
    where: {
      colegioId: { in: colegioIds },
      fecha: { in: fechas.map((f) => new Date(f)) },
      estado: "PUBLICADO",
      deletedAt: null,
    },
    include: {
      Opciones: {
        where: {
          estado: "ACTIVA",
          deletedAt: null,
        },
        orderBy: { orden: "asc" },
      },
    },
  })

  // 7. Query pedidos existentes
  const pedidos = await db.pedido.findMany({
    where: {
      apoderadoId: userId,
      estado: { in: ["PENDIENTE_PAGO", "PAGADO"] },
      deletedAt: null,
    },
    include: {
      Items: {
        where: {
          fecha: { in: fechas.map((f) => new Date(f)) },
        },
        select: {
          comensalId: true,
          opcionMenuId: true,
          nombre: true,
          fecha: true,
        },
      },
    },
  })

  // 8. Construir datosPorDia — resolviendo precios con getPrecioParaComensal
  const primerComensalId = comensales[0]?.id

  const datosPorDia: DatosDia[] = await Promise.all(
    fechas.map(async (fecha) => {
      const menuDelDia = menus.find(
        (m) => format(m.fecha, "yyyy-MM-dd") === fecha
      )

      // Resolver precios para cada opción usando getPrecioParaComensal
      const opciones: OpcionConPrecio[] = []

      if (menuDelDia && primerComensalId) {
        for (const op of menuDelDia.Opciones) {
          let precio = 0
          try {
            precio = await getPrecioParaComensal(db, op.id, primerComensalId)
          } catch {
            // Si no hay precio configurado para este comensal, usar 0
            // El frontend puede mostrar "Precio no disponible"
          }
          opciones.push({
            id: op.id,
            nombre: op.nombre,
            descripcion: op.descripcion,
            fotoUrl: op.fotoUrl,
            categoria: op.categoria,
            estado: op.estado,
            precio,
          })
        }
      }

      // Buscar pedido existente para este día
      const pedidoDelDia = pedidos.find((p) =>
        p.Items.some((item) => format(item.fecha, "yyyy-MM-dd") === fecha)
      )

      const pedido: PedidoExistente | null = pedidoDelDia
        ? {
            id: pedidoDelDia.id,
            estado: pedidoDelDia.estado,
            fecha,
            items: pedidoDelDia.Items.filter(
              (item) => format(item.fecha, "yyyy-MM-dd") === fecha
            ),
          }
        : null

      return {
        fecha,
        menu: opciones.length > 0 ? { fecha, opciones } : null,
        pedido,
      }
    })
  )

  return (
    <HomeApoderadoClient
      comensales={comensales}
      datosPorDia={datosPorDia}
    />
  )
}
