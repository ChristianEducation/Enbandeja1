// ═══════════════════════════════════════════════════════════════════
// /operador/menu/[fecha] — Editar menú existente (Server Component)
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { EditarMenuClient } from "./components/EditarMenuClient"

export const dynamic = "force-dynamic"

export default async function EditarMenuPage({
  params,
}: {
  params: Promise<{ fecha: string }>
}) {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) {
    redirect("/login")
  }

  const { fecha } = await params
  const tenantId = session.activeTenantId
  const userId = session.user.id
  const db = createTenantClient(tenantId, userId)

  // Buscar menú por fecha
  const fechaDate = parseISO(fecha)
  const menu = await db.menu.findFirst({
    where: { tenantId, fecha: fechaDate },
    include: {
      Opciones: {
        include: {
          Precios: {
            select: {
              id: true,
              categoriaPrecioId: true,
              precio: true,
            },
          },
        },
        orderBy: { orden: "asc" },
      },
      Colegio: {
        select: { id: true, nombre: true },
      },
    },
  })

  if (!menu) {
    redirect(`/menu/nuevo?fecha=${fecha}`)
  }

  // Categorías de precio del colegio
  const categorias = await db.categoriaPrecio.findMany({
    where: { tenantId, colegioId: menu.colegioId, isActive: true, deletedAt: null },
    select: { id: true, nombre: true, esDefault: true },
    orderBy: { orden: "asc" },
  })

  // Serializar opciones
  const opciones = menu.Opciones.map((op) => ({
    id: op.id,
    nombre: op.nombre,
    descripcion: op.descripcion || "",
    categoria: op.categoria || "",
    stockMax: op.stockMax?.toString() || "",
    estado: op.estado,
    orden: op.orden,
    precios: Object.fromEntries(
      op.Precios.map((p) => [p.categoriaPrecioId, p.precio.toString()])
    ),
  }))

  const fechaDisplay = format(fechaDate, "EEEE d 'de' MMMM, yyyy", { locale: es })

  return (
    <EditarMenuClient
      menuId={menu.id}
      fecha={fecha}
      fechaDisplay={fechaDisplay}
      estado={menu.estado}
      opciones={opciones}
      categorias={categorias}
      colegioNombre={menu.Colegio.nombre}
    />
  )
}
