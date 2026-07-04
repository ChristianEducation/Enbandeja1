// ═══════════════════════════════════════════════════════════════════
// POST /api/setup/importar-comensales — Importar CSV de comensales
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/withAuth"
import { createTenantClient, prisma } from "@enbandeja/database"
import type { SessionContext } from "@enbandeja/shared"

export const POST = withAuth(
  async (req: NextRequest, context: SessionContext) => {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No se envió archivo" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((l) => l.trim())

    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: "El archivo está vacío o solo tiene encabezado" }, { status: 400 })
    }

    // Obtener colegios del tenant para mapeo
    const colegios = await prisma.colegio.findMany({
      where: { tenantId: context.tenantId, isActive: true, deletedAt: null },
      select: { id: true, nombre: true },
    })
    const colegioMap = Object.fromEntries(colegios.map((c) => [c.nombre.toLowerCase(), c.id]))
    const primerColegioId = colegios[0]?.id

    const db = createTenantClient(context.tenantId, context.userId)
    const errores: string[] = []
    let creados = 0

    // Saltar encabezado (línea 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i] ?? ""
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
      const nombre = cols[0] || ""
      const apellido = cols[1] || ""
      const curso = cols[2] || ""
      const colegioNombre = cols[3] || ""

      if (!nombre || !apellido) {
        errores.push(`Fila ${i + 1}: nombre o apellido vacío`)
        continue
      }

      const colegioId = (colegioNombre ? colegioMap[colegioNombre.toLowerCase()] : undefined) ?? primerColegioId ?? ""

      if (!colegioId) {
        errores.push(`Fila ${i + 1}: no se encontró colegio`)
        continue
      }

      try {
        await db.comensal.create({
          data: {
            tenantId: context.tenantId,
            colegioId,
            nombre,
            apellido,
            curso: curso || "",
            isActive: true,
          },
        })
        creados++
      } catch (e: any) {
        errores.push(`Fila ${i + 1}: ${e.message || "Error al crear"}`)
      }
    }

    return NextResponse.json({ success: true, creados, errores })
  }
)
