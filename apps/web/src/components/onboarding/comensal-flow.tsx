'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BuscadorComensal } from '@enbandeja/ui'
import { ComensalForm } from './comensal-form'

export function ComensalFlow({ cursosDisponibles }: { cursosDisponibles: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const colegioId = searchParams.get('colegioId') ?? ''
  const tenantId = searchParams.get('tenantId') ?? ''
  const colegioNombre = searchParams.get('nombre') ?? 'tu colegio'

  const [modo, setModo] = useState<'BUSQUEDA' | 'MANUAL' | 'CONFIRMACION'>(
    cursosDisponibles.length > 0 ? 'BUSQUEDA' : 'MANUAL'
  )
  const [comensalSeleccionadoId, setComensalSeleccionadoId] = useState<string | null>(null)
  
  const [vinculo, setVinculo] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const vinculoOptions = [
    { value: 'PADRE', label: 'Padre' },
    { value: 'MADRE', label: 'Madre' },
    { value: 'ADULTO_RESPONSABLE', label: 'Adulto responsable' },
    { value: 'ESTUDIANTE', label: 'Estudiante (yo mismo)' },
  ] as const

  const handleSeleccionBuscador = (comensalId: string | null) => {
    if (comensalId === null) {
      setModo('MANUAL')
    } else {
      setComensalSeleccionadoId(comensalId)
      setModo('CONFIRMACION')
    }
  }

  const handleConfirmarPrecargado = async () => {
    if (!vinculo) {
      setError('Debes seleccionar tu relación')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        comensalId: comensalSeleccionadoId,
        colegioId,
        vinculo,
      }

      const res = await fetch('/api/comensales/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Error vinculando al comensal')
      }

      router.push('/home')
    } catch (err: any) {
      setError(err.message || 'Error de conexión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!colegioId || !tenantId) {
    return (
      <div className="space-y-4">
        <p className="font-sans text-body text-warning">
          Información de colegio no disponible. Vuelve al paso anterior.
        </p>
        <button
          onClick={() => router.push('/onboarding/codigo')}
          className="flex items-center gap-2 rounded-md bg-transparent border border-border-strong px-6 h-12 font-display font-semibold text-[15px] text-foreground hover:bg-surface transition-all duration-200"
        >
          ← Volver al código
        </button>
      </div>
    )
  }

  if (modo === 'MANUAL') {
    return <ComensalForm />
  }

  if (modo === 'BUSQUEDA') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-display text-heading font-semibold text-foreground">
            Encuentra a tu hijo/a
          </h3>
          <p className="font-sans text-body text-foreground-secondary">
            Busca en la lista oficial proporcionada por <span className="text-foreground font-medium">{colegioNombre}</span>
          </p>
        </div>
        <BuscadorComensal
          colegioId={colegioId}
          tenantId={tenantId}
          cursosDisponibles={cursosDisponibles}
          onSeleccionar={handleSeleccionBuscador}
        />
      </div>
    )
  }

  // MODO CONFIRMACION
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-display text-heading font-semibold text-foreground">
          Confirmar vinculación
        </h3>
        <p className="font-sans text-body text-foreground-secondary">
          Casi listo. ¿Eres el responsable de este alumno en <span className="text-foreground font-medium">{colegioNombre}</span>?
        </p>
      </div>

      <div className="rounded-xl bg-surface-glass border border-border p-6 shadow-glass space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="select-vinculo-precargado" className="block font-sans text-small text-foreground-secondary">
            Tu relación con el alumno
          </label>
          <select
            id="select-vinculo-precargado"
            value={vinculo}
            onChange={(e) => setVinculo(e.target.value)}
            className="flex h-12 w-full rounded-md bg-surface border border-border px-4 py-2 font-sans text-[15px] text-foreground focus:outline-none focus:border-primary focus:shadow-glow-primary transition-all duration-200 appearance-none"
          >
            <option value="" disabled className="bg-surface text-foreground-tertiary">Selecciona...</option>
            {vinculoOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        
        {error && (
          <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
            <p className="font-sans text-small text-warning">{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirmarPrecargado}
          disabled={isLoading || !vinculo}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 h-12 font-display font-semibold text-[15px] text-primary-foreground hover:bg-primary-hover hover:shadow-glow-primary active:bg-primary-pressed disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verificando...
            </>
          ) : (
            'Confirmar y continuar'
          )}
        </button>
        
        <button
          onClick={() => setModo('BUSQUEDA')}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-transparent border border-border-strong px-6 h-12 font-display font-semibold text-[15px] text-foreground hover:bg-surface transition-all duration-200"
        >
          No, seleccionar otro
        </button>
      </div>
    </div>
  )
}
