import Link from "next/link"
import { Home, RotateCcw, XCircle } from "@enbandeja/ui/icons"

export const dynamic = "force-dynamic"

interface PagoRechazadoPageProps {
  searchParams: Promise<{ motivo?: string }>
}

function obtenerCodigo(motivo?: string) {
  if (!motivo?.startsWith("response_code_")) return null
  return motivo.replace("response_code_", "")
}

export default async function PagoRechazadoPage({ searchParams }: PagoRechazadoPageProps) {
  const params = await searchParams
  const codigo = obtenerCodigo(params.motivo)

  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center">
        <section className="w-full rounded-xl border border-border bg-surface-glass p-6 text-center shadow-glass">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/16">
            <XCircle size={32} strokeWidth={1.5} className="text-warning" />
          </div>

          <h1 className="mb-3 font-display text-title font-bold tracking-tight text-foreground">
            Pago rechazado
          </h1>
          <p className="font-sans text-body text-foreground-secondary">
            El pago fue rechazado por el medio de pago. No se realizó ningún cargo.
            Puedes intentar con otra tarjeta.
          </p>
          {codigo && (
            <p className="mt-3 font-mono text-caption text-foreground-tertiary">
              Código de respuesta: {codigo}
            </p>
          )}

          <div className="mt-6 space-y-3">
            <Link
              href="/resumen"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-body font-semibold text-primary-foreground transition-all duration-200 ease-out hover:bg-primary-hover"
            >
              <RotateCcw size={18} strokeWidth={1.5} />
              Volver a intentar
            </Link>
            <Link
              href="/home"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-glass px-4 py-3 font-display text-body font-semibold text-foreground transition-all duration-200 ease-out hover:bg-surface-glass/80"
            >
              <Home size={18} strokeWidth={1.5} />
              Ir al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
