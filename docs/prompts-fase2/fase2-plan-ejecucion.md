═══════════════════════════════════════════════════════════════════
ENBANDEJA — FASE 2 · DOCUMENTO MAESTRO DE EJECUCIÓN
PANEL DEL OPERADOR + GESTIÓN DE MENÚS (Módulos 9-12)
═══════════════════════════════════════════════════════════════════

> Este documento reemplaza el formato semana-por-semana para Fase 2.
> Razón: los 4 módulos del operador son mayormente INDEPENDIENTES
> entre sí, lo que permite paralelización con subagentes.
>
> Cómo usarlo:
> - Cada módulo tiene su propio bloque de prompt listo para copiar
> - El GRAFO DE DEPENDENCIAS indica qué se puede ejecutar en paralelo
> - Sigues el mismo ritual: lectura obligatoria → ejecución → verificación


───────────────────────────────────────────────────────────────────
OBJETIVO DE FASE 2
───────────────────────────────────────────────────────────────────

El operador de un casino escolar puede operar el día a día SIN ayuda
del equipo Enbandeja:
- Publica menús
- Gestiona productos del kiosco
- Ve pedidos del día en tiempo real
- Marca retiros
- Exporta reportes
- La cocina ve qué preparar

HITO: El operador puede usar el panel en su tablet durante un turno
de trabajo real sin intervención. Es el momento en que el producto
se vuelve demostrable a un cliente.


───────────────────────────────────────────────────────────────────
GRAFO DE DEPENDENCIAS (clave para paralelizar)
───────────────────────────────────────────────────────────────────

  MÓDULO 9 (Dashboard del día) ──────┐
       │ independiente               │
       │                             ├──→ MÓDULO 12 (Cierre + cron + cocina)
  MÓDULO 11 (Kiosco + export) ───────┤        depende de 9 y 10
       │ independiente               │
       │                             │
  MÓDULO 10 (Gestión menús) ─────────┘
       │ independiente
       
LECTURA DEL GRAFO:
- 9, 10, 11 NO dependen entre sí → pueden ir en CUALQUIER orden o EN PARALELO
- 12 SÍ depende de 9 (lista del día) y 10 (estados de menú) → va AL FINAL

ESTRATEGIA RECOMENDADA:
  Tanda 1 (paralelo):  Módulo 9 + Módulo 11 con subagentes
  Tanda 2 (solo):      Módulo 10 (gestión de menús, tiene transacción atómica)
  Tanda 3 (solo):      Módulo 12 (crítico: cron con timezone + Realtime)

POR QUÉ 10 VA SOLO:
La función "copiar semana anterior" usa transacción atómica que
duplica menús + opciones + precios. Mejor sin paralelización.

POR QUÉ 12 VA SOLO Y AL FINAL:
- El cron de transiciones de estado toca timezone (crítico)
- Supabase Realtime es integración nueva
- Necesita que la lista del día (9) y los estados de menú (10) existan


───────────────────────────────────────────────────────────────────
REGLAS GLOBALES DE FASE 2 (aplican a TODOS los módulos)
───────────────────────────────────────────────────────────────────

- Rol OPERADOR: acceso solo a su tenant (RLS por tenantId)
- Rol COCINA: solo lectura, sin acciones de escritura
- Toda query usa createTenantClient (nunca prisma directo en endpoints)
- Timezone SIEMPRE del tenant, NUNCA hardcodear America/Santiago
- Componentes pesados (calendario, listas) en packages/ui
- Componentes con next/navigation o next/link en apps/web (Regla 3)
- Mobile-first y tablet-first (el operador usa tablet)
- Actualización optimista en acciones frecuentes (marcar retirado)
- Toda mutación con Zod validation + withAuth


═══════════════════════════════════════════════════════════════════
MÓDULO 9 — DASHBOARD DEL OPERADOR Y LISTA DEL DÍA
═══════════════════════════════════════════════════════════════════

INDEPENDIENTE · Puede ir en paralelo con Módulo 11

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────

Vas a trabajar en Enbandeja — Fase 2, Módulo 9: Dashboard del operador.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/plan.md sección Fase 2 Semana 9
4. docs/agentes/frontend.md
5. docs/agentes/database.md

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto, nada más):
- Layout /operador con navegación lateral o bottom-nav (tablet-first)
- Pantalla /operador/dia:
  - Totales del día (cantidad de pedidos, monto total, por opción)
  - Lista de pedidos del día con nombre comensal, curso, items
  - Desglose por opción de menú y por curso
  - Búsqueda por nombre de comensal
  - Filtros por estado (todos, pagados, retirados, cancelados)
  - Botón "marcar como retirado" con actualización optimista
- Rol OPERADOR validado (no apoderado, no cocina)
- Todo con createTenantClient + RLS por tenantId

RESTRICCIONES:
- NO tocar gestión de menús (eso es Módulo 10)
- NO tocar kiosco (eso es Módulo 11)
- NO implementar cron ni cierre (eso es Módulo 12)
- Timezone del tenant para "el día de hoy"
- Solo archivos en /operador/dia y componentes relacionados

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue


═══════════════════════════════════════════════════════════════════
MÓDULO 10 — GESTIÓN DE MENÚS
═══════════════════════════════════════════════════════════════════

INDEPENDIENTE · Ejecutar SOLO (tiene transacción atómica)

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────

Vas a trabajar en Enbandeja — Fase 2, Módulo 10: Gestión de menús.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/plan.md sección Fase 2 Semana 10
4. docs/agentes/frontend.md
5. docs/agentes/database.md (modelos Menu, OpcionMenu, PrecioOpcion)

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Pantalla /operador/menu con calendario de menús (reusar
  CalendarioExpansible de packages/ui si aplica)
- Pantalla /operador/menu/nuevo para crear menú del día
- Pantalla /operador/menu/[fecha] para editar menú existente
- Estados de menú: BORRADOR, PUBLICADO, CERRADO, ARCHIVADO
- Validaciones de publicación:
  - No permitir publicar con fecha pasada
  - Todas las categorías de precio deben tener precio asignado
- Función "copiar semana anterior":
  - Transacción atómica que duplica menús + opciones + precios
  - Idempotente (no duplica si ya existe el menú de esa fecha)

RESTRICCIONES:
- NO tocar dashboard del día (Módulo 9)
- NO tocar kiosco (Módulo 11)
- La transacción de "copiar semana" debe ser atómica y reversible
- Validación de precios en 3 capas: Zod + backend + lógica de publicación

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue


═══════════════════════════════════════════════════════════════════
MÓDULO 11 — KIOSCO Y EXPORTACIONES
═══════════════════════════════════════════════════════════════════

INDEPENDIENTE · Puede ir en paralelo con Módulo 9

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────

Vas a trabajar en Enbandeja — Fase 2, Módulo 11: Kiosco y exportaciones.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/plan.md sección Fase 2 Semana 11
4. docs/agentes/frontend.md
5. docs/agentes/database.md (modelos ProductoKiosco, CategoriaKiosco)

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Pantalla /operador/kiosco con gestión de productos
- CRUD de ProductoKiosco (crear, editar, activar/desactivar)
- Botón "reponer stock" manual (incrementa stockActual)
- Gestión de CategoriaKiosco (crear, editar, ordenar)
- Exportación Excel del día (síncrona, usar SheetJS/xlsx):
  - Lista de pedidos del día con comensal, curso, items, total
- Exportación PDF lista del día por curso (usar @react-pdf/renderer):
  - Agrupado por curso, para imprimir y entregar en cocina

RESTRICCIONES:
- NO tocar dashboard del día (Módulo 9) — aunque ambos leen pedidos,
  cada uno trabaja en sus propios archivos
- NO tocar gestión de menús (Módulo 10)
- Exportación síncrona (pocos pedidos por día, no necesita cola async)
- Stock nunca negativo

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue


═══════════════════════════════════════════════════════════════════
MÓDULO 12 — CIERRE MANUAL + TRANSICIONES AUTOMÁTICAS + VISTA COCINA
═══════════════════════════════════════════════════════════════════

CRÍTICO · Ejecutar SOLO y AL FINAL (depende de 9 y 10)

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────

Vas a trabajar en Enbandeja — Fase 2, Módulo 12: Cierre, cron y cocina.
Este módulo CIERRA la Fase 2.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/plan.md sección Fase 2 Semana 12 + hito de Fase 2
4. docs/agentes/backend.md
5. docs/agentes/database.md

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

ALCANCE (solo esto):
- Cierre manual de la ventana del día por el operador
  (botón que cambia estado y bloquea nuevos pedidos del día)
- Cron para transiciones automáticas de estado de menú:
  - PUBLICADO → CERRADO (al pasar hora de corte)
  - CERRADO → ARCHIVADO (al terminar el día)
  - RESPETA timezone del tenant (NUNCA hardcodear Santiago)
- Módulo Vista de Cocina:
  - Pantalla /cocina con lista de pedidos a preparar
  - Supabase Realtime: la lista se actualiza en vivo cuando llegan
    pedidos o se marcan retiros
  - Rol COCINA: solo lectura, sin botones de escritura
  - Agrupado por opción de menú (qué cantidad preparar)

RESTRICCIONES CRÍTICAS:
- El cron de transiciones DEBE respetar el timezone de cada tenant
  por separado (un tenant en Santiago y otro en otra región
  transicionan a horas distintas)
- El cron debe ser idempotente (si corre dos veces, no rompe estados)
- Rol COCINA no puede escribir NADA (validar en backend, no solo UI)
- Supabase Realtime debe filtrar por tenantId (cocina de un tenant
  no ve pedidos de otro)

AL TERMINAR:
- Actualiza ledger.md con "Fase 2 COMPLETADA"
- Verifica el hito de Fase 2 (operador opera un turno completo solo)
- pnpm type-check + lint + build
- Tests E2E: role-permissions, menu-publicacion, precios-diferenciados
  (skip documentado si requieren servidor/seed)
- Reporta resultado
- Si algo no está documentado: [PENDIENTE CONSULTA] y sigue


═══════════════════════════════════════════════════════════════════
ESTRATEGIA DE PARALELIZACIÓN (cuando uses subagentes)
═══════════════════════════════════════════════════════════════════

PROMPT PARA LANZAR MÓDULOS 9 + 11 EN PARALELO:
───────────────────────────────────────────────────────────────────

Vas a trabajar en Enbandeja — Fase 2, módulos 9 y 11 EN PARALELO.

Estos dos módulos son independientes y NO comparten archivos:
- Módulo 9 trabaja en /operador/dia
- Módulo 11 trabaja en /operador/kiosco

LECTURA OBLIGATORIA (ambos contextos):
1. ledger.md
2. CLAUDE.md
3. docs/plan.md secciones Fase 2 Semana 9 y Semana 11
4. docs/agentes/frontend.md
5. docs/agentes/database.md

Confirma con el mensaje exacto del CLAUDE.md.

Lanza DOS subagentes simultáneos:

SUBAGENTE A — Módulo 9 (Dashboard del día):
[pegar alcance del Módulo 9 de este documento]

SUBAGENTE B — Módulo 11 (Kiosco + exportaciones):
[pegar alcance del Módulo 11 de este documento]

REGLA CRÍTICA:
- Subagente A SOLO toca archivos en /operador/dia y sus componentes
- Subagente B SOLO toca archivos en /operador/kiosco y sus componentes
- Si ambos necesitan un componente compartido, lo crea UNO SOLO
  (el A) y el otro lo importa. Coordínalo tú.

CUANDO AMBOS TERMINEN:
- Consolida cambios en ledger.md
- pnpm type-check + lint + build (una sola vez, sobre todo)
- Reporta resultado de cada subagente por separado


═══════════════════════════════════════════════════════════════════
ORDEN DE EJECUCIÓN RECOMENDADO
═══════════════════════════════════════════════════════════════════

TANDA 1:  Módulos 9 + 11 en paralelo (subagentes)
          → verificar → cerrar
TANDA 2:  Módulo 10 solo (gestión de menús)
          → verificar → cerrar
TANDA 3:  Módulo 12 solo (cierre + cron + cocina) — CIERRA FASE 2
          → verificar → hito Fase 2 cumplido

VERIFICACIÓN ENTRE TANDAS:
Después de cada tanda, pasar el zip a Claude (Sonnet) para auditoría
en frío antes de avanzar a la siguiente. No acumular sin verificar.


═══════════════════════════════════════════════════════════════════
CRITERIO DE CIERRE DE FASE 2
═══════════════════════════════════════════════════════════════════

Fase 2 está cerrada cuando:
[ ] El operador ve los pedidos del día y marca retiros
[ ] El operador publica un menú para el día siguiente
[ ] El operador gestiona productos del kiosco
[ ] El operador exporta el reporte del día en PDF y Excel
[ ] La cocina ve en vivo qué preparar
[ ] El cron transiciona estados de menú respetando timezone
[ ] Rol COCINA no puede escribir nada
[ ] Build limpio: type-check + lint + build pasan
[ ] El operador puede operar un turno COMPLETO sin ayuda

Cuando los 9 puntos estén marcados → el producto es DEMOSTRABLE
a un cliente real.

═══════════════════════════════════════════════════════════════════
FIN DEL DOCUMENTO MAESTRO FASE 2
═══════════════════════════════════════════════════════════════════
