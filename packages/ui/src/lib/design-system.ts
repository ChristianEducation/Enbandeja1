// ═══════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Enbandeja
// ═══════════════════════════════════════════════════════════════════
// Fuente única de verdad visual del producto.
// Sincronizado con: docs/PLAN_MAESTRO_DISEÑO.md v1.0
// Sincronizado con: docs/agentes/design-system.md v1.1
//
// ADN en una línea:
// Light mode primero · Azul Eléctrico #3B5BFE sobre gris frío #F4F7FB
// · Superficies blancas radius 12–16px · Plus Jakarta Sans + Inter
// · Spacing base 8px · Mobile-first
//
// ANTI-PATRONES ABSOLUTOS:
// ❌ Cero morados/púrpuras (#7C3AED, #A78BFA, #8B5CF6)
// ❌ Cero rojos como color de error (usar ámbar #F59E0B)
// ❌ Cero listas planas sin Bento Card
// ❌ Cero blur > 16px
// ❌ Cero glass anidado > 2 niveles
// ❌ Cero hardcoded colors en componentes
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// PALETA — DARK MODE (default)
// ───────────────────────────────────────────────────────────────────

export const colors = {
  // Fondos
  background: '#F4F7FB',
  surface: '#FFFFFF',
  'surface-elevated': '#F8FAFC',
  'surface-glass': 'rgba(255, 255, 255, 0.94)',

  // Texto
  foreground: '#172033',
  'foreground-secondary': '#526078',
  'foreground-tertiary': '#637087',
  'foreground-disabled': '#98A2B3',

  // Brand — Azul Eléctrico Vroom (color CORE)
  primary: {
    DEFAULT: '#3B5BFE',
    hover: '#5571FF',
    pressed: '#2D48E8',
    foreground: '#FFFFFF',
  },

  // Bordes
  border: {
    subtle: '#EEF2F7',
    DEFAULT: '#DCE3ED',
    strong: '#C4CEDD',
  },

  // Semánticos (uso restringido)
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B5BFE',

  // Light mode (variante secundaria)
  light: {
    background: '#F5F6FA',
    surface: '#FFFFFF',
    'surface-elevated': '#FAFBFD',
    foreground: '#0D0F1A',
    'foreground-secondary': '#6B7280',
    border: 'rgba(13, 15, 26, 0.08)',
  },
} as const

// ───────────────────────────────────────────────────────────────────
// COLORES DE ESTADO DEL DOMINIO
// ───────────────────────────────────────────────────────────────────

export const estadoPedidoColors = {
  PENDIENTE_PAGO: '#F59E0B',
  PAGADO: '#10B981',
  CANCELADO: '#9CA3AF',
  EXPIRADO: '#6B7280',
  RETIRADO: '#3B5BFE',
  NO_RETIRADO: '#F59E0B',
} as const

export const estadoMenuColors = {
  BORRADOR: '#6B7280',
  PUBLICADO: '#10B981',
  CERRADO: '#F59E0B',
  ARCHIVADO: '#4B5563',
} as const

// Micro-líneas del calendario (Zona A mobile)
export const calendarioIndicadores = {
  pedidoConfirmado: '#10B981',
  disponible: '#3B5BFE',
  cercaCorte: '#F59E0B',
} as const

// ───────────────────────────────────────────────────────────────────
// TIPOGRAFÍA — SISTEMA DUAL
// ───────────────────────────────────────────────────────────────────
// Plus Jakarta Sans → títulos, headings, montos CLP, CTAs
// Inter → body, tablas, métricas densas, captions
// JetBrains Mono → UUIDs, códigos de casino, transactionIds

export const typography = {
  fontFamily: {
    display: 'Plus Jakarta Sans, system-ui, sans-serif',
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, ui-monospace, monospace',
  },

  fontSize: {
    display: ['32px', { lineHeight: '1.15', letterSpacing: '-0.02em' }] as const,
    title: ['24px', { lineHeight: '1.20', letterSpacing: '-0.015em' }] as const,
    heading: ['20px', { lineHeight: '1.30', letterSpacing: '-0.01em' }] as const,
    subheading: ['17px', { lineHeight: '1.35', letterSpacing: '-0.005em' }] as const,
    body: ['15px', { lineHeight: '1.50' }] as const,
    small: ['13px', { lineHeight: '1.45', letterSpacing: '0.01em' }] as const,
    caption: ['11px', { lineHeight: '1.40', letterSpacing: '0.02em' }] as const,
  },
} as const

// ───────────────────────────────────────────────────────────────────
// ESPACIADO — BASE 8PX
// ───────────────────────────────────────────────────────────────────

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const

// Aplicaciones documentadas
export const spacingRules = {
  cardPaddingMobile: spacing[4],     // 16px
  cardPaddingDesktop: spacing[5],    // 20px
  bentoGapMobile: spacing[3],       // 12px
  bentoGapDesktop: spacing[4],      // 16px
  marginHorizontalMobile: spacing[5], // 20px
  marginHorizontalDesktop: spacing[8], // 32px
  sectionGap: spacing[6],           // 24px
} as const

// ───────────────────────────────────────────────────────────────────
// BORDES, RADIOS Y MATERIALES
// ───────────────────────────────────────────────────────────────────

export const borderRadius = {
  none: '0',
  sm: '8px',       // badges, chips, tags
  md: '12px',      // botones, inputs, acciones
  lg: '16px',      // cards secundarias
  xl: '16px',      // superficies principales
  '2xl': '20px',   // modales grandes
  full: '9999px',  // avatares, FABs, píldoras nav
} as const

// Liquid Glass — material principal para Bento Cards en dark mode
export const liquidGlass = {
  background: '#FFFFFF',
  backdropFilter: 'none',
  border: '1px solid #DCE3ED',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(23, 32, 51, 0.07)',
} as const

// Clases Tailwind equivalentes al Liquid Glass
export const liquidGlassClasses =
  'bg-surface-glass border border-border rounded-xl shadow-glass' as const

export const boxShadow = {
  sm: '0 1px 2px rgba(23, 32, 51, 0.06)',
  DEFAULT: '0 4px 12px rgba(23, 32, 51, 0.08)',
  md: '0 4px 12px rgba(23, 32, 51, 0.08)',
  lg: '0 8px 20px rgba(23, 32, 51, 0.10)',
  xl: '0 16px 32px rgba(23, 32, 51, 0.12)',
  glass: '0 2px 8px rgba(23, 32, 51, 0.07)',
  'glow-primary': '0 0 0 3px rgba(59, 91, 254, 0.16)',
} as const

// ───────────────────────────────────────────────────────────────────
// COMPONENTES CORE — SPECS DE REFERENCIA
// ───────────────────────────────────────────────────────────────────

export const componentSpecs = {
  button: {
    primary: {
      height: { mobile: '48px', desktop: '44px' },
      borderRadius: borderRadius.md,
      background: colors.primary.DEFAULT,
      color: colors.primary.foreground,
      fontFamily: typography.fontFamily.display,
      fontWeight: '600',
      fontSize: '15px',
      paddingX: spacing[6],
      hover: { background: colors.primary.hover, boxShadow: boxShadow['glow-primary'] },
    },
    secondary: {
      height: { mobile: '48px', desktop: '44px' },
      borderRadius: borderRadius.md,
      background: 'transparent',
      border: `1px solid ${colors.border.strong}`,
      color: colors.foreground,
      hover: { background: 'rgba(255, 255, 255, 0.04)' },
    },
  },

  bentoCard: {
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    gapInterno: spacing[4],
    material: liquidGlass,
  },

  input: {
    height: '48px',
    borderRadius: borderRadius.md,
    background: 'rgba(255, 255, 255, 0.04)',
    border: `1px solid ${colors.border.DEFAULT}`,
    focusBorder: `1px solid ${colors.primary.DEFAULT}`,
    focusShadow: boxShadow['glow-primary'],
    fontFamily: typography.fontFamily.sans,
    fontSize: '15px',
    placeholder: colors['foreground-tertiary'],
  },

  badge: {
    height: { sm: '24px', md: '28px' },
    borderRadius: borderRadius.full,
    paddingX: '10px',
    fontFamily: typography.fontFamily.sans,
    fontWeight: '500',
    fontSize: '12px',
  },

  icon: {
    library: 'lucide-react',
    strokeWidth: 1.5,
    sizeBase: 20,
  },

  bottomNav: {
    height: '72px',
    maxItems: 4,
    activeBackground: 'rgba(59, 91, 254, 0.16)',
    activeColor: colors.primary.hover,
    inactiveColor: colors['foreground-secondary'],
    activePillRadius: borderRadius.full,
  },

  sidebar: {
    width: '240px',
    material: liquidGlass,
  },

  topBar: {
    height: '64px',
  },

  kioskoButton: {
    height: '72px',
    borderRadius: borderRadius.lg,
    background: colors.primary.DEFAULT,
    fontSize: '20px',
    fontWeight: '600',
    boxShadow: boxShadow['glow-primary'],
  },
} as const

// ───────────────────────────────────────────────────────────────────
// ANIMACIONES
// ───────────────────────────────────────────────────────────────────

export const transitions = {
  fast: '150ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
  calendar: '300ms ease-out',   // expansión calendario Samsung-style
} as const

// ───────────────────────────────────────────────────────────────────
// BREAKPOINTS (mobile-first)
// ───────────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ───────────────────────────────────────────────────────────────────
// EXPORT COMPLETO PARA TAILWIND CONFIG
// ───────────────────────────────────────────────────────────────────

export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  liquidGlass,
  transitions,
  breakpoints,
  componentSpecs,
  estadoPedidoColors,
  estadoMenuColors,
  calendarioIndicadores,
} as const
