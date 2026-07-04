// ═══════════════════════════════════════════════════════════════════
// GET /api/cron/transiciones-menu — Transiciones automáticas de estado
// ═══════════════════════════════════════════════════════════════════
// CRÍTICO: Este endpoint corre como Vercel Cron (cada hora).
//
// Transiciones:
// 1. PUBLICADO → CERRADO: cuando la hora local del tenant pasa la horaCorte
// 2. CERRADO → ARCHIVADO: cuando la fecha del menú ya pasó (ayer o antes)
//
// RESPETA timezone de CADA tenant por separado.
// Un tenant en Santiago y otro en Punta Arenas transicionan a horas distintas.
//
// IDEMPOTENTE: si corre dos veces, no rompe estados.
// - PUBLICADO→CERRADO solo si estado === PUBLICADO (ya cerrados se saltan)
// - CERRADO→ARCHIVADO solo si estado === CERRADO (ya archivados se saltan)
//
// Protección: espera header CRON_SECRET o param ?secret= para ejecutar.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@enbandeja/database"
import { toZonedTime } from "date-fns-tz"
import { format, parseISO } from "date-fns"

const CRON_SECRET = process.env.CRON_SECRET || ""

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Protección: verificar CRON_SECRET
  const authHeader = req.headers.get("authorization")
  const paramSecret = req.nextUrl.searchParams.get("secret")
  const providedSecret = authHeader?.replace("Bearer ", "") || paramSecret || ""

  if (CRON_SECRET && providedSecret !== CRON_SECRET) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
  }

  const ahora = new Date()
  let cerrados = 0
  let archivados = 0

  try {
    // Obtener todos los tenants activos
    const tenants = await prisma.tenant.findMany({
      where: { status: { in: ["ACTIVE", "TRIAL"] }, deletedAt: null },
      select: { id: true, timezone: true },
    })

    for (const tenant of tenants) {
      const timezone = tenant.timezone || "America/Santiago"
      const ahoraLocal = toZonedTime(ahora, timezone)
      const hoyStr = format(ahoraLocal, "yyyy-MM-dd")
      const horaActual = ahoraLocal.getHours()
      const minutoActual = ahoraLocal.getMinutes()

      // ═══ TRANSICIÓN 1: PUBLICADO → CERRADO ═══
      // Obtener colegios del tenant con su horaCorte
      const colegios = await prisma.colegio.findMany({
        where: { tenantId: tenant.id, isActive: true, deletedAt: null },
        select: { id: true, horaCorte: true },
      })

      for (const colegio of colegios) {
        const [horaStr, minutoStr] = colegio.horaCorte.split(":")
        const horaCorteNum = parseInt(horaStr ?? "9", 10)
        const minutoCorteNum = parseInt(minutoStr ?? "0", 10)

        // ¿Ya pasó la hora de corte hoy?
        const cortePasado =
          horaActual > horaCorteNum ||
          (horaActual === horaCorteNum && minutoActual >= minutoCorteNum)

        if (cortePasado) {
          // Buscar menús PUBLICADOS de hoy para este colegio
          const menusHoy = await prisma.menu.findMany({
            where: {
              tenantId: tenant.id,
              colegioId: colegio.id,
              estado: "PUBLICADO",
              fecha: {
                gte: new Date(`${hoyStr}T00:00:00`),
                lt: new Date(`${hoyStr}T23:59:59.999`),
              },
            },
            select: { id: true },
          })

          for (const menu of menusHoy) {
            await prisma.menu.update({
              where: { id: menu.id },
              data: { estado: "CERRADO" },
            })
            cerrados++
          }
        }
      }

      // ═══ TRANSICIÓN 2: CERRADO → ARCHIVADO ═══
      // Menús CERRADOS con fecha anterior a hoy
      const menusAnteriores = await prisma.menu.findMany({
        where: {
          tenantId: tenant.id,
          estado: "CERRADO",
          fecha: {
            lt: new Date(`${hoyStr}T00:00:00`),
          },
        },
        select: { id: true },
      })

      for (const menu of menusAnteriores) {
        await prisma.menu.update({
          where: { id: menu.id },
          data: { estado: "ARCHIVADO" },
        })
        archivados++
      }
    }

    return NextResponse.json({
      success: true,
      cerrados,
      archivados,
      tenantsProcesados: tenants.length,
    })
  } catch (error) {
    console.error("[cron/transiciones-menu] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    )
  }
}
