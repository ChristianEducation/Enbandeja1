import Link from "next/link"
import { AlertTriangle, Home, RotateCcw } from "@enbandeja/ui/icons"

export const dynamic = "force-dynamic"

interface PagoErrorPageProps {
  searchParams: Promise<{ motivo?: string }>
}

const MENSAJES: Record<string, string> = {
  sin_token:
    "No recibimos la confirmación del pago. Si el cargo aparece en tu tarjeta, contáctanos.",
  pedido_no_encontrado: "No encontramos el pedido asociado a este pago.",
  stock_insuficiente:
    "El pago no se completó porque una opción se agotó. Si se realizó un cargo, será revertido.",
  error_transaccion: "Ocurrió un problema procesando el pago. No se generó tu pedido.",
  error_interno: "Ocurrió un problema procesando el pago. No se generó tu pedido.",
}

export default async function PagoErrorPage({ searchParams }: PagoErrorPageProps) {
  const params = await searchParams
  const motivo = params.motivo ?? "error_interno"
  const mensaje = MENSAJES[motivo] ?? MENSAJES.error_interno

  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center">
        <section className="w-full rounded-xl border border-border bg-surface-glass p-6 text-center shadow-glass">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/16">
            <AlertTriangle size={32} strokeWidth={1.5} className="text-warning" />
          </div>

          <h1 className="mb-3 font-display text-title font-bold tracking-tight text-foreground">
            No pudimos completar el pago
          </h1>
          <p className="font-sans text-body text-foreground-secondary">
            {mensaje}
          </p>

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
