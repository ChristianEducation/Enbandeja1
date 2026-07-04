═══════════════════════════════════════════════════════════════════
ENBANDEJA — FASE 1 · SEMANA 4
REGISTRO Y VINCULACIÓN DEL APODERADO
═══════════════════════════════════════════════════════════════════

ROL: Eres el Senior Architect de Enbandeja ejecutando la Semana 4
de Fase 1. Tu única fuente de verdad es docs/plan.md + CLAUDE.md +
docs/agentes/*.md + docs/PLAN_MAESTRO_DISEÑO.md. NO inventas nada.
Si algo no está documentado, DETIENES y preguntas.

PROTOCOLO DE INICIO:
Antes de ejecutar cualquier tarea, confirma con este mensaje exacto:

> "Contexto absorbido. Fase 1 Semana 4 — Registro y vinculación.
> Fase 0 completada. Voy a crear: modelo Colegio con codigoCasino
> único, flujo de onboarding del apoderado (Google/Apple/email),
> ingreso de código de casino, agregar primer comensal.
> ADN visual: Dark + Azul Eléctrico + Bento Glass. Esperando
> autorización para Tarea 1."

LECTURA OBLIGATORIA (en este orden):
1. ledger.md
2. docs/plan.md sección 5 Fase 1 + sección 6 (schema)
3. CLAUDE.md (reglas innegociables)
4. docs/agentes/database.md (para el modelo Colegio y RLS)
5. docs/agentes/backend.md (para API routes y withAuth)
6. docs/agentes/frontend.md (para Server Components + formularios)
7. docs/PLAN_MAESTRO_DISEÑO.md (protocolo del Agente Frontend)

═══ RESTRICCIONES DE ESTA SESIÓN ═══

- NO tocar schema de tablas ya existentes salvo que la semana lo
  exija. Si hay que ajustar, avisar primero.
- NO implementar flujo de pedido ni de pago (eso es Semana 6).
- NO crear panel del operador (eso es Fase 2).
- NO modificar CLAUDE.md, plan.md, ni agentes.
- TODA ruta de negocio usa createTenantClient(tenantId, userId).
- TODO formulario valida con Zod (frontend + backend).
- Mobile-first siempre (viewport 375px primero).
- Server Components por default, "use client" solo si hay
  interactividad.

═══ TAREAS ═══

TAREA 1 — Modelo Colegio con codigoCasino único
Verificar que el modelo Colegio ya existe en schema.prisma (Fase 0
lo creó). Si falta algo, agregarlo:
- codigoCasino: String @unique (5-6 caracteres alfanuméricos)
- horaCorte, horaRetiroActivo, horasRetiro, kioscoActivo
- RLS policy: tenant_aislamiento

Crear función helper en packages/shared/src/utils/codigo-casino.ts:
- generarCodigoCasino(): string (5 chars A-Z + 0-9, sin ambigüedad
  con I/1, O/0)
- validarFormatoCodigoCasino(codigo: string): boolean

TAREA 2 — Modelo Comensal con RLS
Verificar modelo Comensal en schema.prisma. Confirmar campos:
- apoderadoId, colegioId, categoriaPrecioId (opcional, fallback a
  default del colegio)
- nombre, apellido, curso, nivel, vinculo (enum)
- puedeHacerPedidoSolo (bool, default false)

RLS policies requeridas:
- comensal_aislamiento (por tenantId)
- comensal_apoderado_propio (apoderadoId = current_user_id)

Aplicar migration si falta algo.

TAREA 3 — Validators Zod en packages/shared
Crear packages/shared/src/validators/comensal.ts:
- CrearComensalSchema: nombre, apellido, curso, nivel, vinculo,
  categoriaPrecioId (opcional)
- VincularCodigoSchema: codigoCasino (regex 5-6 alfanuméricos)

Exportar desde packages/shared/src/validators/index.ts.

TAREA 4 — API routes de vinculación
Crear apps/web/src/app/api/vincular/codigo/route.ts (POST):
- Recibe codigoCasino
- Busca Colegio por codigoCasino (usar prisma global, NO
  createTenantClient, porque el apoderado aún no tiene tenant)
- Si no existe: 404
- Si existe: retorna { colegioId, tenantId, colegioNombre }
  SIN persistir nada aún (solo valida)

Crear apps/web/src/app/api/comensales/crear/route.ts (POST):
- Envuelto en withAuth
- Valida con CrearComensalSchema
- Crea Comensal + UserTenant si no existe (rol APODERADO)
- Actualiza Session.activeTenantId con el tenant del colegio
- Retorna { comensalId, tenantId }

TAREA 5 — Layout y páginas de auth
Revisar apps/web/src/app/(auth)/layout.tsx (debería existir de
Fase 0). Confirmar que usa background #0D0F1A y el design system.

Crear/revisar apps/web/src/app/(auth)/login/page.tsx:
- Server Component
- Bento Card centrado (radius 24px, Liquid Glass)
- Logo Enbandeja arriba
- Botón "Continuar con Google" (primary, 48px, radius 12)
- Botón "Continuar con Apple" (secondary ghost)
- Separador "o"
- Link a /registro
- Todo mobile-first

Crear apps/web/src/app/(auth)/registro/page.tsx:
- Mismo layout que login
- Form con email + contraseña (Client Component separado)
- Validación Zod en frontend
- Llama a signIn() de NextAuth al submit
- Link a /login

TAREA 6 — Flujo de onboarding del apoderado (3 pasos)
Crear apps/web/src/app/(onboarding)/layout.tsx:
- Server Component
- Valida que hay sesión (withAuth equivalente en layout)
- Progress bar arriba (3 pasos: código / comensal / confirmar)

Crear apps/web/src/app/(onboarding)/codigo/page.tsx:
- Server Component
- Input de 5-6 caracteres con mask
- Form (Client Component) que llama a /api/vincular/codigo
- Al éxito muestra card "Encontramos: [Colegio Nombre]" con botón
  "Continuar"
- Guarda colegioId temporalmente (sessionStorage o searchParam)

Crear apps/web/src/app/(onboarding)/comensal/page.tsx:
- Server Component con colegioId del searchParam
- Form de crear comensal (Client Component)
- Al submit llama a /api/comensales/crear
- Redirige a /home

TAREA 7 — Ajuste de NextAuth para activeTenantId
Revisar apps/web/src/lib/auth.ts. Confirmar que el callback
session extiende con activeTenantId leyendo del Session model.

Si no existe, agregar callback:
- En session callback, poblar session.activeTenantId desde DB
- En signIn callback, si el usuario nuevo no tiene UserTenant,
  redirigir a /onboarding/codigo

TAREA 8 — Tests E2E básicos
Crear tests/e2e/critical/registro-flow.spec.ts:
- Test: "apoderado nuevo completa onboarding con código válido"
  - Visita /registro
  - Crea cuenta email+password
  - Ingresa código de casino (seed de prueba)
  - Crea comensal
  - Llega a /home con sesión activa
- Test: "código inválido muestra error"
- Test: "sin sesión en /onboarding redirige a /login"

Agregar seed temporal en packages/database/prisma/seed.ts:
- 1 Tenant de prueba "Demo HealthyFood"
- 1 Colegio con codigoCasino "DEMO1"
- 1 CategoriaPrecio default

TAREA 9 — Verificación final
Ejecutar:
  pnpm type-check
  pnpm lint
  pnpm test:e2e --filter=registro-flow
  pnpm build

TODAS deben pasar con 0 errores.

═══ CHECKLIST ANTI-PATRONES ═══

Antes de cerrar la sesión, verificar:
[ ] Cero prisma global en rutas con tenantId
[ ] Cero auth.uid() en RLS (solo current_setting)
[ ] Cero listas planas (todo en Bento Cards)
[ ] Cero colores hardcoded (todo via tailwind tokens)
[ ] Cero morados, cero rojos (ámbar para errores)
[ ] Cero "use client" importando @enbandeja/database
[ ] Cero next/server fuera de apps/web
[ ] Formularios validan con Zod frontend + backend
[ ] Todo mobile-first probado en 375px

═══ ACTUALIZACIÓN DEL LEDGER ═══

Al terminar, agregar entrada al ledger.md con:
- Fecha
- "Fase 1 Semana 4 — Registro y vinculación COMPLETADA"
- Qué se creó (modelos, endpoints, páginas)
- Próxima tarea: "Semana 5 — Catálogo y menú del apoderado"
- Cualquier deuda técnica detectada

═══════════════════════════════════════════════════════════════════