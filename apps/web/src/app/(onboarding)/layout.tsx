// ═══════════════════════════════════════════════════════════════════
// Layout Onboarding — Server Component
// ═══════════════════════════════════════════════════════════════════
// La ruta es pública en middleware para permitir el callback OAuth, pero el
// layout verifica la sesión en servidor antes de mostrar datos de onboarding.
//
// Progress bar de 3 pasos (código / comensal / confirmar)
// ADN visual: Dark + background, padding mobile-first
// ═══════════════════════════════════════════════════════════════════

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header con progress */}
      <header className="flex flex-col items-center gap-4 px-5 pt-8 pb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
          <span className="font-display text-heading text-primary font-bold">E</span>
        </div>
        <h2 className="font-display text-subheading font-semibold text-foreground">
          Configurar tu cuenta
        </h2>

        {/* Progress bar visual */}
        <div className="flex items-center gap-2 w-full max-w-xs">
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-border" />
          <div className="flex-1 h-1 rounded-full bg-border" />
        </div>
        <div className="flex justify-between w-full max-w-xs">
          <span className="font-sans text-caption text-primary">Código</span>
          <span className="font-sans text-caption text-foreground-tertiary">Comensal</span>
          <span className="font-sans text-caption text-foreground-tertiary">Listo</span>
        </div>
      </header>

      {/* Contenido del paso actual */}
      <main className="flex flex-1 flex-col items-center px-5 py-6">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
