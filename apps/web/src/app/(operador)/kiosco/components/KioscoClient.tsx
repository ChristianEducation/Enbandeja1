"use client"
// ═══════════════════════════════════════════════════════════════════
// KioscoClient — Gestión de productos del kiosco
// ═══════════════════════════════════════════════════════════════════
// CRUD de ProductoKiosco y CategoriaKiosco
// Botón reponer stock
// Exportar Excel / PDF
// ═══════════════════════════════════════════════════════════════════
import React, { useState } from "react"
import { formatCLP } from "@enbandeja/shared"
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  Download,
  FileText,
  Loader2,
  RotateCcw,
} from "@enbandeja/ui/icons"
import type { ProductoKioscoItem, CategoriaKioscoItem } from "../page"

interface KioscoClientProps {
  productos: ProductoKioscoItem[]
  categorias: CategoriaKioscoItem[]
  tieneKiosco: boolean
}

export function KioscoClient({
  productos,
  categorias,
  tieneKiosco,
}: KioscoClientProps) {
  const [mostrarFormProducto, setMostrarFormProducto] = useState(false)
  const [editandoProducto, setEditandoProducto] = useState<string | null>(null)
  const [reponiendo, setReponiendo] = useState<string | null>(null)
  const [exportando, setExportando] = useState<string | null>(null)

  // Form producto
  const [formNombre, setFormNombre] = useState("")
  const [formDescripcion, setFormDescripcion] = useState("")
  const [formPrecio, setFormPrecio] = useState("")
  const [formStock, setFormStock] = useState("")
  const [formCategoria, setFormCategoria] = useState("")

  const resetForm = () => {
    setFormNombre("")
    setFormDescripcion("")
    setFormPrecio("")
    setFormStock("")
    setFormCategoria("")
    setEditandoProducto(null)
    setMostrarFormProducto(false)
  }

  const handleGuardarProducto = async () => {
    const body = {
      id: editandoProducto || undefined,
      nombre: formNombre,
      descripcion: formDescripcion || null,
      precio: parseInt(formPrecio) || 0,
      stockDiario: parseInt(formStock) || null,
      categoriaKioscoId: formCategoria || null,
    }

    const url = editandoProducto
      ? "/api/kiosco/producto"
      : "/api/kiosco/producto"

    try {
      const res = await fetch(url, {
        method: editandoProducto ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        resetForm()
        window.location.reload()
      }
    } catch {
      // Error silencioso
    }
  }

  const handleReponerStock = async (productoId: string) => {
    setReponiendo(productoId)
    try {
      const res = await fetch("/api/kiosco/reponer-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId }),
      })
      const data = await res.json()
      if (data.success) {
        window.location.reload()
      }
    } catch {
      // Error silencioso
    } finally {
      setReponiendo(null)
    }
  }

  const handleExportar = async (formato: "excel" | "pdf") => {
    setExportando(formato)
    try {
      const res = await fetch(`/api/exportar/dia?formato=${formato}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `pedidos-dia.${formato === "excel" ? "xlsx" : "pdf"}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // Error silencioso
    } finally {
      setExportando(null)
    }
  }

  if (!tieneKiosco) {
    return (
      <div className="p-5 md:p-8">
        <h1 className="font-display text-title font-bold text-foreground tracking-tight">
          Kiosco
        </h1>
        <div className="mt-8 rounded-xl bg-surface-glass border border-border p-8 text-center">
          <Package size={32} strokeWidth={1.5} className="text-foreground-disabled mx-auto mb-3" />
          <p className="font-display text-body font-semibold text-foreground-secondary">
            No hay colegios con kiosco activo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-title font-bold text-foreground tracking-tight">
            Kiosco
          </h1>
          <p className="font-sans text-body text-foreground-secondary mt-1">
            {productos.length} producto{productos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportar("excel")}
            disabled={exportando !== null}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
            type="button"
          >
            {exportando === "excel" ? (
              <Loader2 size={14} strokeWidth={2} className="animate-spin" />
            ) : (
              <Download size={14} strokeWidth={1.5} />
            )}
            Excel
          </button>
          <button
            onClick={() => handleExportar("pdf")}
            disabled={exportando !== null}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
            type="button"
          >
            {exportando === "pdf" ? (
              <Loader2 size={14} strokeWidth={2} className="animate-spin" />
            ) : (
              <FileText size={14} strokeWidth={1.5} />
            )}
            PDF
          </button>
          <button
            onClick={() => { resetForm(); setMostrarFormProducto(true) }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-small font-semibold hover:bg-primary-hover transition-colors"
            type="button"
          >
            <Plus size={16} strokeWidth={1.5} />
            Producto
          </button>
        </div>
      </div>

      {/* Formulario producto */}
      {mostrarFormProducto && (
        <div className="rounded-xl bg-surface-glass border border-border p-5 space-y-3">
          <h3 className="font-display text-heading font-semibold text-foreground">
            {editandoProducto ? "Editar producto" : "Nuevo producto"}
          </h3>
          <input
            type="text"
            placeholder="Nombre"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Precio (CLP)"
              value={formPrecio}
              onChange={(e) => setFormPrecio(e.target.value)}
              className="px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="number"
              placeholder="Stock diario"
              value={formStock}
              onChange={(e) => setFormStock(e.target.value)}
              className="px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {categorias.length > 0 && (
            <select
              value={formCategoria}
              onChange={(e) => setFormCategoria(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGuardarProducto}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-small font-semibold hover:bg-primary-hover transition-colors"
              type="button"
            >
              Guardar
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-surface-glass border border-border font-display text-small font-medium text-foreground-secondary hover:text-foreground transition-colors"
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div className="space-y-2">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className={`rounded-xl bg-surface-glass border border-border p-4 flex items-center gap-4 ${
              !producto.isActive ? "opacity-50" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-display text-body font-semibold text-foreground truncate">
                {producto.nombre}
              </p>
              {producto.descripcion && (
                <p className="font-sans text-small text-foreground-secondary truncate">
                  {producto.descripcion}
                </p>
              )}
              {producto.categoriaNombre && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-caption font-display font-medium bg-primary/10 text-primary mt-1">
                  {producto.categoriaNombre}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="font-display text-body font-bold text-foreground">
                {formatCLP(producto.precio)}
              </p>
              <p className="font-sans text-small text-foreground-secondary">
                Stock: {producto.stockActual ?? "∞"}{producto.stockDiario ? ` / ${producto.stockDiario}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {producto.stockDiario && (
                <button
                  onClick={() => handleReponerStock(producto.id)}
                  disabled={reponiendo === producto.id}
                  className="p-2 rounded-full hover:bg-success/10 transition-colors"
                  title="Reponer stock"
                  type="button"
                >
                  {reponiendo === producto.id ? (
                    <Loader2 size={16} strokeWidth={2} className="animate-spin text-success" />
                  ) : (
                    <RotateCcw size={16} strokeWidth={1.5} className="text-success" />
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setFormNombre(producto.nombre)
                  setFormDescripcion(producto.descripcion || "")
                  setFormPrecio(producto.precio.toString())
                  setFormStock(producto.stockDiario?.toString() || "")
                  setFormCategoria(producto.categoriaKioscoId || "")
                  setEditandoProducto(producto.id)
                  setMostrarFormProducto(true)
                }}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                title="Editar"
                type="button"
              >
                <Edit3 size={16} strokeWidth={1.5} className="text-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
