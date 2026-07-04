# AGENTE DESIGN SYSTEM — Enbandeja

> Agente especializado en los tokens visuales del producto. Claude
> Code lee este archivo **antes** de tocar cualquier valor visual
> o crear un componente nuevo.
>
> **Fuente de verdad primaria:** `docs/PLAN_MAESTRO_DISEÑO.md`.
> Este archivo es el operativo técnico del plan — si hay
> discrepancia, manda el Plan Maestro.
>
> **Cuándo invocarme:**
> - Crear o modificar `packages/ui/src/lib/design-system.ts`
> - Configurar `tailwind.config.ts`
> - Definir componentes nuevos en `packages/ui`
> - Cambiar el tema visual completo

---

## 1. PRINCIPIO RECTOR

**El design system es la fuente única de verdad visual de Enbandeja.**

Todo color, tipografía, espaciado, borde, sombra y transición vive
en `packages/ui/src/lib/design-system.ts`. Ningún componente
hardcodea valores visuales. Cambiar el tema completo es un cambio
de un solo archivo.

**ADN del producto en una línea:**
Light mode primero · Azul Eléctrico `#3B5BFE` sobre gris frío
`#F4F7FB` · superficies blancas con radius 12–16px · Plus Jakarta
Sans + Inter · Spacing base 8px · Mobile-first.

---

## 2. PALETA EXACTA — LIGHT MODE PRIMERO

Light mode es el default. Dark mode existe como variante secundaria.

### 2.1 Colores base

```typescript
colors: {
  // ─── BACKGROUND ────────────────────────────────────────────
  background: '#F4F7FB',
  surface: '#FFFFFF',
  'surface-elevated': '#F8FAFC',

  // ─── TEXT ──────────────────────────────────────────────────
  foreground: '#172033',
  'foreground-secondary': '#526078',
  'foreground-tertiary': '#637087',
  'foreground-disabled': '#98A2B3',

  // ─── BRAND (Azul Eléctrico Vroom) ──────────────────────────
  primary: {
    DEFAULT: '#3B5BFE',
    hover: '#5571FF',
    pressed: '#2D48E8',
    foreground: '#FFFFFF'
  },

  // ─── BORDERS ───────────────────────────────────────────────
  border: {
    subtle: '#EEF2F7',
    DEFAULT: '#DCE3ED',
    strong: '#C4CEDD'
  },

  // ─── SEMÁNTICOS (uso restringido) ──────────────────────────
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B5BFE'      // mismo que primary
}
```

### 2.2 Estados del dominio

Para badges del estado del Pedido y del Menu:

```typescript
estadoPedido: {
  pendiente:  '#F59E0B',   // ámbar
  pagado:     '#10B981',   // verde
  cancelado:  '#9CA3AF',   // gris (NO rojo — ver anti-patrones)
  expirado:   '#6B7280',   // gris oscuro
  retirado:   '#3B5BFE',   // azul primary
  noRetirado: '#F59E0B'    // ámbar
},

estadoMenu: {
  borrador:   '#6B7280',
  publicado:  '#10B981',
  cerrado:    '#F59E0B',
  archivado:  '#4B5563'
}
```

---

## 3. TIPOGRAFÍA — SISTEMA DUAL

```typescript
typography: {
  fontFamily: {
    display: 'Plus Jakarta Sans, system-ui, sans-serif',
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, ui-monospace, monospace'
  },

  fontSize: {
    display:    ['32px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
    title:      ['24px', { lineHeight: '1.20', letterSpacing: '-0.015em' }],
    heading:    ['20px', { lineHeight: '1.30', letterSpacing: '-0.01em' }],
    subheading: ['17px', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
    body:       ['15px', { lineHeight: '1.50' }],
    small:      ['13px', { lineHeight: '1.45', letterSpacing: '0.01em' }],
    caption:    ['11px', { lineHeight: '1.40', letterSpacing: '0.02em' }]
  }
}
```

**Roles de las fuentes (regla inquebrantable):**

- **Plus Jakarta Sans (display):** títulos, headings, montos en CLP,
  números grandes, CTAs, hora de corte, nombre de comensal
- **Inter (sans):** body, tablas, listas, métricas densas, captions,
  labels de formulario
- **JetBrains Mono:** solo para datos técnicos — UUIDs, códigos de
  casino, transactionIds, fechas ISO

---

## 4. ESPACIADO (BASE 8PX)

```typescript
spacing: {
  0:  '0',
  1:  '4px',     // micro
  2:  '8px',     // small
  3:  '12px',    // compact
  4:  '16px',    // base
  5:  '20px',    // medium
  6:  '24px',    // default — gap entre Bento cards
  8:  '32px',    // large
  10: '40px',
  12: '48px',
  16: '64px'
}
```

**Reglas de aplicación:**

- Card padding interno: `16px` o `20px`
- Gap entre Bento cards: `12px` mobile, `16px` desktop
- Margen horizontal: `20px` mobile, `32px`+ desktop
- Section gap vertical: `24px`

---

## 5. BORDES, RADIOS Y MATERIALES

### 5.1 Radios

```typescript
borderRadius: {
  none: '0',
  sm:   '8px',       // badges, chips, tags
  md:   '12px',      // botones, inputs, acciones
  lg:   '16px',      // cards secundarias
  xl:   '24px',      // Bento cards CORE (contenedor universal)
  '2xl': '32px',     // cards heroicas, modales grandes
  full: '9999px'     // avatares, FABs, píldoras nav
}
```

### 5.2 Liquid Glass refinado (material principal)

Patrón obligatorio para Bento Cards en dark mode:

```css
.bento-glass {
  background: rgba(26, 29, 46, 0.6);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 24px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.32);
}
```

**Reglas estrictas del glass:**

- `blur` **MÁXIMO 16px** — más produce "vidrio sucio"
- `border` **SIEMPRE 1px white/10** — nunca más grueso
- `saturate(180%)` obligatorio para que el fondo respire
- **Prohibido stack de más de 2 niveles de glass** (anidar pierde
  jerarquía)

### 5.3 Sombras

```typescript
boxShadow: {
  sm:  '0 1px 2px rgba(0, 0, 0, 0.20)',
  DEFAULT: '0 4px 16px rgba(0, 0, 0, 0.28)',
  md:  '0 4px 16px rgba(0, 0, 0, 0.28)',
  lg:  '0 8px 32px rgba(0, 0, 0, 0.32)',
  xl:  '0 16px 48px rgba(0, 0, 0, 0.40)',

  glass: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.32)',

  'glow-primary':
    '0 0 0 1px rgba(59, 91, 254, 0.40), 0 8px 24px rgba(59, 91, 254, 0.32)'
}
```

---

## 6. COMPONENTES CORE — SPECS

### Botón Primario

```
height:        48px (mobile) / 44px (desktop)
border-radius: 12px (md)
background:    #3B5BFE (primary)
color:         #FFFFFF
font:          Plus Jakarta Sans semibold 15px
padding:       0 24px
hover:         #5571FF + shadow-glow-primary
```

### Botón Secundario (Ghost)

```
height:        48px / 44px
border-radius: 12px
background:    transparent
border:        1px solid rgba(255,255,255,0.16)
color:         #FFFFFF
hover:         background rgba(255,255,255,0.04)
```

### Bento Card (contenedor universal)

```
material:      Liquid Glass (ver 5.2)
border-radius: 24px (xl)
padding:       20px
gap interno:   16px entre elementos
```

### Input

```
height:        48px
border-radius: 12px
background:    rgba(255,255,255,0.04)
border:        1px solid rgba(255,255,255,0.10)
focus:         border #3B5BFE + shadow-glow-primary
font:          Inter regular 15px
placeholder:   #6B7280
```

### Badge / Pill

```
height:        24px o 28px
border-radius: 9999px (full)
padding:       0 10px
font:          Inter medium 12px
variante info: bg rgba(59,91,254,0.16), color #5571FF
```

### Iconos

**Librería única:** `lucide-react`
**Ubicación:** solo en `packages/ui` (re-exportado desde
`@enbandeja/ui/icons`)
**Stroke:** `1.5px`
**Tamaño base:** `20px`

---

## 7. ARQUITECTURA DE PANTALLA

### 7.1 Mobile — Master-Detail con 3 zonas

```
┌─────────────────────────────────────┐
│ ZONA A — Calendario expansible      │
│ (swipe-down Samsung-style)          │
│ Micro-líneas de estado bajo números │
├─────────────────────────────────────┤
│                                     │
│ ZONA B — Bento Grid scrolleable     │
│ (menú del día + kiosko drawer)      │
│                                     │
├─────────────────────────────────────┤
│ ZONA C — Floating Cart + Bottom Nav │
│ (píldora active state azul)         │
└─────────────────────────────────────┘
```

**Reglas del calendario (Zona A):**

- Default: 1 fila, scroll horizontal semanal
- Expandido: mes completo, activado por swipe-down
- Estados indicados con **micro-líneas bajo el número** (NO texto)
  - Verde `#10B981` — pedido confirmado
  - Azul `#3B5BFE` — disponible para pedir
  - Ámbar `#F59E0B` — cerca de hora de corte
- Transición: `height 300ms ease-out`

**Reglas del Bento Grid (Zona B):**

- Gap entre cards: 12px
- Padding horizontal: 20px
- Card hero: ancho completo, `height ~200px`
- Cards secundarias: grid 2 columnas, `height ~160px`
- Todas con `border-radius: 24px` y material Liquid Glass

**Reglas del Floating Cart (Zona C):**

- Material: Liquid Glass
- Position: `fixed bottom-[88px] left-4 right-4`
- Visible solo si hay items en carrito
- Aparece con `slide-up + fade` 200ms
- Border-radius: 16px

**Bottom Nav:**

- 4 items máximo (Inicio, Pedir, Historial, Perfil)
- Active state: píldora radius 9999px con
  `bg rgba(59,91,254,0.16)` + texto/ícono en `#5571FF`
- Height: 72px (incluye safe area)

### 7.2 Desktop/Tablet — Sidebar + Workspace

```
┌────────┬────────────────────────────┐
│ Side   │ Top Bar 64px               │
│ bar    ├────────────────────────────┤
│ 240px  │                            │
│ glass  │ Workspace (Bento Grid)     │
│        │ padding: 32px              │
│        │                            │
└────────┴────────────────────────────┘
```

- Sidebar: 240px fijo, Liquid Glass, items con píldora active azul
- Top bar: 64px, search global + avatar + notifs
- Workspace padding: 32px
- Gap entre cards: 16px

### 7.3 Vista de cocina (full-screen, lectura a 3m)

- Tipografía 50% más grande que el resto del producto
- Solo Bento cards de conteos
- Sin interacciones (solo lectura)
- Background absoluto `#0D0F1A` para máximo contraste
- Sin sidebar ni top bar

### 7.4 Botones del kiosko (operador)

Para entrega rápida en el casino:

```
height:        72px
border-radius: 16px
background:    #3B5BFE
font:          Plus Jakarta semibold 20px
shadow:        shadow-glow-primary
```

---

## 8. ANTI-PATRONES PROHIBIDOS

Lista no negociable. Si Claude Code propone alguno, se rechaza.

### 8.1 Color

- ❌ **Cero morados/púrpuras** (excluye toda paleta HRMS: `#7C3AED`,
  `#A78BFA`, `#8B5CF6`). Enbandeja NO es trendy SaaS, es
  herramienta operativa seria.
- ❌ **Cero rojos como color de error visible.** El rojo en
  contextos de comida genera ansiedad. **Para errores usamos ámbar
  `#F59E0B`**:
  - Texto de error: `#F59E0B`
  - Borde de error: `1px solid #F59E0B`
  - Icono: warning triangle en ámbar
- ❌ Cero verdes "ecológicos" saturados (`#22c55e` brillante).
  Success usa `#10B981`.
- ❌ Cero gradientes multicolor. Si hay gradiente, es
  **monocromático azul** (`#3B5BFE` → `#2D48E8`).

**Excepción del rojo:** solo aparece en (a) confirmación literal
"CANCELAR" de suscripción destructiva y (b) estado `EXPIRADO` en
logs del Super Admin. Nunca en la app del apoderado ni del operador.

### 8.2 Tipografía

- ❌ Cero mezcla de más de 2 fuentes (+ Mono para datos técnicos)
- ❌ Cero texto con contraste < 4.5:1
- ❌ Cero `foreground-tertiary` para datos críticos

### 8.3 Layout

- ❌ **Cero listas planas.** Todo contenido se envuelve en Bento Card.
- ❌ **Cero acciones críticas en menús hamburguesa.** Pedir, Pagar,
  Publicar, Marcar Retirado → siempre visibles.
- ❌ Cero hamburguesa como navegación principal. Bottom nav mobile,
  sidebar desktop.
- ❌ Cero más de 5 items en bottom nav.

### 8.4 Glass

- ❌ Cero `blur > 16px`
- ❌ Cero glass anidado > 2 niveles
- ❌ Cero glass sobre fondos blancos (light mode usa surface sólida)

### 8.5 UX

- ❌ Cero confirmaciones para acciones reversibles
- ❌ Cero modales para flujos largos (registro, wizard → pantallas)
- ❌ Cero toasts de éxito < 2 segundos
- ❌ Cero scroll infinito sin paginación visible (contexto operador)

---

## 9. PROTOCOLO DE INICIO PARA EL AGENTE FRONTEND

Antes de generar cualquier código de UI, confirma con este mensaje:

> "Plan Maestro de Diseño absorbido. Pantalla a generar: [nombre].
> Patrón base: [Bento Grid mobile / Tabla densa desktop / etc.].
> Tokens: ADN dark, Liquid Glass, Plus Jakarta + Inter, radius 24px
> Bento. Zero anti-patrones. ¿Procedo?"

Si Christian autoriza, procede. Si no, detente.

---

## 10. CHECKLIST ANTES DE ENTREGAR UN COMPONENTE

- [ ] ¿Cero morados, cero rojos prohibidos?
- [ ] ¿Cero listas planas, todo en Bento?
- [ ] ¿Cero acciones críticas en hamburguesa?
- [ ] ¿Cero glass con blur > 16px?
- [ ] ¿Cero hardcoded colors/spacings/radius?
- [ ] ¿Cero `foreground-tertiary` en datos críticos?
- [ ] ¿Plus Jakarta para títulos, Inter para body?
- [ ] ¿Iconos lucide stroke 1.5px tamaño 20?
- [ ] ¿Mobile-first (probado en 375px)?
- [ ] ¿Contraste texto/fondo ≥ 4.5:1?

---

## 11. SEÑALES DE ALERTA INMEDIATAS

Si Claude Code detecta alguna de estas, **detiene toda ejecución**:

- Color morado en cualquier componente
- Color rojo fuera de las 2 excepciones documentadas
- `#hex` hardcodeado en componente React
- `<ul><li>` sin envolver en Bento
- Blur `> 16px` en cualquier elemento
- Componente importando `lucide-react` fuera de `packages/ui`
- Z-index numérico arbitrario
- Acción primaria dentro de menú hamburguesa

---

## 12. REGLA DE ORO

Si el usuario pide algo que contradice este documento, **detente y
pregunta**:

> "Lo solicitado contradice el Plan Maestro de Diseño
> (anti-patrón X.Y). ¿Es un cambio fundacional al ADN visual
> (actualizo el plan) o un caso excepcional puntual?"

Espera autorización antes de proceder.

---

*Agente Design System de Enbandeja — versión 1.1*
*Sincronizado con `docs/PLAN_MAESTRO_DISEÑO.md` v1.0*
*Lectura obligatoria antes de tocar cualquier código visual*
