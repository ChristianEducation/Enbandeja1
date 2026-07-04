// ═══════════════════════════════════════════════════════════════════
// getPrecioParaComensal — Resolver precio de opción para un comensal
// ═══════════════════════════════════════════════════════════════════
// Patrón 1 del Agente Database.
//
// Recibe: db (TenantClient), opcionMenuId, comensalId
// Busca categoría del comensal, fallback a categoría default del colegio
// Retorna precio numérico (en CLP enteros, sin decimales)
// Maneja error si no hay precio configurado
// ═══════════════════════════════════════════════════════════════════

// Tipo genérico para aceptar tanto PrismaClient como el cliente extendido
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TenantClient = any

export class PrecioNoConfiguradoError extends Error {
  constructor(opcionMenuId: string, comensalId: string) {
    super(
      `No existe precio configurado para la opción ${opcionMenuId} del comensal ${comensalId}. Verifique que exista un PrecioOpcion para la categoría del comensal o la categoría default del colegio.`
    )
    this.name = 'PrecioNoConfiguradoError'
  }
}

export class ComensalNotFoundError extends Error {
  constructor(comensalId: string) {
    super(`No se encontró el comensal ${comensalId}.`)
    this.name = 'ComensalNotFoundError'
  }
}

export class CategoriaDefaultNotFoundError extends Error {
  constructor(colegioId: string) {
    super(
      `No existe categoría de precio default para el colegio ${colegioId}. Debe existir al menos una CategoriaPrecio con esDefault=true.`
    )
    this.name = 'CategoriaDefaultNotFoundError'
  }
}

/**
 * Resuelve el precio de una opción de menú para un comensal específico.
 *
 * Lógica:
 * 1. Busca el comensal y su categoriaPrecioId
 * 2. Si el comensal tiene categoría → la usa
 * 3. Si no tiene categoría → busca la categoría default del colegio
 * 4. Busca el PrecioOpcion para (opcionMenuId, categoriaPrecioId)
 * 5. Retorna el precio en CLP enteros
 *
 * @throws PrecioNoConfiguradoError si no existe PrecioOpcion
 * @throws ComensalNotFoundError si el comensal no existe
 * @throws CategoriaDefaultNotFoundError si el comensal no tiene categoría y el colegio no tiene default
 */
export async function getPrecioParaComensal(
  db: TenantClient,
  opcionMenuId: string,
  comensalId: string
): Promise<number> {
  // 1. Buscar comensal con su categoría y colegio
  const comensal = await db.comensal.findUnique({
    where: { id: comensalId },
    select: {
      id: true,
      categoriaPrecioId: true,
      colegioId: true,
    },
  })

  if (!comensal) {
    throw new ComensalNotFoundError(comensalId)
  }

  // 2. Resolver categoría de precio
  let categoriaPrecioId = comensal.categoriaPrecioId

  // 3. Fallback a categoría default del colegio si el comensal no tiene
  if (!categoriaPrecioId) {
    const categoriaDefault = await db.categoriaPrecio.findFirstOrThrow({
      where: {
        colegioId: comensal.colegioId,
        esDefault: true,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    })

    categoriaPrecioId = categoriaDefault.id
  }

  // 4. Buscar el precio para la combinación (opcionMenuId, categoriaPrecioId)
  const precioOpcion = await db.precioOpcion.findUnique({
    where: {
      opcionMenuId_categoriaPrecioId: {
        opcionMenuId,
        categoriaPrecioId,
      },
    },
    select: { precio: true },
  })

  if (!precioOpcion) {
    throw new PrecioNoConfiguradoError(opcionMenuId, comensalId)
  }

  // 5. Retornar precio en CLP enteros
  return precioOpcion.precio
}
