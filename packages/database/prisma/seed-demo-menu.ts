// ═══════════════════════════════════════════════════════════════════
// Seed demo de menús publicados para la próxima semana
// ═══════════════════════════════════════════════════════════════════
// Se ejecuta con: pnpm --filter=@enbandeja/database db:seed:demo
// Idempotente: upsert de Menu por colegioId+fecha, opciones por nombre
// dentro del menú, precios por opcionMenuId+categoriaPrecioId.
// ═══════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_TENANT_SLUG = 'casino-demo'

const MENUS = [
  {
    opciones: [
      {
        nombre: 'Cazuela de vacuno',
        descripcion: 'Cazuela tradicional con zapallo, papa, arroz y verduras.',
        categoria: 'Tradicional',
        precio: 4200,
      },
      {
        nombre: 'Lasaña de verduras',
        descripcion: 'Lasaña vegetariana con salsa de tomate y queso gratinado.',
        categoria: 'Vegetariana',
        precio: 3900,
      },
    ],
  },
  {
    opciones: [
      {
        nombre: 'Pollo arvejado con arroz',
        descripcion: 'Pollo guisado con arvejas, zanahoria y arroz graneado.',
        categoria: 'Tradicional',
        precio: 4100,
      },
      {
        nombre: 'Charquicán vegetariano',
        descripcion: 'Guiso de verduras de temporada con huevo duro.',
        categoria: 'Vegetariana',
        precio: 3800,
      },
    ],
  },
  {
    opciones: [
      {
        nombre: 'Pastel de choclo',
        descripcion: 'Pastel de choclo individual con ensalada chilena.',
        categoria: 'Tradicional',
        precio: 4500,
      },
      {
        nombre: 'Porotos granados vegetarianos',
        descripcion: 'Porotos granados con mazamorra y ensalada fresca.',
        categoria: 'Vegetariana',
        precio: 3900,
      },
      {
        nombre: 'Pescado frito con puré',
        descripcion: 'Filete de pescado frito con puré casero y ensalada.',
        categoria: 'Pescado',
        precio: 4400,
      },
    ],
  },
  {
    opciones: [
      {
        nombre: 'Porotos granados con ensalada',
        descripcion: 'Porotos granados caseros con tomate y cebolla.',
        categoria: 'Tradicional',
        precio: 3900,
      },
      {
        nombre: 'Tortilla de verduras con arroz',
        descripcion: 'Tortilla horneada con verduras y arroz primavera.',
        categoria: 'Vegetariana',
        precio: 3700,
      },
    ],
  },
  {
    opciones: [
      {
        nombre: 'Charquicán con huevo',
        descripcion: 'Charquicán casero con huevo frito y ensalada surtida.',
        categoria: 'Tradicional',
        precio: 4000,
      },
      {
        nombre: 'Pasta primavera',
        descripcion: 'Pasta con verduras salteadas y salsa de tomate natural.',
        categoria: 'Vegetariana',
        precio: 3800,
      },
      {
        nombre: 'Pollo al horno con papas doradas',
        descripcion: 'Trutro de pollo al horno con papas doradas y ensalada.',
        categoria: 'Tradicional',
        precio: 4300,
      },
    ],
  },
] as const

function getDatePartsInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  }
}

function startOfDateAsUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day))
}

function getNextWeekMonday(timezone: string) {
  const todayParts = getDatePartsInTimezone(new Date(), timezone)
  const todayUtc = startOfDateAsUtc(todayParts.year, todayParts.month, todayParts.day)
  const dayOfWeek = todayUtc.getUTCDay()
  const daysUntilNextMonday = ((8 - dayOfWeek) % 7) || 7
  const nextMonday = new Date(todayUtc)
  nextMonday.setUTCDate(todayUtc.getUTCDate() + daysUntilNextMonday)
  return nextMonday
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setUTCDate(copy.getUTCDate() + days)
  return copy
}

async function main() {
  console.log('Iniciando seed demo de menús...')

  const tenant = await prisma.tenant.findUnique({
    where: { slug: DEMO_TENANT_SLUG },
    select: { id: true, name: true, timezone: true },
  })

  if (!tenant) {
    throw new Error(`No existe tenant demo con slug ${DEMO_TENANT_SLUG}. Ejecuta db:seed primero.`)
  }

  let colegio = await prisma.colegio.findFirst({
    where: {
      tenantId: tenant.id,
      isActive: true,
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, nombre: true },
  })

  if (!colegio) {
    const demoColegio = await prisma.colegio.findUnique({
      where: { codigoCasino: 'DEMO1' },
      select: { id: true },
    })

    colegio = demoColegio
      ? await prisma.colegio.update({
          where: { id: demoColegio.id },
          data: {
            tenantId: tenant.id,
            nombre: 'Colegio San Patricio',
            direccion: 'Av. Las Condes 1234, Santiago',
            horaCorte: '09:00',
            kioscoActivo: false,
            isActive: true,
            deletedAt: null,
          },
          select: { id: true, nombre: true },
        })
      : await prisma.colegio.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Colegio San Patricio',
            codigoCasino: 'DEMO1',
            direccion: 'Av. Las Condes 1234, Santiago',
            horaCorte: '09:00',
            kioscoActivo: false,
          },
          select: { id: true, nombre: true },
        })
  }

  let categoriaPrecio = await prisma.categoriaPrecio.findFirst({
    where: {
      tenantId: tenant.id,
      colegioId: colegio.id,
      esDefault: true,
      isActive: true,
      deletedAt: null,
    },
    orderBy: { orden: 'asc' },
    select: { id: true, nombre: true },
  })

  if (!categoriaPrecio) {
    categoriaPrecio = await prisma.categoriaPrecio.create({
      data: {
        tenantId: tenant.id,
        colegioId: colegio.id,
        nombre: 'General',
        descripcion: 'Precio estándar para todos los comensales',
        esDefault: true,
        orden: 0,
      },
      select: { id: true, nombre: true },
    })
  }

  const firstDate = getNextWeekMonday(tenant.timezone)
  console.log(`Tenant: ${tenant.name}`)
  console.log(`Colegio: ${colegio.nombre}`)
  console.log(`Categoria precio: ${categoriaPrecio.nombre}`)

  for (const [dayIndex, menuDefinition] of MENUS.entries()) {
    const fecha = addDays(firstDate, dayIndex)
    const menu = await prisma.menu.upsert({
      where: {
        colegioId_fecha: {
          colegioId: colegio.id,
          fecha,
        },
      },
      update: {
        tenantId: tenant.id,
        estado: 'PUBLICADO',
        deletedAt: null,
      },
      create: {
        tenantId: tenant.id,
        colegioId: colegio.id,
        fecha,
        estado: 'PUBLICADO',
      },
    })

    for (const [optionIndex, optionDefinition] of menuDefinition.opciones.entries()) {
      const existingOption = await prisma.opcionMenu.findFirst({
        where: {
          tenantId: tenant.id,
          menuId: menu.id,
          nombre: optionDefinition.nombre,
          deletedAt: null,
        },
        select: { id: true },
      })

      const optionData = {
        tenantId: tenant.id,
        menuId: menu.id,
        nombre: optionDefinition.nombre,
        descripcion: optionDefinition.descripcion,
        categoria: optionDefinition.categoria,
        stockMax: 120,
        stockActual: 120,
        estado: 'ACTIVA' as const,
        orden: optionIndex,
        deletedAt: null,
      }

      const opcion = existingOption
        ? await prisma.opcionMenu.update({
            where: { id: existingOption.id },
            data: optionData,
          })
        : await prisma.opcionMenu.create({
            data: optionData,
          })

      await prisma.precioOpcion.upsert({
        where: {
          opcionMenuId_categoriaPrecioId: {
            opcionMenuId: opcion.id,
            categoriaPrecioId: categoriaPrecio.id,
          },
        },
        update: {
          tenantId: tenant.id,
          precio: optionDefinition.precio,
          deletedAt: null,
        },
        create: {
          tenantId: tenant.id,
          opcionMenuId: opcion.id,
          categoriaPrecioId: categoriaPrecio.id,
          precio: optionDefinition.precio,
        },
      })
    }

    console.log(`  ✓ ${fecha.toISOString().slice(0, 10)} publicado con ${menuDefinition.opciones.length} opciones`)
  }

  console.log('Seed demo de menús completado.')
}

main()
  .catch((error) => {
    console.error('Error en seed demo de menús:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
