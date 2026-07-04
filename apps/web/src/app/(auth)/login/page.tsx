import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GoogleButton } from './google-button'

// ═══════════════════════════════════════════════════════════════════
// Login Page — Server Component
// ═══════════════════════════════════════════════════════════════════
// ADN visual: Dark + Azul Eléctrico + Bento Glass
// Bento Card centrado, radius 24px, Liquid Glass
// Mobile-first
// ═══════════════════════════════════════════════════════════════════

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect('/home')
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Logo y tagline */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-2">
          <span className="font-display text-display text-primary">E</span>
        </div>
        <h1 className="font-display text-title font-bold text-foreground">
          Enbandeja
        </h1>
        <p className="font-sans text-body text-foreground-secondary">
          Gestión de casinos escolares
        </p>
      </div>

      {/* Bento Card con Glass */}
      <div className="rounded-xl bg-surface-glass p-6 border border-border shadow-glass space-y-4">
        {/* Botón Google — Client Component (evita MissingCSRF) */}
        <GoogleButton />

        {/* Botón Apple — secondary ghost */}
        <button
          type="button"
          id="btn-login-apple"
          disabled
          className="flex w-full items-center justify-center gap-3 rounded-md bg-transparent border border-border-strong px-6 h-12 font-display font-semibold text-[15px] text-foreground hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Próximamente
        </button>

        {/* Separador */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-sans text-small text-foreground-tertiary">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Link a registro */}
        <Link
          href="/registro"
          id="link-registro"
          className="flex w-full items-center justify-center rounded-md bg-transparent border border-border-strong px-6 h-12 font-display font-semibold text-[15px] text-foreground hover:bg-surface transition-all duration-200"
        >
          Crear cuenta con email
        </Link>
      </div>

      {/* Footer link */}
      <p className="text-center font-sans text-small text-foreground-tertiary">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary hover:text-primary-hover transition-colors">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
