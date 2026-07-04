"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Loader2, Search, User } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE: BuscadorComensal (Precarga)
// ═══════════════════════════════════════════════════════════════════
// UI para el flujo de onboarding cuando un colegio tiene alumnos
// precargados. Permite filtrar por curso y luego buscar por nombre.
// ═══════════════════════════════════════════════════════════════════

export interface BuscadorComensalProps {
  colegioId: string
  tenantId: string
  cursosDisponibles: string[]
  onSeleccionar: (comensalId: string | null) => void // null activa el modo manual en el padre
}

type ComensalResult = {
  id: string
  nombre: string
  apellido: string
  curso: string
}

export function BuscadorComensal({
  colegioId,
  tenantId,
  cursosDisponibles,
  onSeleccionar,
}: BuscadorComensalProps) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ComensalResult[]>([])
  const [cargando, setCargando] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Efecto de búsqueda con Debounce (300ms)
  useEffect(() => {
    if (!cursoSeleccionado || query.length < 2) {
      setResultados([])
      setCargando(false)
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    setCargando(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const u = new URL('/api/comensales/buscar', window.location.origin)
        u.searchParams.set('tenantId', tenantId)
        u.searchParams.set('colegioId', colegioId)
        u.searchParams.set('curso', cursoSeleccionado)
        u.searchParams.set('q', query)

        const response = await fetch(u.toString())
        
        if (!response.ok) {
          throw new Error('Error en búsqueda')
        }
        
        const data = await response.json()
        setResultados(data.comensales || [])
      } catch (err) {
        console.error(err)
        setResultados([])
      } finally {
        setCargando(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, cursoSeleccionado, tenantId, colegioId])

  return (
    <div className="w-full space-y-5">
      
      {/* 1. Selector de Curso */}
      <div className="space-y-2">
        <label htmlFor="curso-select" className="text-small font-sans font-medium text-foreground">
          Selecciona el curso
        </label>
        <select
          id="curso-select"
          value={cursoSeleccionado || ''}
          onChange={(e) => {
            setCursoSeleccionado(e.target.value || null)
            setQuery('')
          }}
          className="w-full h-12 rounded-md bg-surface border border-border px-4 text-[15px] font-sans text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
        >
          <option value="" className="bg-surface text-foreground" disabled hidden>
            Seleccionar curso...
          </option>
          {cursosDisponibles.map((c) => (
            <option key={c} value={c} className="bg-surface text-foreground">{c}</option>
          ))}
        </select>
      </div>

      {/* 2. Input de Búsqueda (solo si hay curso) */}
      {cursoSeleccionado && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="nombre-search" className="text-small font-sans font-medium text-foreground">
            Busca a tu hijo/a
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground-tertiary">
              {cargando ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Search className="h-4 w-4" />}
            </div>
            <input
              id="nombre-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Martín..."
              className="w-full h-12 rounded-md bg-surface border border-border pl-10 pr-4 text-[15px] font-sans text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* 3. Lista de Resultados */}
      {cursoSeleccionado && query.length >= 2 && (
        <div className="space-y-2 mt-4 animate-in fade-in duration-300">
          <p className="text-small font-sans font-medium text-foreground-tertiary mb-3">
            Resultados para "{query}"
          </p>
          
          {resultados.length === 0 && !cargando && (
            <div className="rounded-xl bg-surface-glass border border-border p-6 text-center shadow-glass">
              <p className="text-body text-foreground-tertiary font-sans">
                No encontramos a nadie con ese nombre en este curso.
              </p>
            </div>
          )}

          {resultados.length > 0 && (
            <div className="rounded-xl bg-surface-glass border border-border divide-y divide-border overflow-hidden shadow-glass">
              {resultados.map((comensal) => (
                <button
                  key={comensal.id}
                  onClick={() => onSeleccionar(comensal.id)}
                  className="w-full flex items-center justify-between text-left p-4 hover:bg-surface transition-colors focus:outline-none focus:bg-surface"
                >
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-[15px] text-foreground block">
                      {comensal.nombre} {comensal.apellido}
                    </span>
                    <span className="font-sans text-small text-foreground-tertiary block">
                      {comensal.curso}
                    </span>
                  </div>
                  <User className="h-4 w-4 text-primary opacity-60" />
                </button>
              ))}
            </div>
          )}

          {/* Botón Salvavidas SIEMPRE VISIBLE cuando se busca */}
          <div className="pt-4 pb-2 text-center">
            <button
              onClick={() => onSeleccionar(null)}
              className="font-sans text-small font-medium text-primary hover:underline underline-offset-4 focus:outline-none"
            >
              Mi hijo/a no está en la lista
            </button>
          </div>
        </div>
      )}
      
    </div>
  )
}
