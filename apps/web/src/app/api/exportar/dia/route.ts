// ═══════════════════════════════════════════════════════════════════
// GET /api/exportar/dia — Exportar pedidos del día (Excel o PDF)
// ═══════════════════════════════════════════════════════════════════
// Síncrono (pocos pedidos por día)
// ?formato=excel → xlsx con lista de pedidos
// ?formato=pdf → PDF agrupado por curso
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"
import { toZonedTime } from "date-fns-tz"
import { format } from "date-fns"

export const GET = withAuth(async (req: NextRequest, context: SessionContext) => {
  if (context.role !== "OPERADOR" && context.role !== "OWNER") {
    return NextResponse.json({ success: false, error: "Solo operador u owner" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const formato = searchParams.get("formato") || "excel"

  const db = createTenantClient(context.tenantId, context.userId)

  // Obtener timezone
  const tenant = await db.tenant.findFirst({
    where: { id: context.tenantId },
    select: { timezone: true },
  })
  const timezone = tenant?.timezone || "America/Santiago"
  const hoyStr = format(toZonedTime(new Date(), timezone), "yyyy-MM-dd")

  // Query pedidos del día
  const pedidos = await db.pedido.findMany({
    where: {
      estado: { in: ["PAGADO", "RETIRADO", "NO_RETIRADO"] },
      Items: {
        some: {
          fecha: {
            gte: new Date(`${hoyStr}T00:00:00`),
            lt: new Date(`${hoyStr}T23:59:59.999`),
          },
        },
      },
    },
    include: {
      Items: {
        include: {
          Comensal: {
            select: { nombre: true, apellido: true, curso: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Aplanar datos para exportación
  const rows = pedidos.flatMap((p) =>
    p.Items.filter((i: any) => !i.cancelado).map((item: any) => ({
      comensal: `${item.Comensal.nombre} ${item.Comensal.apellido}`,
      curso: item.Comensal.curso || "Sin curso",
      item: item.nombre,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
      retirado: item.retirado ? "Sí" : "No",
    }))
  )

  if (formato === "excel") {
    return exportarExcel(rows, hoyStr)
  } else {
    return exportarPDF(rows, hoyStr)
  }
})

async function exportarExcel(
  rows: { comensal: string; curso: string; item: string; cantidad: number; subtotal: number; retirado: string }[],
  fecha: string
) {
  const XLSX = await import("xlsx-js-style")

  const wsData = [
    ["Comensal", "Curso", "Item", "Cantidad", "Subtotal (CLP)", "Retirado"],
    ...rows.map((r) => [r.comensal, r.curso, r.item, r.cantidad, r.subtotal, r.retirado]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Estilo header
  ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 10 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Pedidos")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pedidos-${fecha}.xlsx"`,
    },
  })
}

async function exportarPDF(
  rows: { comensal: string; curso: string; item: string; cantidad: number; subtotal: number; retirado: string }[],
  fecha: string
) {
  // Para PDF usamos un HTML simple convertido a respuesta de texto
  // @react-pdf/renderer requiere React Server Components con soporte especial
  // Implementamos con HTML → el cliente puede imprimir como PDF
  const cursos = [...new Set(rows.map((r) => r.curso))].sort()

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pedidos ${fecha}</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    h2 { font-size: 14px; margin-top: 16px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 12px; }
    th, td { padding: 4px 8px; text-align: left; border-bottom: 1px solid #eee; }
    th { font-weight: 600; background: #f5f5f5; }
  </style></head><body>`
  html += `<h1>Lista del día — ${fecha}</h1>`

  for (const curso of cursos) {
    const itemsCurso = rows.filter((r) => r.curso === curso)
    html += `<h2>${curso} (${itemsCurso.length} items)</h2>`
    html += `<table><tr><th>Comensal</th><th>Item</th><th>Cant.</th><th>Subtotal</th><th>Retirado</th></tr>`
    for (const r of itemsCurso) {
      html += `<tr><td>${r.comensal}</td><td>${r.item}</td><td>${r.cantidad}</td><td>$${r.subtotal.toLocaleString("es-CL")}</td><td>${r.retirado}</td></tr>`
    }
    html += `</table>`
  }

  html += `</body></html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${fecha}.html"`,
    },
  })
}
