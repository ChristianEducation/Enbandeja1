// ═══════════════════════════════════════════════════════════════════
// /owner/reportes — Reportes y exportaciones avanzadas (Server Component)
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"
import { ReportesClient } from "./components/ReportesClient"

export const dynamic = "force-dynamic"

export default async function ReportesPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) redirect("/login")

  // Colegios para selector
  const colegios = await prisma.colegio.findMany({
    where: {
      tenantId: session.activeTenantId,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  })

  // Reportes existentes
  const reportes = await prisma.reporteExportacion.findMany({
    where: { tenantId: session.activeTenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      Colegio: { select: { nombre: true } },
    },
  })

  const reportesData = reportes.map((r) => ({
    id: r.id,
    periodo: r.periodo,
    tipo: r.tipo,
    estado: r.estado,
    colegioNombre: r.Colegio?.nombre || "Todos los colegios",
    fileName: r.fileName,
    fileSizeBytes: r.fileSizeBytes,
    generadoAt: r.generadoAt?.toISOString() || null,
    expiraAt: r.expiraAt?.toISOString() || null,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <ReportesClient
      colegios={colegios}
      reportes={reportesData}
    />
  )
}
