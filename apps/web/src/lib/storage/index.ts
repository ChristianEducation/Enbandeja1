// ═══════════════════════════════════════════════════════════════════
// storage.ts — Upload y URL firmada para Supabase Storage
// ═══════════════════════════════════════════════════════════════════
// Usa SUPABASE_SERVICE_ROLE_KEY para operaciones server-side.
// URLs firmadas con expiración — NUNCA Storage público.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase URL o Service Role Key no configurados")
  }
  return createClient(url, key)
}

const BUCKET = process.env.SUPABASE_BUCKET_EXPORTACIONES || "exportaciones"

/**
 * Sube un buffer a Supabase Storage y retorna el path.
 */
export async function subirArchivo(
  buffer: Buffer,
  path: string,
  contentType: string = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true })

  if (error) {
    throw new Error(`Error subiendo archivo a Storage: ${error.message}`)
  }
  return path
}

/**
 * Genera URL firmada temporal para descargar un archivo.
 * Expiración default: 1 hora.
 */
export async function generarUrlFirmada(
  path: string,
  expiracionSegundos: number = 3600
): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiracionSegundos)

  if (error || !data) {
    throw new Error(`Error generando URL firmada: ${error?.message}`)
  }
  return data.signedUrl
}
