'use client'

// ═══════════════════════════════════════════════════════════════════
// Formulario de Código de Casino — Client Component
// ═══════════════════════════════════════════════════════════════════
// Input de 5 chars con validación en tiempo real.
// Llama a /api/vincular/codigo y muestra resultado.
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { vincularCodigoSchema } from '@enbandeja/shared'

interface ColegioInfo {
  colegioId: string
  tenantId: string
  colegioNombre: string
}

export function CodigoForm() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [colegio, setColegio] = useState<ColegioInfo | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setCodigo(value)
    setError(null)
    setColegio(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validación Zod frontend
    const parsed = vincularCodigoSchema.safeParse({ codigoCasino: codigo })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Código inválido')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/vincular/codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoCasino: parsed.data.codigoCasino }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'No se pudo verificar el código')
        return
      }

      setColegio(data.data)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleContinue() {
    if (!colegio) return
    router.push(
      `/onboarding/comensal?colegioId=${colegio.colegioId}&tenantId=${colegio.tenantId}&nombre=${encodeURIComponent(colegio.colegioNombre)}`
    )
  }

  return (
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="space-y-2">
        <h3 className="font-display text-heading font-semibold text-foreground">
          Código del casino
        </h3>
        <p className="font-sans text-body text-foreground-secondary">
          Ingresa el código que te entregó el colegio de tu hijo/a.
          Lo encontrarás en la comunicación del casino escolar.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <input
            ref={inputRef}
            id="input-codigo-casino"
            type="text"
            value={codigo}
            onChange={handleInputChange}
            maxLength={6}
            autoComplete="off"
            autoFocus
            className="flex h-14 w-full rounded-md bg-surface border border-border px-4 py-2 font-mono text-[20px] text-center tracking-[0.3em] text-foreground placeholder:text-foreground-tertiary placeholder:tracking-normal placeholder:text-[15px] focus:outline-none focus:border-primary focus:shadow-glow-primary transition-all duration-200"
            placeholder="Ej: HF4NK"
          />
          {error && (
            <p className="font-sans text-small text-warning text-center">{error}</p>
          )}
        </div>

        {!colegio && (
          <button
            type="submit"
            id="btn-verificar-codigo"
            disabled={codigo.length < 5 || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 h-12 font-display font-semibold text-[15px] text-primary-foreground hover:bg-primary-hover hover:shadow-glow-primary active:bg-primary-pressed disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar código'
            )}
          </button>
        )}
      </form>

      {/* Resultado existoso */}
      {colegio && (
        <div className="animate-fade-in space-y-4">
          <div className="rounded-xl bg-surface-glass p-5 border border-success/30 shadow-glass space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 border border-success/20">
                <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="font-sans text-small text-foreground-secondary">
                  Casino encontrado
                </p>
                <p className="font-display text-subheading font-semibold text-foreground">
                  {colegio.colegioNombre}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="btn-continuar-colegio"
            onClick={handleContinue}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 h-12 font-display font-semibold text-[15px] text-primary-foreground hover:bg-primary-hover hover:shadow-glow-primary active:bg-primary-pressed transition-all duration-200"
          >
            Continuar
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
