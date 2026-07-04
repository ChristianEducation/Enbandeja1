import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GoogleButton } from '../login/google-button'

// ═══════════════════════════════════════════════════════════════════
// Registro Page — Server Component
// ═══════════════════════════════════════════════════════════════════
// ADN visual: Dark + Azul Eléctrico + Bento Glass
// Registro vía Google OAuth únicamente.
// Mobile-first
// ═══════════════════════════════════════════════════════════════════

export default async function RegistroPage() {
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
          Crear cuenta
        </h1>
        <p className="font-sans text-body text-foreground-secondary">
          Regístrate usando tu cuenta de Google
        </p>
      </div>

      {/* Bento Card con Glass */}
      <div className="rounded-xl bg-surface-glass p-6 border border-border shadow-glass space-y-4">
        <GoogleButton label="Registrarse con Google" id="btn-registro-google" />
        <button
          type="button"
          id="btn-registro-submit"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-md border border-border-strong px-6 font-display text-[15px] font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Registro con email próximamente
        </button>
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
