═══════════════════════════════════════════════════════════════════
ENBANDEJA — FASE 4 · DOCUMENTO MAESTRO DE EJECUCIÓN
BILLING SAAS + ONBOARDING WIZARD (Módulos 16-19)
════════════════════════════════════════════════════════════════════

> Esta es LA fase que vuelve a Enbandeja vendible self-service.
> Un comercio se registra, se configura solo, conecta su pasarela
> y paga su suscripción — sin intervención del equipo Enbandeja.
>
> ATENCIÓN: Fase 4 es la más sensible del proyecto porque toca
> DOS flujos de dinero distintos:
> 1. El comercio paga su SUSCRIPCIÓN a Enbandeja (billing SaaS)
> 2. El comercio conecta su pasarela para cobrar a APODERADOS
>    (onboarding financiero — MercadoPago OAuth)
> Estos dos flujos NUNCA se mezclan. Ver decisión arquitectónica
> de pagos ya tomada en Semana 6.

───────────────────────────────────────────────────────────────────
CONTEXTO IMPORTANTE — LO QUE YA EXISTE
───────────────────────────────────────────────────────────────────

Los modelos de billing YA están en el schema desde Fase 0:
- Plan, PlanLimite, Suscripcion, PagoSuscripcion, OnboardingProgress

Los 4 planes YA están en el seed:
- Starter (1 colegio, 3 usuarios)
- PYME (3 colegios, 10 usuarios)
- (y dos más — verificar en seed.ts)

POR LO TANTO, el Módulo 16 NO crea los modelos. Los ACTIVA:
implementa el middleware, las funciones de verificación y los
paneles que USAN esos modelos ya existentes.

───────────────────────────────────────────────────────────────────
GRAFO DE DEPENDENCIAS
───────────────────────────────────────────────────────────────────

MÓDULO 16 (Middleware billing) ──── CIMIENTO de toda la fase
│                               CRÍTICO — verificarSuscripcion toca TODAS las rutas
│
├──→ MÓDULO 17 (Setup Wizard) ───┐
│                               independientes
│                               entre sí
├──→ MÓDULO 18 (Billing manual) ──┤
│                               │
└─────────────────────────────────┴──→ MÓDULO 19 (Ciclo vida)
                                       depende de 16 y 18

ESTRATEGIA:
Tanda 1: Módulo 16 SOLO — CRÍTICO (el cimiento, máxima revisión)
Tanda 2: Módulo 17, luego Módulo 18 (secuencial)
[SE PODRÍAN paralelizar con subagentes — son independientes —
 pero se recomienda secuencial por ser fase de dinero]
Tanda 3: Módulo 19 SOLO — CRÍTICO (suspende clientes, máxima revisión)

POR QUÉ 16 ES EL MÁS CRÍTICO:
El middleware verificarSuscripcion se ejecuta en TODAS las rutas
de negocio. Si está mal, rompe la app entera (apoderados,
operadores, owners). Es más transversal que Webpay. No se
construye NADA encima hasta que el 16 esté sólido y verificado.

POR QUÉ 19 ES CRÍTICO:
El cron de ciclo de vida decide quién queda suspendido y quién
activo. Un error suspende a un cliente que pagó, o deja operando
a uno que no pagó. Ambos son daños graves al negocio.

───────────────────────────────────────────────────────────────────
REGLAS GLOBALES DE FASE 4
───────────────────────────────────────────────────────────────────

- DOS flujos de dinero separados, NUNCA mezclados:
  · Billing SaaS (comercio → Enbandeja): este es el de Fase 4
  · Pagos apoderados (apoderado → comercio): ese es Webpay/MercadoPago
    del comercio, configurado en el onboarding financiero
- El middleware verificarSuscripcion NO debe bloquear rutas de auth
  ni el propio setup wizard (si no, el cliente no puede ni registrarse)
- Verificación de límites del plan SIEMPRE antes de crear recursos
- MercadoPago OAuth: el token pertenece al TENANT, nunca global
- Estados de suscripción claros y con transiciones válidas
- Cancelación voluntaria requiere confirmación literal "CANCELAR"
- NUNCA hardcodear nombres de clientes reales
- Timezone del tenant para vencimientos y renovaciones

════════════════════════════════════════════════════════════════════
MÓDULO 16 — MIDDLEWARE DE BILLING Y VERIFICACIÓN DE SUSCRIPCIÓN
════════════════════════════════════════════════════════════════════

CRÍTICO · Ejecutar PRIMERO y SOLO · Es el cimiento de Fase 4

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────
Vas a trabajar en Enbandeja — Fase 4, Módulo 16: Middleware de billing.
Este es el MÓDULO MÁS CRÍTICO de Fase 4.
El middleware que vas a crear se ejecuta en TODAS las rutas de negocio.
Si está mal, rompe la app entera. Máximo cuidado.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/FASE-4-PLAN-EJECUCION.md sección Módulo 16
4. docs/plan.md sección Fase 4 Semana 16
5. docs/agentes/backend.md
6. docs/agentes/database.md (modelos Plan, PlanLimite, Suscripcion,
   PagoSuscripcion — YA EXISTEN, no los crees)

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Verificar/completar seed de los 4 planes (ya existe, revisar que
  esté completo con sus PlanLimite)
- Middleware verificarSuscripcion:
  · Se aplica a rutas de negocio (operador, owner, apoderado)
  · NO se aplica a rutas de auth, registro, ni setup wizard
  · Si la suscripción no está activa → bloquea con mensaje claro
    y redirige a /owner/billing
- Función Postgres check_tenant_activo() para validación a nivel DB
- Middleware verificarLimiteColegio antes de crear colegios
  (ya hay lógica de límite en Módulo 13 — consolidar aquí, no duplicar)
- Panel /owner/billing:
  · Estado actual de la suscripción (plan, estado, próximo cobro)
  · Historial de PagoSuscripcion
  · (cambio de plan y cancelación se completan en Módulo 19)

RESTRICCIONES CRÍTICAS:
- El middleware NUNCA debe bloquear: /login, /registro, /setup/*,
  rutas de NextAuth. Si las bloquea, el cliente no puede ni entrar.
- NO crear los modelos (ya existen). Solo usar y activar.
- NO duplicar la lógica de límite de colegio del Módulo 13 —
  consolidar en un solo lugar.
- Distinguir billing SaaS de pagos a apoderados. Este módulo es
  SOLO billing SaaS (comercio → Enbandeja).
- Probar mentalmente: ¿un tenant sin suscripción activa puede aún
  así llegar al panel de billing para pagar? DEBE poder.

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue
- DETENTE. Espera mi confirmación antes del Módulo 17.

════════════════════════════════════════════════════════════════════
MÓDULO 17 — SETUP WIZARD (ONBOARDING SELF-SERVICE)
════════════════════════════════════════════════════════════════════

Depende de 16 · Independiente del 18

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────
Vas a trabajar en Enbandeja — Fase 4, Módulo 17: Setup Wizard.
Aquí un comercio nuevo se configura SOLO, sin ayuda del equipo.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/FASE-4-PLAN-EJECUCION.md sección Módulo 17
4. docs/plan.md sección Fase 4 Semana 17
5. docs/agentes/frontend.md
6. docs/agentes/database.md (modelo OnboardingProgress, PaymentProviderConfig)

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Modelo OnboardingProgress vinculado a Tenant (ya existe, activar)
- Pantallas del wizard /setup/* — 6 pasos con tracking de progreso:
  · Paso 1: Datos de la empresa (nombre, RUT, contacto)
  · Paso 2: Primer colegio (con código generado automáticamente)
  · Paso 3: ONBOARDING FINANCIERO — conectar MercadoPago vía OAuth
    para que el comercio cobre a SUS apoderados. El token pertenece
    al TENANT (guardar en PaymentProviderConfig). Botón "Conectar
    MercadoPago". Si OAuth real no está configurado aún, implementa
    el flujo completo y marca [PENDIENTE CONSULTA] en el callback real.
  · Paso 4: Importar comensales vía Excel template (descargar
    plantilla, subir archivo, validar, previsualizar, confirmar)
  · Paso 5 y 6: según el plan (CategoriaPrecio y primer menú —
    pueden quedar como pasos guiados con acompañamiento del equipo)
- Tracking de progreso: el comercio puede salir y volver donde quedó

RESTRICCIONES:
- El wizard NO debe estar bloqueado por verificarSuscripcion
  (el cliente se está registrando, aún no tiene suscripción activa)
- MercadoPago OAuth: token por tenant en PaymentProviderConfig,
  NUNCA global. Recuerda: este es el flujo apoderado→comercio,
  separado del billing SaaS.
- Validación robusta del Excel de comensales (errores claros por fila)
- NO hardcodear datos de clientes reales
- NO tocar el Módulo 18 (billing manual)

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue
- DETENTE. Espera mi confirmación antes del Módulo 18.

════════════════════════════════════════════════════════════════════
MÓDULO 18 — BILLING MANUAL (PANEL SUPER ADMIN)
════════════════════════════════════════════════════════════════════

Depende de 16 · Independiente del 17

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────
Vas a trabajar en Enbandeja — Fase 4, Módulo 18: Billing manual.
Aquí el equipo Enbandeja (Super Admin) gestiona cobros manualmente.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/FASE-4-PLAN-EJECUCION.md sección Módulo 18
4. docs/plan.md sección Fase 4 Semana 18
5. docs/agentes/backend.md
6. docs/agentes/database.md (modelos Suscripcion, PagoSuscripcion, SuperAdmin)

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Panel /super-admin/tenants/[id]/billing:
  · Estado de la suscripción del tenant
  · Historial de pagos
  · Acciones de gestión
- Endpoint /api/super-admin/billing/confirmar-pago:
  · Solo Super Admin
  · Registra un PagoSuscripcion manual
  · Activa/renueva la suscripción del tenant
- Flujo de cambio de plan:
  · Upgrade: inmediato con prorrateo
  · Downgrade: al próximo ciclo (no inmediato)
  · Verificar que el nuevo plan permita los recursos actuales
    (no permitir downgrade si tiene más colegios de los que el
    plan menor admite)
- Flujo de cancelación voluntaria:
  · Requiere confirmación literal escribiendo "CANCELAR"
- Flujo de reactivación con pago

RESTRICCIONES:
- Solo Super Admin accede a estas rutas (validar en backend)
- El cambio de plan con downgrade NO debe dejar al tenant en
  estado inconsistente (más colegios de los permitidos)
- Toda acción de billing queda en AuditLog
- Este es billing SaaS (comercio → Enbandeja), NO pagos de apoderados
- NO tocar el Módulo 17 (wizard)

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue
- DETENTE. Espera mi confirmación antes del Módulo 19.

════════════════════════════════════════════════════════════════════
MÓDULO 19 — CICLO DE VIDA AUTOMÁTICO DE SUSCRIPCIÓN
════════════════════════════════════════════════════════════════════

CRÍTICO · Depende de 16 y 18 · Ejecutar SOLO y AL FINAL · Cierra Fase 4

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────
Vas a trabajar en Enbandeja — Fase 4, Módulo 19: Ciclo de vida.
Este módulo CIERRA la Fase 4. Es CRÍTICO: decide quién queda
suspendido y quién activo. Un error suspende a quien pagó o deja
operando a quien no pagó. Máximo cuidado.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/FASE-4-PLAN-EJECUCION.md sección Módulo 19
4. docs/plan.md sección Fase 4 Semana 19 + hito de Fase 4
5. docs/agentes/backend.md
6. docs/agentes/database.md

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Cron diario de vencimientos con las 4 transiciones de estado:
  · ACTIVA → PERIODO_GRACIA (al vencer sin pago)
  · PERIODO_GRACIA → SUSPENDIDA (al terminar gracia)
  · SUSPENDIDA → CANCELADA (tras X días suspendida)
  · CANCELADA → ARCHIVADA (tras retención)
- Notificaciones de billing usando NotificacionLog:
  · Aviso antes de vencer
  · Aviso al entrar en gracia
  · Aviso al suspender
- Aviso 7 días antes de renovación anual
- Panel /owner/billing COMPLETO:
  · Cambio de plan (que el owner pueda solicitar)
  · Cancelación voluntaria con confirmación "CANCELAR"

RESTRICCIONES CRÍTICAS:
- El cron debe respetar timezone del tenant para calcular vencimientos
- El cron debe ser idempotente (correr dos veces no salta estados)
- Una transición SOLO ocurre si la fecha lo justifica (no adelantar)
- Un pago confirmado (Módulo 18) debe sacar al tenant de gracia/
  suspensión inmediatamente
- NUNCA suspender un tenant con pago vigente
- Probar mentalmente cada transición con casos límite

AL TERMINAR:
- Actualiza ledger.md con "Fase 4 COMPLETADA"
- Verifica el hito de Fase 4
- pnpm type-check + lint + build
- Tests E2E: suscripcion-ciclo.spec.ts, limites-plan.spec.ts
  (skip documentado si requieren servidor/seed)
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue

════════════════════════════════════════════════════════════════════
ORDEN DE EJECUCIÓN
════════════════════════════════════════════════════════════════════

TANDA 1: Módulo 16 (Middleware billing) CRÍTICO
  → revisar con LUPA (es el cimiento) → cerrar

TANDA 2: Módulo 17 (Setup Wizard) → verificar → cerrar
         Módulo 18 (Billing manual) → verificar → cerrar
  [secuencial; paralelizables con subagentes si se desea velocidad]

TANDA 3: Módulo 19 (Ciclo de vida) CRÍTICO
  → revisar con LUPA (suspende clientes) → hito Fase 4

VERIFICACIÓN ENTRE TANDAS:
Pasar a Claude (Sonnet) para auditoría en frío antes de avanzar.
Los Módulos 16 y 19 requieren verificación EXTRA por ser críticos.

════════════════════════════════════════════════════════════════════
CRITERIO DE CIERRE DE FASE 4
════════════════════════════════════════════════════════════════════

[ ] Un tenant nuevo se registra vía /registro
[ ] Completa el setup wizard hasta paso 4 sin ayuda
[ ] El wizard NO queda bloqueado por falta de suscripción
[ ] El comercio conecta su MercadoPago (token por tenant)
[ ] El middleware verificarSuscripcion protege rutas de negocio
[ ] El middleware NO bloquea auth/registro/setup
[ ] El Super Admin confirma un pago manual y activa la suscripción
[ ] El cambio de plan funciona (upgrade prorrateo, downgrade próximo ciclo)
[ ] La cancelación requiere confirmación "CANCELAR"
[ ] El cron de ciclo de vida transiciona estados respetando timezone
[ ] Un pago saca al tenant de gracia/suspensión inmediatamente
[ ] Build limpio: type-check + lint + build pasan

Cuando todos estén marcados → ENBANDEJA ES VENDIBLE SELF-SERVICE.
Un comercio puede registrarse, configurarse, conectar su pasarela
y pagar su suscripción sin que el equipo Enbandeja toque nada.
ESE es el hito de negocio que convierte el proyecto en empresa.

════════════════════════════════════════════════════════════════════
FIN DEL DOCUMENTO MAESTRO FASE 4
════════════════════════════════════════════════════════════════════
