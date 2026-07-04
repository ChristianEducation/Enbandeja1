# ENBANDEJA — PLAN MAESTRO DE DISEÑO
**Fecha:** Abril 2026
**Versión:** 2.0
**Autor:** Christian Wevar
**Rol al generar:** Principal Product Designer + UI/UX Architect
**Destinatario:** Claude Code + Agente Frontend + futuras instancias
**Estado:** ✅ FUENTE ÚNICA DE VERDAD VISUAL — LIGHT-FIRST

> **Regla #0:** Este documento es la única fuente de verdad para la
> capa visual y de UX de Enbandeja. Ninguna decisión de UI se toma
> sin verificar contra este documento.
>
> **Regla #1:** Si Claude Code o el Agente Frontend proponen un
> patrón visual no listado acá, se rechaza y se redirige al
> capítulo correspondiente.
>
> **Regla #2:** Los cambios al ADN visual se registran en el
> `ledger.md` y requieren bump de versión de este documento.

---

## ÍNDICE

```
1. ADN VISUAL Y TOKENS
2. ANTI-PATRONES Y PROHIBICIONES
3. ARQUITECTURA CORE — APP APODERADO (Mobile)
4. ARQUITECTURA CORE — PANEL OPERADOR/OWNER (Desktop/Tablet)
5. REGLAS DE GENERACIÓN PARA EL AGENTE FRONTEND
```

---

## 1. ADN VISUAL Y TOKENS

### 1.1 Filosofía de diseño

Enbandeja es una herramienta operativa **profesional, premium y
nocturna por defecto**. La estética viene de la fusión deliberada
de tres referentes:

- **Vroom (Azul Eléctrico):** confianza, decisión, acción inmediata
- **Bento Cards (Dark Glass):** modularidad, jerarquía visual,
  modernidad sin saturación
- **MediCon (Trust médico):** legibilidad clínica, generosidad
  de espacio

El producto se siente como un **dashboard de operación** que un
operador de casino maneja desde su tablet a las 7 AM, no como una
app de delivery dirigida a niños. Premium, técnica, confiable.

**Decisión core v2: Light mode primero.** La interfaz predeterminada usa
fondos claros, superficies blancas y jerarquía por espacio y borde. Dark mode
puede mantenerse como variante secundaria, sin condicionar la composición.

La personalidad sigue siendo profesional y operativa. El tono educativo se
expresa mediante claridad, ayuda contextual y estados que enseñan el siguiente
paso; nunca mediante tipografías infantiles, colores neón o gamificación.

### 1.2 Paleta exacta

```
═══════════════════════════════════════════════════════════════
COLORES BASE — LIGHT MODE (default)
═══════════════════════════════════════════════════════════════

Background:
  --color-background:        #F4F7FB
  --color-surface:           #FFFFFF
  --color-surface-elevated:  #F8FAFC
  --color-surface-glass:     rgba(255, 255, 255, 0.94)

Text:
  --color-text-primary:      #172033
  --color-text-secondary:    #526078
  --color-text-tertiary:     #637087
  --color-text-disabled:     #98A2B3

Brand:
  --color-primary:           #3B5BFE   (Azul Eléctrico Vroom — CORE)
  --color-primary-hover:     #5571FF
  --color-primary-pressed:   #2D48E8
  --color-primary-foreground: #FFFFFF

Borders:
  --color-border-subtle:     #EEF2F7
  --color-border-default:    #DCE3ED
  --color-border-strong:     #C4CEDD

Semánticos (uso restringido):
  --color-success:           #10B981
  --color-warning:           #F59E0B
  --color-info:              #3B5BFE   (mismo que primary)

  --color-error-DEPRECATED:  /* Ver Capítulo 2 — Anti-patrones */

═══════════════════════════════════════════════════════════════
COLORES BASE — LIGHT MODE (secundario)
═══════════════════════════════════════════════════════════════

  --color-background-light:        #F5F6FA
  --color-surface-light:           #FFFFFF
  --color-surface-elevated-light:  #FAFBFD
  --color-text-primary-light:      #0D0F1A
  --color-text-secondary-light:    #6B7280
  --color-border-default-light:    rgba(13, 15, 26, 0.08)
```

**Prohibiciones inmediatas:** ver Capítulo 2.

### 1.3 Tipografía

Sistema de **dos fuentes con roles claros**:

```
Plus Jakarta Sans  →  títulos, headings, números grandes, CTAs
Inter              →  body, datos densos, tablas, métricas, captions
```

Razón de la dupla: Plus Jakarta Sans tiene personalidad y peso
visual fuerte para los momentos de impacto (totales, hora de corte,
nombre del comensal). Inter tiene legibilidad superior para datos
densos (listas de pedidos, tablas del operador).

```
═══════════════════════════════════════════════════════════════
ESCALA TIPOGRÁFICA
═══════════════════════════════════════════════════════════════

  --text-display:    32px / 1.15 / bold      / -0.02em / Plus Jakarta
  --text-title:      24px / 1.20 / bold      / -0.015em / Plus Jakarta
  --text-heading:    20px / 1.30 / semibold  / -0.01em / Plus Jakarta
  --text-subheading: 17px / 1.35 / semibold  / -0.005em / Plus Jakarta
  --text-body:       15px / 1.50 / regular   / 0 / Inter
  --text-body-medium:15px / 1.50 / medium    / 0 / Inter
  --text-small:      13px / 1.45 / regular   / 0.01em / Inter
  --text-caption:    11px / 1.40 / medium    / 0.02em / Inter
  --text-mono:       13px / 1.40 / regular   / 0 / JetBrains Mono
```

**Regla:** los **montos en CLP** siempre van en **Plus Jakarta Sans
bold** (jerarquía de "número que importa"). Los IDs, códigos de
casino, transactionIds, fechas técnicas van en **JetBrains Mono**.

### 1.4 Sistema de espaciado base 8px

```
═══════════════════════════════════════════════════════════════
ESCALA DE ESPACIADO (múltiplos de 8px, con 4 para casos sutiles)
═══════════════════════════════════════════════════════════════

  --space-0:     0
  --space-1:     4px    (micro)
  --space-2:     8px    (small)
  --space-3:    12px    (compact)
  --space-4:    16px    (base)
  --space-5:    20px    (medium)
  --space-6:    24px    (default — gap entre cards Bento)
  --space-8:    32px    (large)
  --space-10:   40px    (xl)
  --space-12:   48px    (2xl)
  --space-16:   64px    (3xl — separación de secciones grandes)

Aplicaciones:
  Card padding interno:      16px o 20px
  Gap entre Bento cards:     12px (mobile) / 16px (desktop)
  Margen horizontal mobile:  20px
  Margen horizontal desktop: 32px o 48px
  Section gap vertical:      24px
```

### 1.5 Formas, radios y materiales

```
═══════════════════════════════════════════════════════════════
RADIOS
═══════════════════════════════════════════════════════════════

  --radius-sm:    8px       (badges, chips, tags)
  --radius-md:   12px       (botones, inputs, acciones)
  --radius-lg:   16px       (cards secundarias)
  --radius-xl:   24px       (Bento cards CORE — todos los contenedores)
  --radius-2xl:  32px       (cards heroicas, modales grandes)
  --radius-full: 9999px     (avatares, FABs, píldoras de nav)

═══════════════════════════════════════════════════════════════
LIQUID GLASS REFINADO (material principal)
═══════════════════════════════════════════════════════════════

Patrón base obligatorio para Bento cards en dark mode:

  background:       rgba(26, 29, 46, 0.6)
  backdrop-filter:  blur(16px) saturate(180%)
  border:           1px solid rgba(255, 255, 255, 0.10)
  border-radius:    24px
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,    /* highlight superior */
    0 8px 32px rgba(0, 0, 0, 0.32)              /* sombra ambient */

Reglas estrictas:
- blur MÁXIMO 16px (nunca más, evita el efecto "vidrio sucio")
- border SIEMPRE 1px white/10 (nunca más grueso)
- saturate(180%) para que los colores debajo respiren
- NUNCA stack de más de 2 niveles de glass (anidar glass dentro de
  glass dentro de glass = pérdida de jerarquía)

═══════════════════════════════════════════════════════════════
SHADOWS
═══════════════════════════════════════════════════════════════

  --shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.20)
  --shadow-md:  0 4px 16px rgba(0, 0, 0, 0.28)
  --shadow-lg:  0 8px 32px rgba(0, 0, 0, 0.32)
  --shadow-xl:  0 16px 48px rgba(0, 0, 0, 0.40)

  --shadow-glow-primary:
    0 0 0 1px rgba(59, 91, 254, 0.40),
    0 8px 24px rgba(59, 91, 254, 0.32)
```

### 1.6 Patrones de componentes core

**Botón Primario:**
```
height:        48px (mobile) / 44px (desktop)
border-radius: 12px
background:    #3B5BFE
color:         #FFFFFF
font:          Plus Jakarta Sans semibold 15px
padding:       0 24px
hover:         #5571FF + shadow-glow-primary
disabled:      opacity 0.4
```

**Botón Secundario (Ghost):**
```
height:        48px / 44px
border-radius: 12px
background:    transparent
border:        1px solid rgba(255, 255, 255, 0.16)
color:         #FFFFFF
hover:         background rgba(255, 255, 255, 0.04)
```

**Bento Card:**
```
material:      Liquid Glass (ver 1.5)
border-radius: 24px
padding:       20px
gap interno:   16px entre elementos
```

**Input:**
```
height:        48px
border-radius: 12px
background:    rgba(255, 255, 255, 0.04)
border:        1px solid rgba(255, 255, 255, 0.10)
focus border:  1px solid #3B5BFE + shadow-glow-primary
font:          Inter regular 15px
placeholder:   #6B7280
```

**Badge / Pill:**
```
height:        24px o 28px
border-radius: 9999px (full pill)
padding:       0 10px
font:          Inter medium 12px
background:    rgba(59, 91, 254, 0.16)  (variante info)
color:         #5571FF
```

**Iconografía:** Lucide React, stroke 1.5px, tamaño base 20px.

---

## 2. ANTI-PATRONES Y PROHIBICIONES

Lista no negociable de errores visuales y de UX que **están
prohibidos** en cualquier pantalla de Enbandeja. Si Claude Code o
el Agente Frontend proponen alguno, se rechaza inmediatamente.

### 2.1 Color — prohibiciones absolutas

❌ **Prohibido todo morado/púrpura.** Excluye explícitamente la
paleta del HRMS DNA (#7C3AED, #A78BFA, #8B5CF6) y cualquier tono
violeta. Razón: Enbandeja NO es una app de HR ni de "trendy SaaS",
es una herramienta operativa seria.

❌ **Prohibido el rojo como color de error visible.** El rojo en
contextos de operación de comida genera ansiedad. Para errores
usamos:
- Texto: `#F59E0B` (warning ámbar)
- Borde: `border: 1px solid #F59E0B`
- Iconos: warning triangle ámbar

El rojo solo aparece en **dos** contextos extremos: cancelación
destructiva confirmada (botón "Cancelar suscripción" con confirmación
literal) y estados `EXPIRADO` en logs internos del Super Admin.

❌ **Prohibido el verde "ecológico" saturado** (tipo `#22c55e`
brillante). El success usa `#10B981`, más sobrio.

❌ **Prohibidos los gradientes multicolor** (purple-pink-blue).
Si se usa gradiente, es **monocromático azul** (`#3B5BFE` →
`#2D48E8`).

### 2.2 Tipografía — prohibiciones

❌ **Prohibido mezclar más de 2 fuentes.** Solo Plus Jakarta Sans +
Inter (+ JetBrains Mono para datos técnicos puntuales).

❌ **Prohibido texto con contraste menor a 4.5:1** sobre el fondo.
Verificar con herramientas de accesibilidad antes de mergear.

❌ **Prohibido el `text-tertiary` (#6B7280) para datos críticos.**
Solo para metadata secundaria (timestamps, hints).

### 2.3 Layout — prohibiciones

❌ **Prohibidas las listas planas tipo `<ul><li>`** sin
contenedor. Todo contenido se modulariza en Bento Cards.

❌ **Prohibidas las acciones críticas escondidas en menús
hamburguesa.** Acciones primarias (Pedir, Pagar, Publicar Menú,
Marcar Retirado) siempre visibles directamente en la pantalla.

❌ **Prohibido el menú hamburguesa como navegación principal.**
Bottom nav en mobile, sidebar permanente en desktop.

❌ **Prohibido más de 5 items en bottom nav.** Si hay más, se
agrupan en un drawer.

### 2.4 Glass — prohibiciones

❌ **Prohibido blur > 16px.** Genera "vidrio sucio".

❌ **Prohibido glass anidado más de 2 niveles.** Glass → glass →
glass = pérdida de jerarquía.

❌ **Prohibido glass sobre fondos blancos** (en light mode el glass
no se usa, se reemplaza por surface sólida con shadow).

### 2.5 UX — prohibiciones

❌ **Prohibido pedir confirmación para acciones reversibles.** Si
el apoderado cancela un item, no se le pregunta "¿estás seguro?" si
todavía está dentro de la ventana de cancelación. Solo se confirma
para acciones irreversibles (cancelar suscripción, eliminar tenant).

❌ **Prohibidos los modales para flujos largos.** Los modales son
para confirmaciones cortas. Los flujos (registro, setup wizard,
crear menú) van en pantallas dedicadas.

❌ **Prohibidos los toasts de éxito que duran < 2 segundos.**
Mínimo 3 segundos para que el usuario los lea.

❌ **Prohibido el scroll infinito sin paginación visible** en
contextos del operador. El operador necesita saber "voy en el
pedido 23 de 47", no flotar en el vacío.

---

## 3. ARQUITECTURA CORE — APP APODERADO (Mobile)

Esta sección documenta el patrón **Master-Detail con 3 zonas
ancladas** que rige toda la app del apoderado. Es la decisión de
arquitectura visual más importante del producto.

### 3.1 Vista general — 3 zonas

```
┌─────────────────────────────────────┐
│                                     │
│   ZONA A — TOP                      │
│   Calendario expansible             │
│   (Filtro Maestro temporal)         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│                                     │
│   ZONA B — CENTRO                   │
│   Bento Grid scrolleable            │
│   (Menú del día + Kiosko drawer)    │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│   ZONA C — BOTTOM                   │
│   Floating Cart Summary             │
│   ───────────────────────           │
│   Bottom Nav (píldora active)       │
└─────────────────────────────────────┘
```

### 3.2 ZONA A — Calendario expansible (Samsung-style)

**Comportamiento basado en Anexo 2 (capturas Samsung Calendar):**

**Estado por defecto — Compacto (1 fila, scroll horizontal):**

```
DOM   LUN   MAR   MIÉ   JUE   VIE   SÁB
 5     6     7     8     9    [10]   11
 ─           ─           ─    
                                      
```

- 1 sola fila visible con la semana activa
- Día actual destacado con cuadro redondeado (radius 12px) y borde
  blanco/30
- **Micro-líneas de estado bajo cada número** (NO texto):
  - Línea verde (#10B981) → día con pedido confirmado
  - Línea azul (#3B5BFE) → día disponible para pedir
  - Línea ámbar (#F59E0B) → día con pedido cerca de la hora de corte
  - Sin línea → día sin menú o pasado
- Scroll horizontal infinito (semana anterior / siguiente con
  swipe lateral)
- Header arriba: mes y año en `text-title` (24px Plus Jakarta bold)

**Estado expandido — Mes completo (gesto swipe-down):**

```
        ABR  
DOM  LUN  MAR  MIÉ  JUE  VIE  SÁB
 29   30   31    1    2    3    4
                  ─    ─    ─    ─
  5    6    7    8    9  [10]  11
  ─              ─               
 12   13   14   15   16   17   18
                 ─               
 19   20   21   22   23   24   25
                 ─               
 26   27   28   29   30    1    2
                 ─          ─    
```

- Activado por **swipe-down desde la zona del calendario**
- Expansión fluida con `transition: height 300ms ease-out`
- Colapso automático al hacer tap en un día específico
- Mismo sistema de micro-líneas como indicadores de estado
- Header con mes navegable (flechas izquierda/derecha)

**Decisión clave:** los micro-líneas reemplazan texto descriptivo
("Reunión Coordina..." del Anexo 1 de Samsung). En Enbandeja los
días son slots de almuerzo, no eventos con título — el código de
color basta para entender el estado.

**Material:** la zona del calendario tiene fondo Liquid Glass con
borde inferior `1px solid rgba(255,255,255,0.06)` separándola de
la Zona B.

### 3.3 ZONA B — Bento Grid scrolleable

Centro de la pantalla. Contiene el contenido del día seleccionado
en la Zona A.

**Estructura por defecto cuando hay menú publicado:**

```
┌──────────────────────────────┐
│ [Bento Card — Hero]          │
│ Opción del día seleccionada  │
│ (foto + nombre + precio)     │
│ radius: 24px                 │
│ height: ~200px               │
└──────────────────────────────┘

┌──────────────┬───────────────┐
│ [Bento sm]   │ [Bento sm]    │
│ Opción 2     │ Opción 3      │
│ height: ~160 │ height: ~160  │
└──────────────┴───────────────┘

┌──────────────────────────────┐
│ [Bento — Kiosko]             │
│ "Agregar del kiosko"         │
│ Drawer trigger               │
│ (solo si kioscoActivo)       │
└──────────────────────────────┘

┌──────────────────────────────┐
│ [Bento — Comensales]         │
│ Tabs por hijo (si aplica)    │
└──────────────────────────────┘
```

**Reglas del Bento Grid:**

- Gap entre cards: **12px**
- Padding horizontal del scroll: **20px**
- Cards Liquid Glass con `radius: 24px`
- La "card hero" ocupa el ancho completo
- Las cards secundarias van en grid 2 columnas
- Scroll vertical único (no horizontal anidado dentro del Bento)
- Foto del plato: ratio 16:9 con `border-radius: 16px` interno

**Estados especiales:**

- **Sin menú publicado:** Bento card empty state con ícono
  `CalendarX` lucide y texto "Aún no hay menú publicado para este día"
- **Pasado el corte:** todas las cards se vuelven `opacity: 0.4` y
  no son clickeables
- **Día con pedido confirmado:** card hero muestra badge "Pedido
  confirmado" con check verde

### 3.4 ZONA C — Floating Cart Summary + Bottom Nav

**Floating Cart (visible solo si hay items en el carrito):**

```
┌────────────────────────────────────┐
│  [Bento Glass]  3 items   $12.000  │
│                          [Pagar →] │
└────────────────────────────────────┘
```

- Material: Liquid Glass con `backdrop-filter: blur(16px)`
- `border-radius: 16px`
- Posición: `position: fixed; bottom: 88px; left: 16px; right: 16px;`
- Aparece con animación slide-up + fade desde abajo
- Tap en cualquier parte abre `/resumen`
- El botón "Pagar →" es atajo directo si el usuario ya revisó

**Bottom Nav (siempre visible):**

```
┌────────────────────────────────────┐
│   🏠      📅       📋       👤    │
│ [Inicio]                            │
└────────────────────────────────────┘
```

- 4 items: Inicio, Pedir, Historial, Perfil
- Active state: **píldora redondeada** (radius 9999px) con fondo
  `rgba(59, 91, 254, 0.16)` y texto + ícono en `#5571FF` (patrón
  HRMS pero adaptado a azul)
- Inactive: ícono outline en `#9CA3AF`
- Height: 72px (incluye safe area inferior)
- Material: Liquid Glass con borde superior `1px white/10`

### 3.5 Patrón Master-Detail aplicado

El calendario (Zona A) es el **Master**. El Bento Grid (Zona B) es
el **Detail** que cambia según el día seleccionado en el master.

Cambiar de día con tap en el calendario hace transición suave del
contenido de la Zona B (`opacity 0 → 1` en 200ms). El scroll
vertical de la Zona B se resetea al top con cada cambio de día.

---

## 4. ARQUITECTURA CORE — PANEL OPERADOR/OWNER (Desktop/Tablet)

El mismo ADN visual escala a pantallas grandes con **adaptaciones
funcionales**, no estéticas. El operador necesita densidad de
información, el owner necesita métricas grandes.

### 4.1 Layout base desktop (≥1024px)

```
┌────────┬────────────────────────────────────┐
│        │  Top Bar (search, user, notifs)    │
│ Side   ├────────────────────────────────────┤
│ bar    │                                    │
│        │  Workspace                         │
│ 240px  │  (Bento Grid o tabla densa)        │
│        │                                    │
│ glass  │  padding: 32px                     │
│        │                                    │
└────────┴────────────────────────────────────┘
```

- **Sidebar:** 240px ancho fijo, Liquid Glass, items con píldora
  active state azul (mismo patrón mobile)
- **Top bar:** 64px alto, search global, avatar + notif bell
- **Workspace:** padding 32px, gap entre cards 16px

### 4.2 Vista del operador — Lista del día

Patrón **tabla limpia estilo Packo** con filas Bento individuales:

```
┌─────────────────────────────────────────────┐
│ Hoy · Lunes 14 abril    [Filtros] [Export]  │
├─────────────────────────────────────────────┤
│  47 pedidos    32 retirados    15 pendientes│
│  ─── grid 3 cards Bento métricas ───        │
├─────────────────────────────────────────────┤
│ [Avatar] Juan Pérez  6°B  Opción 1  [✓]    │
│ [Avatar] María Soto  3°A  Hipocal   [○]    │
│ [Avatar] Pedro Lara  6°B  Opción 1  [○]    │
│ ...                                         │
└─────────────────────────────────────────────┘
```

- Filas: 64px alto, hover `background: rgba(255,255,255,0.04)`
- Avatares circulares 40px
- Botón retirar: checkbox circular grande (32px), tap → fill azul
  con check blanco
- Filtros: pills azules en línea horizontal (curso, opción, estado)
- Export: botón secondary con ícono download

### 4.3 Vista del owner — Dashboard

Bento Grid de métricas grandes:

```
┌──────────────┬──────────────┬──────────────┐
│ Ingresos hoy │ Pedidos hoy  │ Tasa retiro  │
│ $458.000     │ 47           │ 87%          │
│ ↑12% vs ayer │ ↑3 vs ayer   │ ↑5 vs sem    │
└──────────────┴──────────────┴──────────────┘
┌─────────────────────────┬───────────────────┐
│ Ingresos últimos 30 días│ Top 5 opciones    │
│ [gráfico de líneas]     │ [barras]          │
│ Recharts                │ Recharts          │
└─────────────────────────┴───────────────────┘
```

- Métricas grandes: número en `text-display` (32px) Plus Jakarta
- Trend con flecha y porcentaje en `text-small` semáforo
- Gráficos Recharts con paleta monocromática azul
- Cards Bento con `radius: 24px` y Liquid Glass

### 4.4 Vista de cocina (modo lectura grande)

Pantalla optimizada para verse a 3 metros de distancia:

- Tipografía 50% más grande que en otras vistas
- Solo Bento cards de conteos por opción
- Sin interacciones (es solo lectura)
- Background absoluto `#0D0F1A` para máximo contraste
- Sin sidebar ni top bar (full-screen)

### 4.5 Botones del kiosko (operador)

Para el flujo de entrega rápida en el casino, los botones son
**masivos y de alto contraste** (patrón Packo):

```
height:        72px
border-radius: 16px
background:    #3B5BFE
color:         #FFFFFF
font:          Plus Jakarta semibold 20px
shadow:        shadow-glow-primary
```

Razón: el operador los toca con el dedo mientras tiene la otra
mano ocupada. Necesitan ser imposibles de errar.

---

## 5. REGLAS DE GENERACIÓN PARA EL AGENTE FRONTEND

Esta sección es el **system prompt** que el Agente Frontend debe
acatar siempre que se le pida "crear una pantalla nueva" o
"componente nuevo" en Enbandeja.

### 5.1 Protocolo de inicio de toda tarea de UI

Antes de generar cualquier código de componente o página, el
Agente Frontend **debe**:

1. Leer este `PLAN_MAESTRO_DISEÑO.md` completo
2. Identificar a cuál capítulo pertenece la pantalla solicitada
   (App apoderado mobile / Panel operador desktop / etc.)
3. Confirmar con el siguiente mensaje exacto:

> "Plan Maestro de Diseño absorbido. Pantalla a generar: [nombre].
> Patrón base: [Bento Grid mobile / Tabla densa desktop / etc.].
> Tokens a aplicar: ADN dark, Liquid Glass, Plus Jakarta + Inter,
> radius 24px Bento. Zero anti-patrones. ¿Procedo?"

Si Christian autoriza, procede. Si no, se detiene.

### 5.2 Reglas no negociables

**Regla 1 — Tokens desde `design-system.ts`:**
Ningún color, spacing, radius o sombra se hardcodea. Todo viene
del archivo `packages/ui/src/lib/design-system.ts` que se actualiza
con los tokens de este documento.

```tsx
// ✅ CORRECTO
<div className="bg-surface rounded-2xl p-5 backdrop-blur-glass">

// ❌ PROHIBIDO
<div style={{ background: '#1A1D2E', borderRadius: 24, padding: 20 }}>
```

**Regla 2 — Componentes del kit primero:**
Si existe un componente en `@enbandeja/ui` (`Button`, `Card`,
`Input`, `Badge`, `BentoCard`, `Avatar`), se usa ese. No se crean
componentes paralelos.

**Regla 3 — Bento por default:**
Cualquier sección de contenido se envuelve en `<BentoCard>`. Las
listas planas están prohibidas (anti-patrón 2.3).

```tsx
// ✅ CORRECTO
<BentoCard variant="glass" radius="xl">
  <h3 className="text-heading">Pedidos del día</h3>
  <PedidosList items={pedidos} />
</BentoCard>

// ❌ PROHIBIDO
<ul>
  {pedidos.map(p => <li>{p.nombre}</li>)}
</ul>
```

**Regla 4 — Mobile-first siempre:**
Toda pantalla se diseña primero para viewport 375px y escala con
breakpoints Tailwind (`sm`, `md`, `lg`, `xl`). El Agente Frontend
nunca empieza por desktop.

**Regla 5 — Server Components por default:**
Toda página es Server Component salvo que necesite interactividad
(ya documentado en `agentes/frontend.md`). Los formularios y
controles interactivos van en Client Components separados que
reciben props.

**Regla 6 — Validar contra anti-patrones antes de entregar:**
Antes de marcar una tarea como completa, el Agente Frontend hace
checklist mental:

- [ ] ¿Cero morados, cero rojos prohibidos?
- [ ] ¿Cero listas planas, todo en Bento?
- [ ] ¿Cero acciones críticas escondidas en hamburguesa?
- [ ] ¿Cero glass con blur > 16px?
- [ ] ¿Cero hardcoded colors/spacings/radius?
- [ ] ¿Cero text-tertiary en datos críticos?
- [ ] ¿Plus Jakarta para títulos, Inter para body?

Si alguno falla → corregir antes de entregar.

**Regla 7 — Iconos solo Lucide:**
Todos los íconos vienen de `@enbandeja/ui/icons` (re-export de
`lucide-react`). Stroke 1.5px, tamaño base 20px. Nunca se importan
íconos de otras librerías ni se usan emojis como íconos
funcionales.

**Regla 8 — Animaciones moderadas:**
Transiciones entre 150ms y 300ms con `ease-out` o `ease-in-out`.
Nunca > 500ms (se siente lento). Las animaciones llamativas
(rebote, elasticidad) están reservadas para feedback de éxito
puntual, no para navegación.

**Regla 9 — Accesibilidad mínima:**
- Contraste texto/fondo ≥ 4.5:1 (WCAG AA)
- Botones con `aria-label` si solo tienen ícono
- Focus visible obligatorio (no `outline: none` sin reemplazo)
- Tamaño táctil mínimo 44x44px en mobile

**Regla 10 — Si el usuario pide algo fuera del ADN, detente y
pregunta:**
Si Christian dice "agrega un botón rojo" o "ponle un degradado
morado", el Agente Frontend NO obedece silenciosamente. Responde:

> "Lo solicitado contradice el Plan Maestro de Diseño (anti-patrón
> X.Y). ¿Es un cambio fundacional al ADN visual (actualizo el plan)
> o un caso excepcional puntual?"

Y espera autorización antes de proceder.

### 5.3 System prompt embebible

El siguiente bloque puede pegarse directamente en cualquier sesión
de Claude Code que vaya a tocar UI:

```
═══════════════════════════════════════════════════════════════
SYSTEM PROMPT — AGENTE FRONTEND ENBANDEJA
═══════════════════════════════════════════════════════════════

Eres el Agente Frontend de Enbandeja. Tu identidad visual está
regida por docs/PLAN_MAESTRO_DISEÑO.md.

Antes de generar cualquier código de UI:
1. Lee el Plan Maestro de Diseño completo
2. Identifica la zona arquitectónica (App apoderado / Operador / 
   Owner / Cocina / Super Admin)
3. Confirma con el protocolo de inicio (sección 5.1)

Reglas no negociables (sección 5.2):
- Tokens desde design-system.ts, jamás hardcoded
- Componentes de @enbandeja/ui primero
- Bento Cards por default, listas planas prohibidas
- Mobile-first (375px → up)
- Server Components por default
- Lucide icons stroke 1.5px tamaño 20
- Plus Jakarta Sans (títulos) + Inter (body)
- Liquid Glass con blur máximo 16px
- Cero morados, cero rojos prohibidos
- Cero acciones críticas en hamburguesa

Anti-patrones (sección 2): rechazar inmediatamente.

Si el usuario pide algo fuera del ADN: detente y pregunta si es
cambio fundacional o excepción puntual.

ADN core en una línea:
Dark mode primero · Azul Eléctrico #3B5BFE · Bento Glass radius
24px · Plus Jakarta + Inter · Spacing base 8 · Mobile-first
═══════════════════════════════════════════════════════════════
```

---

## RESUMEN DEL PLAN MAESTRO DE DISEÑO

Enbandeja tiene un **ADN visual coherente, dark-first, premium y
operativo** construido sobre la fusión deliberada de Vroom (azul
eléctrico), Bento Cards (modularidad glassmórfica) y MediCon
(legibilidad clínica).

**Core en 5 líneas:**
1. **Dark mode primero**, light mode secundario
2. **Azul Eléctrico #3B5BFE** sobre Deep Navy #0D0F1A
3. **Bento Cards Liquid Glass** con radius 24px como contenedor
   universal
4. **Plus Jakarta Sans + Inter** como sistema tipográfico dual
5. **Patrón Master-Detail** con calendario expansible Samsung-style
   en mobile, sidebar permanente en desktop

**Anti-patrones absolutos:**
- Cero morados, cero rojos
- Cero listas planas
- Cero acciones críticas en hamburguesa
- Cero glass con blur > 16px
- Cero hardcoded values

Este documento es la fuente única de verdad visual del producto.
El Agente Frontend lo lee antes de cada tarea y valida cada
componente generado contra sus reglas. Cualquier cambio al ADN
visual requiere actualización formal de este documento y bump de
versión.

---

*PLAN_MAESTRO_DISEÑO.md — Enbandeja*
*Versión 1.0 — Abril 2026*
*Christian Wevar — Antofagasta, Chile*
*Próxima actualización: solo si emerge una decisión fundacional*
