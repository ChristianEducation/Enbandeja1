// ═══════════════════════════════════════════════════════════════════
// GET /api/cron/kpi-snapshot — Cron cada hora
// ═══════════════════════════════════════════════════════════════════
// CRÍTICO: itera por timezone de CADA tenant por separado.
// Para cada tenant, calcula la "fecha de ayer" según su hora local.
// Genera KpiSnapshot del día anterior cuando el tenant pasa la
// medianoche local (hora local === 0 → recién pasó el día).
//
// IDEMPOTENTE: upsert sobre @@unique([colegioId, fecha]).
// Correr dos veces no duplica snapshots.
//
// Protegido con CRON_SECRET. Usa prisma global (opera sobre
// todos los tenants, no es ruta de negocio de uno solo).
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@enbandeja/database"
import { toZonedTime } from "date-fns-tz"
import { subDays, startOfDay } from "date-fns"
import { generarKpiSnapshot } from "@/lib/kpi/generar-snapshot"

export async function GET(req: NextRequest) {
  // Verificar CRON_SECRET
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 })
  }

  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const ahoraUtc = new Date()

  // Obtener todos los tenants activos
  const tenants = await prisma.tenant.findMany({
    where: {
      status: { in: ["TRIAL", "ACTIVE"] },
      deletedAt: null,
    },
    select: {
      id: true,
      timezone: true,
    },
  })

  const resultados: { tenantId: string; procesados: number; error?: string }[] = []

  for (const tenant of tenants) {
    try {
      const horaLocal = toZonedTime(ahoraUtc, tenant.timezone)
      const hora = horaLocal.getHours()

      // Procesar cuando es la primera hora del día (0-1 AM local)
      // Esto genera el snapshot del día anterior que ya cerró.
      // También procesamos si hora es 1 para dar margen.
      // Siempre generamos el snapshot del día ANTERIOR.
      if (hora <= 1) {
        const fechaAyerLocal = startOfDay(subDays(horaLocal, 1))

        // Obtener colegios activos del tenant
        const colegios = await prisma.colegio.findMany({
          where: {
            tenantId: tenant.id,
            isActive: true,
            deletedAt: null,
          },
          select: { id: true },
        })

        let procesados = 0
        for (const colegio of colegios) {
          await generarKpiSnapshot(
            tenant.id,
            colegio.id,
            fechaAyerLocal,
            tenant.timezone
          )
          procesados++
        }

        resultados.push({ tenantId: tenant.id, procesados })
      }
    } catch (error) {
      console.error(`Error kpi-snapshot tenant ${tenant.id}:`, error)
      resultados.push({ tenantId: tenant.id, procesados: 0, error: String(error) })
    }
  }

  return NextResponse.json({
    procesados: resultados.reduce((sum, r) => sum + r.procesados, 0),
    tenants: resultados,
  })
}
