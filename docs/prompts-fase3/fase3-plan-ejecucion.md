═══════════════════════════════════════════════════════════════════
ENBANDEJA — FASE 3 · DOCUMENTO MAESTRO DE EJECUCIÓN
PANEL DEL OWNER + DASHBOARD + KPISNAPSHOT (Módulos 13-15)
═══════════════════════════════════════════════════════════════════

> Mismo formato que Fase 2. Pero Fase 3 es MÁS LINEAL:
> el Módulo 15 depende de los dos anteriores, así que los tres
> van secuenciales. No hay paralelización en esta fase.


───────────────────────────────────────────────────────────────────
OBJETIVO DE FASE 3
───────────────────────────────────────────────────────────────────

El Owner (dueño de la empresa concesionaria, distinto del operador
del día a día) puede gestionar su tenant completo:
- Agregar colegios
- Invitar usuarios internos (operadores, cocina)
- Ver métricas en tiempo real de todos sus colegios
- Exportar reportes consolidados

HITO: El Owner accede al dashboard, ve métricas en tiempo real de
todos sus colegios, descarga un reporte Excel consolidado del mes,
y compara el rendimiento entre colegios.


───────────────────────────────────────────────────────────────────
GRAFO DE DEPENDENCIAS
───────────────────────────────────────────────────────────────────

  MÓDULO 13 (Gestión tenant + colegios) ──┐
       │ independiente                     │
       │                                   ├──→ MÓDULO 15 (Reportes)
  MÓDULO 14 (Dashboard + KpiSnapshot) ─────┘     depende de 13 y 14
       │ CRÍTICO — cron + métricas

LECTURA:
- 13 crea la base (colegios, usuarios) que 15 necesita
- 14 es crítico (KpiSnapshot con cron por timezone)
- 15 depende de ambos (reportes consolidados de colegios + métricas)

ESTRATEGIA: TODOS SECUENCIALES. Sin paralelización.
  Tanda 1: Módulo 13 (gestión tenant)
  Tanda 2: Módulo 14 (KpiSnapshot) — CRÍTICO, máximo cuidado
  Tanda 3: Módulo 15 (reportes async) — cierra Fase 3


───────────────────────────────────────────────────────────────────
REGLAS GLOBALES DE FASE 3
───────────────────────────────────────────────────────────────────

- Rol OWNER: acceso total a su tenant, gestión de colegios/usuarios
- El Owner NO es el operador. Owner administra, operador opera el día.
- Toda query con createTenantClient + RLS por tenantId
- Timezone SIEMPRE del tenant (NUNCA hardcodear America/Santiago)
- Verificación de límites del plan al agregar colegios (PlanLimite)
- NUNCA hardcodear nombres de clientes ni colegios reales en código.
  Los colegios se crean vía el panel del Owner como datos, no código.
- Gráficos con Recharts
- Componentes pesados en packages/ui, los con next/* en apps/web


═══════════════════════════════════════════════════════════════════
MÓDULO 13 — GESTIÓN DEL TENANT Y COLEGIOS
═══════════════════════════════════════════════════════════════════

INDEPENDIENTE · Ejecutar primero

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────

Vas a trabajar en Enbandeja — Fase 3, Módulo 13: Gestión del tenant.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. FASE-3-PLAN-EJECUCION.md sección Módulo 13
4. docs/plan.md sección Fase 3 Semana 13
5. docs/agentes/frontend.md
6. docs/agentes/database.md (modelos Tenant, Colegio, UserTenant, Invitation, PlanLimite)

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Layout /owner con navegación (separado de /operador)
- Rol OWNER validado en el layout (no operador, no apoderado, no cocina)
- Pantalla gestión de empresa (datos del tenant, editar)
- Pantalla gestión de colegios:
  - Listar colegios del tenant
  - Crear colegio nuevo
  - Editar colegio
  - Al crear colegio: verificar límite del plan (PlanLimite)
    → si excede, bloquear con mensaje claro
  - Al crear colegio: generar kit de bienvenida PDF automático
- Pantalla gestión de usuarios internos:
  - Listar usuarios del tenant con su rol
  - Invitar usuario nuevo (flujo con Invitation model + email Resend)
  - Estados de invitación (pendiente, aceptada, expirada)

RESTRICCIONES:
- NO tocar dashboard ni métricas (Módulo 14)
- NO tocar reportes (Módulo 15)
- NUNCA hardcodear nombres de colegios reales — todo es data
- Verificación de límite del plan ANTES de crear colegio
- Invitaciones con token único y expiración

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue
- DETENTE. Espera mi confirmación antes del Módulo 14.


═══════════════════════════════════════════════════════════════════
MÓDULO 14 — DASHBOARD CON KPISNAPSHOT
═══════════════════════════════════════════════════════════════════

CRÍTICO · Ejecutar SOLO y con máximo cuidado

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────

Vas a trabajar en Enbandeja — Fase 3, Módulo 14: Dashboard + KpiSnapshot.
Este módulo es CRÍTICO: las métricas que ve el Owner se calculan aquí.
Un error muestra datos falsos y lleva a malas decisiones de negocio.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. FASE-3-PLAN-EJECUCION.md sección Módulo 14
4. docs/plan.md sección Fase 3 Semana 14
5. docs/agentes/backend.md
6. docs/agentes/database.md (modelo KpiSnapshot)

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Modelo KpiSnapshot operativo (ya existe en schema, activarlo)
- Cron cada hora que itera por timezone de cada tenant:
  - Calcula métricas del período (ventas, pedidos, retiros, etc.)
  - Guarda snapshot por tenant + colegio + período
- Generación lazy on-demand:
  - Si el Owner abre el dashboard y falta el snapshot de un período,
    se calcula en el momento y se guarda
- Pantalla /owner/dashboard:
  - Cards de métricas (total ventas, pedidos, ticket promedio, etc.)
  - Gráficos con Recharts (tendencias, comparativas)
  - Vista consolidada de TODOS los colegios del tenant
  - Drill-down: clic en un colegio → métricas de ese colegio

RESTRICCIONES CRÍTICAS:
- El cron DEBE iterar por timezone de cada tenant por separado
  (un tenant en Santiago calcula su "día" distinto a otro en otra zona)
- El cron debe ser idempotente (correr dos veces no duplica snapshots)
- Las métricas deben cuadrar con los datos reales (no aproximar)
- Generación lazy no debe bloquear la carga del dashboard
- NO hardcodear nombres de colegios

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue
- DETENTE. Espera mi confirmación antes del Módulo 15.


═══════════════════════════════════════════════════════════════════
MÓDULO 15 — REPORTES Y EXPORTACIONES AVANZADAS
═══════════════════════════════════════════════════════════════════

DEPENDE DE 13 Y 14 · Ejecutar AL FINAL · Cierra Fase 3

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────

Vas a trabajar en Enbandeja — Fase 3, Módulo 15: Reportes avanzados.
Este módulo CIERRA la Fase 3.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. FASE-3-PLAN-EJECUCION.md sección Módulo 15
4. docs/plan.md sección Fase 3 Semana 15 + hito de Fase 3
5. docs/agentes/backend.md
6. docs/agentes/database.md

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Exportaciones Excel del mes CONSOLIDADAS (todos los colegios)
- Exportaciones async con Inngest:
  - El reporte pesado se genera en background (no bloquea)
  - Se sube a Supabase Storage
  - Se genera URL firmada (temporal, segura)
- Pantalla /owner/reportes:
  - Selectores de período (mes, rango de fechas)
  - Selector de colegio (todos o uno específico)
  - Botón generar reporte
  - Lista de reportes generados con links de descarga
- Notificación push al Owner cuando la exportación está lista

RESTRICCIONES:
- Exportación async (puede tardar, no bloquea la UI)
- URLs firmadas con expiración (no exponer Storage público)
- El reporte consolidado usa datos de KpiSnapshot (Módulo 14)
- NO hardcodear nombres de colegios

AL TERMINAR:
- Actualiza ledger.md con "Fase 3 COMPLETADA"
- Verifica el hito de Fase 3
- pnpm type-check + lint + build
- Tests E2E: kpi-snapshot, owner-protection (skip documentado si
  requieren servidor/seed)
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue


═══════════════════════════════════════════════════════════════════
ORDEN DE EJECUCIÓN
═══════════════════════════════════════════════════════════════════

TANDA 1:  Módulo 13 (Gestión tenant) → verificar → cerrar
TANDA 2:  Módulo 14 (KpiSnapshot) CRÍTICO → verificar con cuidado → cerrar
TANDA 3:  Módulo 15 (Reportes async) → verificar → hito Fase 3

VERIFICACIÓN ENTRE TANDAS:
Pasar zip a Claude (Sonnet) para auditoría en frío antes de avanzar.
El Módulo 14 requiere verificación EXTRA por ser crítico.


═══════════════════════════════════════════════════════════════════
CRITERIO DE CIERRE DE FASE 3
═══════════════════════════════════════════════════════════════════

[ ] El Owner gestiona su empresa (datos del tenant)
[ ] El Owner agrega colegios (con verificación de límite de plan)
[ ] El Owner invita usuarios internos (operador, cocina)
[ ] El Owner ve el dashboard con métricas en tiempo real
[ ] El dashboard muestra vista consolidada de todos los colegios
[ ] Drill-down a un colegio específico funciona
[ ] El cron calcula KpiSnapshot respetando timezone por tenant
[ ] El Owner descarga reporte Excel consolidado del mes
[ ] Rol OWNER protegido (operador/apoderado no acceden)
[ ] Build limpio: type-check + lint + build pasan

Cuando los 10 puntos estén marcados → el Owner administra su negocio
completo de forma autónoma.

═══════════════════════════════════════════════════════════════════
FIN DEL DOCUMENTO MAESTRO FASE 3
═══════════════════════════════════════════════════════════════════
