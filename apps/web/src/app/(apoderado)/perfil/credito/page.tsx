// ═══════════════════════════════════════════════════════════════════
// /perfil/credito — Movimientos de crédito del apoderado (Server Component)
// ═══════════════════════════════════════════════════════════════════
// Query CreditoApoderado + CreditoMovimiento ordenado desc
// Bento Card: saldo actual (Plus Jakarta display grande)
// Lista Bento por cada movimiento
// ═══════════════════════════════════════════════════════════════════
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createTenantClient } from "@enbandeja/database"
import { formatCLP } from "@enbandeja/shared"
import { toZonedTime } from "date-fns-tz"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CreditoClient } from "./components/CreditoClient"

export const dynamic = "force-dynamic"

export interface MovimientoCredito {
  id: string
  monto: number
  concepto: string
  pedidoId: string | null
  createdAt: string
  fechaFormateada: string
}

export default async function CreditoPage() {
  const session = await auth()
  if (!session?.user?.id || !session.activeTenantId) {
    redirect("/login")
  }

  const tenantId = session.activeTenantId
  const userId = session.user.id
  const db = createTenantClient(tenantId, userId)

  // Obtener timezone del tenant
  const tenant = await db.tenant.findFirst({
    where: { id: tenantId },
    select: { timezone: true },
  })
  const timezone = tenant?.timezone || "America/Santiago"

  // Crédito del apoderado
  const credito = await db.creditoApoderado.findFirst({
    where: { apoderadoId: userId },
    select: { monto: true },
  })

  // Movimientos ordenados desc
  const creditoRecord = await db.creditoApoderado.findFirst({
    where: { apoderadoId: userId },
    select: { id: true },
  })

  let movimientos: MovimientoCredito[] = []

  if (creditoRecord) {
    const movimientosRaw = await db.creditoMovimiento.findMany({
      where: { creditoId: creditoRecord.id },
      orderBy: { createdAt: "desc" },
    })

    movimientos = movimientosRaw.map((m) => {
      const fechaZoned = toZonedTime(m.createdAt, timezone)
      return {
        id: m.id,
        monto: m.monto,
        concepto: m.concepto,
        pedidoId: m.pedidoId,
        createdAt: m.createdAt.toISOString(),
        fechaFormateada: format(fechaZoned, "d MMM, HH:mm", { locale: es }),
      }
    })
  }

  return (
    <CreditoClient
      saldoActual={credito?.monto || 0}
      movimientos={movimientos}
    />
  )
}
