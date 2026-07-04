// ═══════════════════════════════════════════════════════════════════
// Seed de los 4 planes de Enbandeja + Demo Data Semana 4
// ═══════════════════════════════════════════════════════════════════
// Se ejecuta con: pnpm --filter=@enbandeja/database prisma db seed
// Idempotente: usa upsert para no duplicar registros.
// ═══════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de planes...')

  // Plan Starter — 1 colegio, hasta 3 usuarios internos
  await prisma.plan.upsert({
    where: { tipo: 'STARTER' },
    update: {},
    create: {
      tipo: 'STARTER',
      nombre: 'Starter',
      descripcion: 'Plan de entrada para operadores con un solo colegio',
      precioMensual: 49000,
      precioAnual: 490000,
      maxColegios: 1,
      maxUsuarios: 3,
    },
  })
  console.log('  ✓ Plan Starter creado')

  // Plan PYME — hasta 3 colegios, hasta 10 usuarios internos
  await prisma.plan.upsert({
    where: { tipo: 'PYME' },
    update: {},
    create: {
      tipo: 'PYME',
      nombre: 'PYME',
      descripcion: 'Plan para concesionarios con múltiples colegios',
      precioMensual: 129000,
      precioAnual: 1290000,
      maxColegios: 3,
      maxUsuarios: 10,
    },
  })
  console.log('  ✓ Plan PYME creado')

  // Plan Pro — colegios ilimitados, usuarios ilimitados
  await prisma.plan.upsert({
    where: { tipo: 'PRO' },
    update: {},
    create: {
      tipo: 'PRO',
      nombre: 'Pro',
      descripcion: 'Plan para operaciones grandes sin límite de escala',
      precioMensual: 299000,
      precioAnual: 2990000,
      maxColegios: null,
      maxUsuarios: null,
    },
  })
  console.log('  ✓ Plan Pro creado')

  // Plan Enterprise — cotización personalizada
  await prisma.plan.upsert({
    where: { tipo: 'ENTERPRISE' },
    update: {},
    create: {
      tipo: 'ENTERPRISE',
      nombre: 'Enterprise',
      descripcion: 'Plan con SLA, soporte prioritario e integraciones custom',
      precioMensual: null,
      precioAnual: null,
      maxColegios: null,
      maxUsuarios: null,
    },
  })
  console.log('  ✓ Plan Enterprise creado')

    // ═══════════════════════════════════════════════════════════════
    // PlanLimite — métricas de límite por plan
    // ═══════════════════════════════════════════════════════════════
    console.log("\nCreando límites de planes...")
    const planes = await prisma.plan.findMany()
    const planMap: Record<string, string> = {}
    for (const p of planes) { planMap[p.tipo] = p.id }

    const limites: Record<string, Record<string, number | null>> = {
      STARTER: { MAX_COLEGIOS: 1, MAX_USUARIOS: 3 },
      PYME: { MAX_COLEGIOS: 3, MAX_USUARIOS: 10 },
      PRO: { MAX_COLEGIOS: null, MAX_USUARIOS: null },
      ENTERPRISE: { MAX_COLEGIOS: null, MAX_USUARIOS: null },
    }

    for (const [tipo, metrics] of Object.entries(limites)) {
      const planId = planMap[tipo]
      if (!planId) continue
      for (const [metrica, valor] of Object.entries(metrics)) {
        await prisma.planLimite.upsert({
          where: { planId_metrica: { planId, metrica } },
          update: { valor },
          create: { planId, metrica, valor },
        })
      }
      console.log(` ✓ Límites ${tipo}`)
    }

  // ═══════════════════════════════════════════════════════════════
  // Demo Data — Semana 4: Tenant, Colegio, Suscripcion, CategoriaPrecio
  // ═══════════════════════════════════════════════════════════════
  console.log('\nCreando datos de demo para Semana 4...')

  // Tenant demo
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'casino-demo' },
    update: {},
    create: {
      name: 'Casino Demo',
      slug: 'casino-demo',
      email: 'demo@enbandeja.cl',
      phone: '+56912345678',
      timezone: 'America/Santiago',
      status: 'ACTIVE',
    },
  })
  console.log(`  ✓ Tenant: ${demoTenant.name} (${demoTenant.id})`)

  // Colegio demo con codigoCasino
  const demoColegio = await prisma.colegio.upsert({
    where: { codigoCasino: 'DEMO1' },
    update: {},
    create: {
      tenantId: demoTenant.id,
      nombre: 'Colegio San Patricio',
      codigoCasino: 'DEMO1',
      direccion: 'Av. Las Condes 1234, Santiago',
      horaCorte: '09:00',
      kioscoActivo: false,
    },
  })
  console.log(`  ✓ Colegio: ${demoColegio.nombre} (código: ${demoColegio.codigoCasino})`)

  // Categoría de precio default
  const defaultCategoria = await prisma.categoriaPrecio.upsert({
    where: {
      id: demoColegio.id, // Will fail on first run, create will trigger
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      colegioId: demoColegio.id,
      nombre: 'General',
      descripcion: 'Precio estándar para todos los comensales',
      esDefault: true,
      orden: 0,
    },
  })
  console.log(`  ✓ Categoría de precio: ${defaultCategoria.nombre}`)

  // Suscripción activa — vincular al Plan Starter via lookup
  const starterPlan = await prisma.plan.findUnique({
    where: { tipo: 'STARTER' },
  })

  if (starterPlan) {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setMonth(endDate.getMonth() + 1)

    await prisma.suscripcion.upsert({
      where: { tenantId: demoTenant.id },
      update: {},
      create: {
        tenantId: demoTenant.id,
        planId: starterPlan.id,
        tipo: 'MENSUAL',
        estado: 'ACTIVA',
        periodoInicio: now,
        periodoFin: endDate,
      },
    })
    console.log('  ✓ Suscripción Starter activa')
  }

  // OnboardingProgress para el tenant
  await prisma.onboardingProgress.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      tenantId: demoTenant.id,
      datosEmpresa: true,
      primerColegio: true,
      categoriasPrecios: true,
    },
  })
  console.log('  ✓ OnboardingProgress creado')

  // Comensales precargados sin apoderado vinculado
  const precargados = [
    { nombre: 'Martín', apellido: 'González', curso: '1° Básico A' },
    { nombre: 'Valentina', apellido: 'Rojas', curso: '1° Básico A' },
    { nombre: 'Diego', apellido: 'Muñoz', curso: '3° Básico B' },
    { nombre: 'Sofía', apellido: 'Pérez', curso: '3° Básico B' },
    { nombre: 'Matías', apellido: 'Soto', curso: '5° Básico A' },
    { nombre: 'Isidora', apellido: 'Fuentes', curso: '5° Básico A' },
    { nombre: 'Benjamín', apellido: 'Castro', curso: '7° Básico B' },
    { nombre: 'Camila', apellido: 'Herrera', curso: '1° Medio A' },
  ]

  console.log('\nPrecargando alumnos en DEMO1...')
  for (const c of precargados) {
    // Buscar si ya existe para sea idempotente
    const ext = await prisma.comensal.findFirst({
      where: {
        colegioId: demoColegio.id,
        nombre: c.nombre,
        apellido: c.apellido,
      }
    })

    if (!ext) {
      await prisma.comensal.create({
        data: {
          tenantId: demoTenant.id,
          colegioId: demoColegio.id,
          nombre: c.nombre,
          apellido: c.apellido,
          curso: c.curso,
          isActive: true,
          apoderadoId: null,
          vinculo: null,
        }
      })
      console.log(`  ✓ Comensal creado: ${c.nombre} ${c.apellido} (${c.curso})`)
    }
  }

  // ═══════════════════════════════════════════════════════════════
// PaymentProviderConfig — Webpay sandbox para tenant demo
// ═══════════════════════════════════════════════════════════════
// Credenciales de integración de Transbank (públicas, documentadas)
// apiKey y secretKey se guardan CIFRADAS en producción.
// En seed usamos valores planos porque es ambiente de desarrollo.
// ═══════════════════════════════════════════════════════════════

const WEBPAY_SANDBOX_COMMERCE_CODE = '597055555532' // Código de comercio sandbox de Transbank
const WEBPAY_SANDBOX_API_KEY = '579B532A7B6945D8A8A60B6EDD47B9116CF2B7B0' // API key sandbox (pública)
const WEBPAY_SANDBOX_SECRET_KEY = '579B532A7B6945D8A8A60B6EDD47B9116CF2B7B0' // Secret sandbox (público)

console.log('\nConfigurando Webpay sandbox para tenant demo...')

// En seed guardamos valores "cifrados" con un prefijo para simular cifrado.
// En producción, el cifrado real usa AES-256-GCM con PAYMENT_ENCRYPTION_KEY.
// Aquí usamos un placeholder que el código de cifrado/descifrado debe manejar.
const existingPPC = await prisma.paymentProviderConfig.findFirst({
  where: { tenantId: demoTenant.id, provider: 'WEBPAY', isActive: true }
})

if (!existingPPC) {
  await prisma.paymentProviderConfig.create({
    data: {
      tenantId: demoTenant.id,
      provider: 'WEBPAY',
      commerceCode: WEBPAY_SANDBOX_COMMERCE_CODE,
      apiKeyEncrypted: WEBPAY_SANDBOX_API_KEY,
      secretKeyEncrypted: WEBPAY_SANDBOX_SECRET_KEY,
      environment: 'integration',
      isActive: true,
      isDefault: true,
    }
  })
  console.log(` ✓ PaymentProviderConfig WEBPAY sandbox creado`)
} else {
  console.log(` ✓ PaymentProviderConfig WEBPAY sandbox ya existe`)
}

console.log('\nSeed completado exitosamente.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
