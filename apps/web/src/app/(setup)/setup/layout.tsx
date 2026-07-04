// ═══════════════════════════════════════════════════════════════════
// /setup Layout — Wizard de onboarding self-service
// ═══════════════════════════════════════════════════════════════════
// CRÍTICO: Este layout NO verifica suscripción.
// El comercio se está registrando, aún no tiene suscripción activa.
// ═══════════════════════════════════════════════════════════════════

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@enbandeja/database"

const STEPS = [
  { num: 1, label: "Empresa", href: "/setup/empresa" },
  { num: 2, label: "Colegio", href: "/setup/colegio" },
  { num: 3, label: "Pasarela", href: "/setup/pasarela" },
  { num: 4, label: "Comensales", href: "/setup/comensales" },
  { num: 5, label: "Precios", href: "/setup/categorias" },
  { num: 6, label: "Menú", href: "/setup/menu" },
]

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (!session.activeTenantId) redirect("/onboarding/codigo")

  // Obtener progreso del onboarding
  const progress = await prisma.onboardingProgress.findUnique({
    where: { tenantId: session.activeTenantId },
  })

  // Determinar paso actual basado en progreso
  let currentStep = 1
  if (progress) {
    if (progress.datosEmpresa) currentStep = 2
    if (progress.primerColegio) currentStep = 3
    if (progress.conectoMercadoPago) currentStep = 4
    if (progress.comensalesCargados) currentStep = 5
    if (progress.categoriasPrecios) currentStep = 6
    if (progress.primerMenuPublicado) currentStep = 7 // completado
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h1 className="font-display text-heading font-bold text-foreground">
          Configura tu cuenta
        </h1>
        <p className="font-sans text-small text-foreground-secondary mt-0.5">
          Paso {Math.min(currentStep, 6)} de 6
        </p>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex items-center gap-1">
          {STEPS.map((step) => {
            const completed = step.num < currentStep
            const active = step.num === currentStep || (currentStep > 6 && step.num === 6)
            return (
              <div
                key={step.num}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  completed
                    ? "bg-primary"
                    : active
                    ? "bg-primary/40"
                    : "bg-foreground-disabled/20"
                }`}
                title={step.label}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-1">
          {STEPS.map((step) => (
            <span
              key={step.num}
              className={`font-sans text-caption ${
                step.num <= currentStep ? "text-primary" : "text-foreground-disabled"
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
