# Tasks: Light-first UX Refresh

Cada tarea debe producir evidencia verificable. No iniciar una tarea si su
dependencia anterior no está aprobada.

## Fase 0 — Línea base

- [x] **T00.01** Congelar la versión de referencia del 2 de junio.
  - Evidencia: hash del archivo o commit/branch de trabajo.
- [x] **T00.02** Ejecutar build, lint, typecheck y pruebas críticas actuales.
  - Evidencia: reporte de línea base con fallos preexistentes separados.
- [x] **T00.03** Archivar el inventario visual actual como baseline.
  - Evidencia: HTML y 31 capturas identificadas como `before`.
- [x] **T00.04** Crear matriz de rutas por rol y viewport.
  - Evidencia: tabla con ruta, rol, fixture y tamaños 375/768/1024/1440.

## Fase 1 — Correcciones funcionales y fixtures

- [x] **T01.01** Corregir la redirección de `/menu/[fecha]` a `/menu/nuevo`.
  - Evidencia: navegación sin 404 y prueba E2E.
- [!] **T01.02** Crear fixture reproducible para un menú publicado.
  - Evidencia: seed/helper idempotente de prueba.
- [!] **T01.03** Crear fixture reproducible para selección de comensal y pedido
  temporal.
  - Evidencia: `/resumen` renderiza su vista real.
- [!] **T01.04** Crear fixture reproducible para pedido confirmado.
  - Evidencia: `/confirmacion` renderiza su vista real.
- [!] **T01.05** Capturar y auditar Resumen y Confirmación reales.
  - Evidencia: dos capturas nuevas y hallazgos incorporados a la spec.
- [x] **T01.06** Añadir pruebas de no-regresión para redirects del flujo.
  - Evidencia: E2E verde para home → resumen → confirmación.

## Fase 2 — Fuente de verdad visual v2

- [x] **T02.01** Redactar propuesta visual v2 en
  `docs/PLAN_MAESTRO_DISEÑO.md`.
  - Evidencia: light-first, densidad por rol y accesibilidad documentadas.
- [x] **T02.02** Actualizar `docs/agentes/design-system.md`.
  - Evidencia: reglas operativas alineadas con v2.
- [x] **T02.03** Definir paleta semántica light-first.
  - Evidencia: tabla de tokens con contraste medido.
- [x] **T02.04** Definir escala de superficies, bordes y elevación.
  - Evidencia: tokens aprobados; radio habitual máximo 16 px.
- [x] **T02.05** Definir estados de interacción.
  - Evidencia: default, hover, focus, active, disabled, loading y error.
- [x] **T02.06** Definir reglas de densidad por rol.
  - Evidencia: apoderado, operador/cocina y owner/admin documentados.
- [x] **T02.07** Aprobar visualmente dirección v2 antes de implementar.
  - Evidencia: decisión explícita de Christian.

## Fase 3 — Tokens y base técnica

- [x] **T03.01** Refactorizar colores a tokens semánticos en
  `design-system.ts`.
  - Evidencia: no se eliminan estados de dominio.
- [x] **T03.02** Sincronizar tokens de Tailwind.
  - Evidencia: nombres equivalentes en Tailwind y TypeScript.
- [x] **T03.03** Actualizar `globals.css` para tema claro predeterminado.
  - Evidencia: fondo, texto, selección y focus visibles.
- [x] **T03.04** Definir variante dark compatible o registrar su postergación.
  - Evidencia: decisión implementada/documentada.
- [x] **T03.05** Crear pruebas o validación automática de contraste de tokens.
  - Evidencia: pares esenciales cumplen WCAG AA.
- [x] **T03.06** Buscar colores visuales hardcodeados.
  - Evidencia: inventario por archivo y plan de reemplazo.

## Fase 4 — Componentes base

- [x] **T04.01** Adaptar Button al tema claro y estados completos.
  - Evidencia: variantes, foco, disabled y loading.
- [x] **T04.02** Adaptar Input con labels, ayuda y errores accesibles.
  - Evidencia: formulario usable por teclado.
- [x] **T04.03** Adaptar Card y eliminar liquid glass como default.
  - Evidencia: surface, border y elevation consistentes.
- [x] **T04.04** Adaptar Badge para no depender solo del color.
  - Evidencia: texto/icono y contraste.
- [x] **T04.05** Crear EmptyState.
  - Evidencia: ejemplos con y sin CTA.
- [x] **T04.06** Crear StatusBadge.
  - Evidencia: pedidos, menús y suscripciones cubiertos.
- [x] **T04.07** Crear PlanLimit.
  - Evidencia: normal, warning, crítico e ilimitado.
- [x] **T04.08** Crear MetricCard.
  - Evidencia: datos, loading, empty y error.
- [x] **T04.09** Crear SectionHeader.
  - Evidencia: mobile/desktop con acciones.
- [x] **T04.10** Crear FeedbackState.
  - Evidencia: skeleton, error recuperable y success.
- [x] **T04.11** Exportar componentes desde `packages/ui`.
  - Evidencia: build del paquete.

## Fase 5 — Piloto visual

### Apoderado Home

- [x] **T05.01** Aplicar shell light-first al layout apoderado.
- [x] **T05.02** Rediseñar jerarquía de fecha, menú y comensales.
- [x] **T05.03** Reemplazar estados vacíos por EmptyState accionable.
- [x] **T05.04** Validar navegación inferior y touch targets.
- [x] **T05.05** Capturar 375/768/1440 y probar teclado.

### Dashboard operador

- [x] **T05.06** Aplicar shell claro y densidad operativa.
- [x] **T05.07** Migrar métricas a MetricCard.
- [x] **T05.08** Corregir tabs, filtros y etiquetas semánticas.
- [x] **T05.09** Crear estado vacío con siguiente acción.
- [x] **T05.10** Capturar 768/1024/1440 y probar teclado.

### Dashboard owner

- [x] **T05.11** Aplicar shell claro al layout owner.
- [x] **T05.12** Mejorar rango, filtros y contexto de KPI.
- [x] **T05.13** Implementar empty/loading/error de snapshots.
- [x] **T05.14** Validar gráficos con leyenda y resumen textual.
- [x] **T05.15** Capturar 768/1024/1440 y probar teclado.

### Gate

- [x] **T05.16** Generar comparativa antes/después del piloto.
- [!] **T05.17** Registrar feedback de Christian.
- [x] **T05.18** Ajustar tokens/componentes una única segunda pasada.
- [x] **T05.19** Aprobar o rechazar expansión al resto del producto.

## Fase 6 — Migración del flujo apoderado

- [x] **T06.01** Migrar login y registro.
- [x] **T06.02** Migrar vinculación por código.
- [x] **T06.03** Migrar selección de comensal.
- [x] **T06.04** Migrar resumen real.
- [x] **T06.05** Migrar confirmación real.
- [x] **T06.06** Migrar historial.
- [x] **T06.07** Migrar perfil y crédito.
- [x] **T06.08** Verificar flujo completo mobile.

## Fase 7 — Migración operador y cocina

- [x] **T07.01** Migrar calendario de menús con leyenda de estados.
- [x] **T07.02** Migrar creación de menú.
- [x] **T07.03** Migrar detalle de menú por fecha.
- [x] **T07.04** Migrar kiosco y su estado vacío.
- [x] **T07.05** Migrar cocina preservando lectura rápida.
- [x] **T07.06** Verificar permisos y navegación por rol.

## Fase 8 — Migración owner y billing

- [x] **T08.01** Migrar datos de empresa.
- [x] **T08.02** Migrar colegios usando PlanLimit.
- [x] **T08.03** Migrar usuarios usando PlanLimit/StatusBadge.
- [x] **T08.04** Migrar reportes y estados de exportación.
- [x] **T08.05** Migrar billing owner.
- [x] **T08.06** Eliminar duplicación visual de límites.

## Fase 9 — Setup y Super Admin

- [x] **T09.01** Migrar shell/progreso del setup.
- [x] **T09.02** Migrar empresa y colegio.
- [x] **T09.03** Migrar pasarela y simplificar bloque informativo.
- [x] **T09.04** Migrar importación de comensales.
- [x] **T09.05** Migrar categorías y primer menú.
- [x] **T09.06** Migrar listado de tenants.
- [x] **T09.07** Migrar billing Super Admin reutilizando PlanLimit.

## Fase 10 — Calidad transversal

- [x] **T10.01** Auditar contraste WCAG AA.
- [!] **T10.02** Auditar navegación por teclado y focus order.
- [x] **T10.03** Auditar touch targets.
- [x] **T10.04** Auditar headings, landmarks y labels.
- [x] **T10.05** Auditar responsive en cuatro viewports.
- [x] **T10.06** Auditar horizontal overflow.
- [x] **T10.07** Auditar loading, vacío, error y feedback post-acción.
- [x] **T10.08** Auditar `prefers-reduced-motion`.
- [x] **T10.09** Auditar colores hardcodeados y componentes duplicados.

## Fase 11 — Verificación y entrega

- [x] **T11.01** Ejecutar install/build/lint/typecheck/tests.
- [x] **T11.02** Ejecutar E2E crítico por rol.
- [x] **T11.03** Regenerar inventario visual completo.
- [x] **T11.04** Comparar las 31 rutas antes/después.
- [x] **T11.05** Revisar consola y logs sin errores nuevos.
- [x] **T11.06** Completar `PRE-ENTREGA.md`.
- [x] **T11.07** Actualizar `ledger.md`.
- [x] **T11.08** Crear handoff versionado.
- [x] **T11.09** Someter diff a code review.
- [!] **T11.10** Esperar aprobación antes de merge/deploy.

