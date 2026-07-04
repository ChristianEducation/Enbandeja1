// ═══════════════════════════════════════════════════════════════════
// /super-admin/tenants/[id]/billing — Panel de billing del tenant
// ═══════════════════════════════════════════════════════════════════
// Solo Super Admin. Gestión de cobros manuales (billing SaaS).
// Muestra estado, historial, acciones de gestión.
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { TenantBillingClient } from "./components/TenantBillingClient"

export const dynamic = "force-dynamic"

export default async function TenantBillingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) redirect("/login")

  const superAdmin = await prisma.superAdmin.findFirst({
    where: { email: session.user.email, isActive: true, deletedAt: null },
  })
  if (!superAdmin) redirect("/login")

  const { id: tenantId } = await params

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      phone: true,
      status: true,
      timezone: true,
      deletedAt: true,
    },
  })

  if (!tenant || tenant.deletedAt) notFound()

  // Suscripción
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId },
    include: {
      Plan: {
        select: {
          id: true,
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

  // Historial pagos
  const pagos = await prisma.pagoSuscripcion.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  // Recursos actuales
  const colegiosActivos = await prisma.colegio.count({
    where: { tenantId, isActive: true, deletedAt: null },
  })
  const usuariosActivos = await prisma.userTenant.count({
    where: { tenantId, isActive: true, deletedAt: null },
  })

  // Todos los planes disponibles
  const planes = await prisma.plan.findMany({
    where: { isActive: true, deletedAt: null },
    include: { Limites: true },
    orderBy: { precioMensual: "asc" },
  })

  // AuditLog de billing
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      action: {
        in: [
          "CONFIRMAR_PAGO_SUSCRIPCION",
          "CAMBIO_PLAN_UPGRADE",
          "CAMBIO_PLAN_DOWNGRADE_PENDIENTE",
          "CANCELAR_SUSCRIPCION",
          "REACTIVAR_SUSCRIPCION",
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <TenantBillingClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email,
        phone: tenant.phone,
        status: tenant.status,
        timezone: tenant.timezone,
      }}
      suscripcion={
        suscripcion
          ? {
              id: suscripcion.id,
              estado: suscripcion.estado,
              tipo: suscripcion.tipo,
              periodoInicio: suscripcion.periodoInicio.toISOString(),
              periodoFin: suscripcion.periodoFin.toISOString(),
              vencidoAt: suscripcion.vencidoAt?.toISOString() ?? null,
              suspendidoAt: suscripcion.suspendidoAt?.toISOString() ?? null,
              canceladoAt: suscripcion.canceladoAt?.toISOString() ?? null,
              plan: {
                id: suscripcion.Plan.id,
                nombre: suscripcion.Plan.nombre,
                tipo: suscripcion.Plan.tipo,
                maxColegios: suscripcion.Plan.maxColegios,
                maxUsuarios: suscripcion.Plan.maxUsuarios,
                precioMensual: suscripcion.Plan.precioMensual,
                precioAnual: suscripcion.Plan.precioAnual,
              },
            }
          : null
      }
      pagos={pagos.map((p) => ({
        id: p.id,
        monto: p.monto,
        metodo: p.metodoPago,
        estado: p.estado,
        referencia: p.transactionId,
        createdAt: p.createdAt.toISOString(),
      }))}
      recursos={{ colegiosActivos, usuariosActivos }}
      planes={planes.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        tipo: p.tipo,
        precioMensual: p.precioMensual,
        precioAnual: p.precioAnual,
        maxColegios: p.maxColegios,
        maxUsuarios: p.maxUsuarios,
      }))}
      auditLogs={auditLogs.map((a) => ({
        id: a.id,
        action: a.action,
        changes: a.changes as Record<string, unknown> | null,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  )
}
