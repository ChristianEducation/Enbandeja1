// ═══════════════════════════════════════════════════════════════════
// /owner/billing — Panel completo de suscripción del owner
// ═══════════════════════════════════════════════════════════════════
// CRÍTICO: Esta ruta NO debe ser bloqueada por verificarSuscripcion.
// Un owner sin suscripción activa DEBE poder llegar aquí para pagar.
// (withAuthNoTenant en los endpoints de billing lo garantiza)
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { BillingClient } from "./components/BillingClient"
import { obtenerLimitesPlan } from "@/lib/middleware/verificarSuscripcion"

export const dynamic = "force-dynamic"

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  const tenantId = session.activeTenantId

  // Suscripción actual
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId },
    include: {
      Plan: {
        select: {
          nombre: true,
          tipo: true,
          maxColegios: true,
          maxUsuarios: true,
          precioMensual: true,
          precioAnual: true,
        },
      },
    },
  })

  // Historial de pagos
  const pagos = await prisma.pagoSuscripcion.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  // Límites del plan
  const limites = await obtenerLimitesPlan(tenantId)

  // Recursos actuales
  const colegiosActivos = await prisma.colegio.count({
    where: { tenantId, isActive: true, deletedAt: null },
  })
  const usuariosActivos = await prisma.userTenant.count({
    where: { tenantId, isActive: true, deletedAt: null },
  })

  // Planes disponibles para cambio
  const planes = await prisma.plan.findMany({
    where: { isActive: true, deletedAt: null },
    select: {
      id: true,
      nombre: true,
      tipo: true,
      precioMensual: true,
      precioAnual: true,
      maxColegios: true,
      maxUsuarios: true,
    },
    orderBy: { precioMensual: "asc" },
  })

  return (
    <BillingClient
      suscripcion={suscripcion ? {
        estado: suscripcion.estado,
        tipo: suscripcion.tipo,
        periodoInicio: suscripcion.periodoInicio.toISOString(),
        periodoFin: suscripcion.periodoFin.toISOString(),
        vencidoAt: suscripcion.vencidoAt?.toISOString() || null,
        suspendidoAt: suscripcion.suspendidoAt?.toISOString() || null,
        canceladoAt: suscripcion.canceladoAt?.toISOString() || null,
        plan: {
          nombre: suscripcion.Plan.nombre,
          tipo: suscripcion.Plan.tipo,
          maxColegios: suscripcion.Plan.maxColegios,
          maxUsuarios: suscripcion.Plan.maxUsuarios,
          precioMensual: suscripcion.Plan.precioMensual,
          precioAnual: suscripcion.Plan.precioAnual,
        },
      } : null}
      pagos={pagos.map((p) => ({
        id: p.id,
        monto: p.monto,
        metodo: p.metodoPago,
        estado: p.estado,
        referencia: p.transactionId,
        createdAt: p.createdAt.toISOString(),
      }))}
      limites={limites}
      recursos={{ colegiosActivos, usuariosActivos }}
      planes={planes}
    />
  )
}
