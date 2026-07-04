═══════════════════════════════════════════════════════════════════
ENBANDEJA — FASE 1 · SEMANA 5
CATÁLOGO Y MENÚ DEL APODERADO
═══════════════════════════════════════════════════════════════════

ROL: Senior Architect de Enbandeja, Semana 5 de Fase 1. Construyes
la pantalla más importante del apoderado: donde elige qué comer cada
día. Fuente de verdad: plan.md, CLAUDE.md, agentes/*, PLAN_MAESTRO_DISEÑO.md.

PROTOCOLO DE INICIO:
Confirma con:
> "Contexto absorbido. Fase 1 Semana 5 — Catálogo y menú. Semana 4
> completada. Voy a crear: home del apoderado con calendario
> expansible Samsung-style (Zona A), Bento Grid del menú del día
> (Zona B), integración con getPrecioParaComensal respetando
> CategoriaPrecio, drawer del kiosko condicional. Esperando
> autorización para Tarea 1."

LECTURA OBLIGATORIA:
1. ledger.md (verificar cierre de Semana 4)
2. docs/plan.md sección 5 Fase 1 Semana 5
3. docs/PLAN_MAESTRO_DISEÑO.md sección 3 (arquitectura mobile con
   3 zonas, calendario expansible, micro-líneas de estado)
4. docs/agentes/frontend.md
5. docs/agentes/database.md (para getPrecioParaComensal)

═══ RESTRICCIONES ═══

- NO implementar flujo de pago (Semana 6).
- NO implementar agregar al carrito lógica de pago (solo estado local).
- El carrito vive en estado del cliente (React state o Zustand),
  NO se persiste todavía.
- Calendario expansible DEBE seguir el patrón Samsung del Plan
  Maestro de Diseño (swipe-down, micro-líneas, NO texto bajo días).
- Respeto absoluto al ADN visual: Bento Cards radius 24px, Liquid
  Glass, Plus Jakarta Sans para títulos, Inter para body.

═══ TAREAS ═══

TAREA 1 — Helper getPrecioParaComensal
Verificar si existe packages/database/src/queries/precios.ts. Si no,
crearlo con la función documentada en docs/agentes/database.md
sección 8 Patrón 1:
- Recibe: db (TenantClient), opcionMenuId, comensalId
- Busca categoría del comensal, fallback a default del colegio
- Retorna precio numérico
- Maneja error si no hay precio configurado

TAREA 2 — Componente CalendarioExpansible (mobile)
Crear packages/ui/src/components/CalendarioExpansible.tsx:
- Client Component ("use client")
- Props: diaSeleccionado, onDiaSeleccionado, estadosPorDia (map
  fecha -> 'pedido' | 'disponible' | 'proximo-corte' | null)
- Estado compacto: 1 fila con 7 días (semana actual), scroll
  horizontal infinito por semanas
- Estado expandido: mes completo en grid 7 columnas
- Gesto swipe-down desde la zona del calendario activa expansión
  (usar react-swipeable o touch events nativos)
- Transición: max-height 300ms cubic-bezier(0, 0, 0.2, 1)
- Micro-líneas bajo cada número (height 2px, width 70%):
  - Verde #10B981 si estadosPorDia[fecha] === 'pedido'
  - Azul #3B5BFE si === 'disponible'
  - Ámbar #F59E0B si === 'proximo-corte'
  - Sin línea si === null
- Día seleccionado: cuadro border radius 12px con border 1px white/30
- Material del contenedor: Liquid Glass con border inferior
  1px rgba(255,255,255,0.06)
- Usar fuente Plus Jakarta Sans para nombres de días y número del mes

TAREA 3 — Componente BentoCardMenu
Crear packages/ui/src/components/BentoCardMenu.tsx:
- Server Component compatible (sin "use client" salvo que tenga
  handlers)
- Props: opcion (nombre, descripcion, fotoUrl, precio), variant
  ('hero' | 'small'), estado ('disponible' | 'seleccionado' |
  'agotado')
- Material: Liquid Glass radius 24px padding 20px
- Variant hero: ancho completo, foto 16:9 arriba radius 16px,
  nombre Plus Jakarta heading, descripción Inter body secondary,
  precio Plus Jakarta bold display
- Variant small: foto pequeña arriba, nombre 2 líneas max, precio
  abajo
- Estado seleccionado: border 1px primary + shadow-glow-primary
- Estado agotado: opacity 0.4 + overlay "Agotado"

TAREA 4 — Server Component /home
Crear apps/web/src/app/(apoderado)/home/page.tsx:
- Server Component
- Verifica sesión, si no redirige a /login
- Obtiene activeTenantId de session
- Crea db = createTenantClient(tenantId, userId)
- Query: comensales del apoderado con colegio incluido
- Query: menús publicados de los próximos 7 días para el/los
  colegios del apoderado
- Query: pedidos existentes del apoderado para esos días
- Pasa todo a HomeApoderadoClient como props

TAREA 5 — Client Component HomeApoderadoClient
Crear apps/web/src/app/(apoderado)/home/components/HomeApoderadoClient.tsx:
- "use client"
- Props: comensales, menusPorDia, pedidosExistentes
- Estado: diaSeleccionado (default hoy), comensalActivo (default
  primero de la lista)
- Estructura Master-Detail:
  - Zona A: <CalendarioExpansible />
  - Zona B: scroll vertical con:
    - Selector de comensal (tabs horizontales si hay más de 1 hijo)
    - Si no hay menú publicado para el día: empty state Bento con
      ícono CalendarX
    - Si hay menú: <BentoCardMenu variant="hero"> para opción
      seleccionada + grid 2 columnas con alternativas
    - Si colegio.kioscoActivo: botón "Agregar del kiosko" que abre
      drawer (Semana 5 no implementa el drawer completo, solo el
      trigger — puede ser placeholder)
  - Zona C: placeholder de Floating Cart (visible si hay items
    seleccionados en estado local)

TAREA 6 — Renderizado de estados del menú
Implementar los 5 estados visuales del día en el CalendarioExpansible:
1. Día con pedido confirmado → línea verde
2. Día con menú publicado sin pedido → línea azul
3. Día próximo a hora de corte (menos de 2h) → línea ámbar
4. Día sin menú publicado → sin línea, número en foreground-tertiary
5. Día pasado → sin línea, número en foreground-disabled,
   no clickeable

TAREA 7 — Drawer del kiosko (placeholder funcional)
Crear packages/ui/src/components/DrawerKiosko.tsx:
- Client Component
- Props: productos, isOpen, onClose
- Bottom sheet con Liquid Glass, radius 24px top
- Lista de productos con foto, nombre, precio, botón +/-
- Estado local del drawer (items seleccionados)
- Botón "Agregar al pedido" que cierra y pasa selección al padre

Solo integrarlo si colegio.kioscoActivo === true.

TAREA 8 — Layout del apoderado con Bottom Nav
Crear/revisar apps/web/src/app/(apoderado)/layout.tsx:
- Server Component
- Valida sesión + rol APODERADO
- Children en main con padding-bottom 96px (para bottom nav)
- <BottomNav /> al final (Client Component)

Crear packages/ui/src/components/BottomNav.tsx:
- 4 items: Inicio, Pedir, Historial, Perfil
- Active state: píldora radius 9999px con bg rgba(59,91,254,0.16)
  + texto/ícono en #5571FF
- Height 72px, fixed bottom, Liquid Glass
- Usar lucide icons stroke 1.5px size 20

TAREA 9 — Tests
Crear tests/e2e/critical/menu-apoderado.spec.ts:
- Test: "apoderado ve menú del día con precio correcto por categoría"
- Test: "calendario expande con swipe-down y muestra mes completo"
- Test: "selección de día cambia contenido de Zona B"
- Test: "día sin menú muestra empty state"

TAREA 10 — Verificación final
  pnpm type-check
  pnpm lint
  pnpm test:e2e --filter=menu-apoderado
  pnpm build

═══ CHECKLIST ANTI-PATRONES ═══

[ ] Calendario usa micro-líneas, NO texto bajo días
[ ] Swipe-down funciona con gesto táctil real
[ ] Cards radius 24px con Liquid Glass
[ ] Precios renderizan con Plus Jakarta Sans bold
[ ] Mobile-first probado en 375px
[ ] BentoCardMenu es Server Component cuando no tiene handlers
[ ] getPrecioParaComensal respeta CategoriaPrecio del comensal
[ ] Fallback a categoría default si comensal no tiene categoría

═══ LEDGER ═══

Actualizar con "Fase 1 Semana 5 — Catálogo y menú COMPLETADA",
próxima tarea "Semana 6 — Flujo de pago Webpay".

═══════════════════════════════════════════════════════════════════