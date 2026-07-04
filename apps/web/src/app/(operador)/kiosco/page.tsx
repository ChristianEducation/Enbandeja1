// ═══════════════════════════════════════════════════════════════════
// /operador/kiosco — Gestión de productos del kiosco (Server Component)
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { KioscoClient } from "./components/KioscoClient"

export const dynamic = "force-dynamic"

export interface ProductoKioscoItem {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  stockDiario: number | null
  stockActual: number | null
  isActive: boolean
  orden: number
  categoriaKioscoId: string | null
  categoriaNombre: string | null
}

export interface CategoriaKioscoItem {
  id: string
  nombre: string
  orden: number
  isActive: boolean
}

export default async function KioscoPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) {
    redirect("/login")
  }

  const tenantId = session.activeTenantId
  const userId = session.user.id
  const db = createTenantClient(tenantId, userId)

  // Colegios del tenant
  const colegios = await db.colegio.findMany({
    where: { isActive: true, deletedAt: null, kioscoActivo: true },
    select: { id: true, nombre: true },
  })

  const primerColegio = colegios[0]

  // Categorías y productos del primer colegio con kiosco
  let categorias: CategoriaKioscoItem[] = []
  let productos: ProductoKioscoItem[] = []

  if (primerColegio) {
    const categoriasRaw = await db.categoriaKiosco.findMany({
      where: { colegioId: primerColegio.id, deletedAt: null },
      orderBy: { orden: "asc" },
    })

    categorias = categoriasRaw.map((c: any) => ({
      id: c.id,
      nombre: c.nombre,
      orden: c.orden,
      isActive: c.isActive,
    }))

    const productosRaw = await db.productoKiosco.findMany({
      where: { colegioId: primerColegio.id, deletedAt: null },
      orderBy: { orden: "asc" },
    })

    productos = productosRaw.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stockDiario: p.stockDiario,
      stockActual: p.stockActual,
      isActive: p.isActive,
      orden: p.orden,
      categoriaKioscoId: p.categoriaKioscoId,
      categoriaNombre: categorias.find((c: any) => c.id === p.categoriaKioscoId)?.nombre || null,
    }))
  }

  return (
    <KioscoClient
      productos={productos}
      categorias={categorias}
      tieneKiosco={colegios.length > 0}
    />
  )
}
