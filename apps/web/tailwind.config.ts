import type { Config } from 'tailwindcss'

/**
 * ═══════════════════════════════════════════════════════════════
 * ENBANDEJA — Tailwind Config
 * ═══════════════════════════════════════════════════════════════
 * Traducción directa del PLAN_MAESTRO_DISEÑO.md Capítulo 1.
 *
 * Fuente de verdad visual: docs/PLAN_MAESTRO_DISEÑO.md
 * Agente especializado: docs/agentes/design-system.md
 *
 * REGLAS INNEGOCIABLES:
 * - Dark mode primero, light mode derivado
 * - Azul Eléctrico #3B5BFE sobre Deep Navy #0D0F1A
 * - Bento Cards con border-radius xl (24px) y Liquid Glass
 * - Plus Jakarta Sans para display, Inter para body
 * - Cero morados, cero rojos (ámbar para errores)
 * - backdrop-blur MÁXIMO 16px
 * ═══════════════════════════════════════════════════════════════
 */

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx,js,jsx,mdx}'
  ],
  theme: {
    extend: {
      // ─── COLORES ──────────────────────────────────────────────
      colors: {
        // Background
        background: '#F4F7FB',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#F8FAFC',
          glass: 'rgba(255, 255, 255, 0.94)'
        },

        // Text (foreground)
        foreground: {
          DEFAULT: '#172033',
          secondary: '#526078',
          tertiary: '#637087',
          disabled: '#98A2B3'
        },

        // Brand — Azul Eléctrico Vroom
        primary: {
          DEFAULT: '#3B5BFE',
          hover: '#5571FF',
          pressed: '#2D48E8',
          foreground: '#FFFFFF',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#3B5BFE',
          600: '#2D48E8',
          700: '#2339C2',
          800: '#1E2E9E',
          900: '#1A2680'
        },

        // Borders (con transparencia para Liquid Glass)
        border: {
          subtle: '#EEF2F7',
          DEFAULT: '#DCE3ED',
          strong: '#C4CEDD'
        },

        // Semánticos (uso restringido)
        success: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF'
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#172033'
        },
        info: {
          DEFAULT: '#3B5BFE',
          foreground: '#FFFFFF'
        },

        // Estados del dominio (Pedido)
        'estado-pedido': {
          pendiente: '#F59E0B',
          pagado: '#10B981',
          cancelado: '#9CA3AF',
          expirado: '#6B7280',
          retirado: '#3B5BFE',
          'no-retirado': '#F59E0B'
        },

        // Estados del dominio (Menu)
        'estado-menu': {
          borrador: '#6B7280',
          publicado: '#10B981',
          cerrado: '#F59E0B',
          archivado: '#4B5563'
        }
      },

      // ─── TIPOGRAFÍA ───────────────────────────────────────────
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },

      fontSize: {
        display: ['32px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        title: ['24px', { lineHeight: '1.20', letterSpacing: '-0.015em', fontWeight: '700' }],
        heading: ['20px', { lineHeight: '1.30', letterSpacing: '-0.01em', fontWeight: '600' }],
        subheading: ['17px', { lineHeight: '1.35', letterSpacing: '-0.005em', fontWeight: '600' }],
        body: ['15px', { lineHeight: '1.50', fontWeight: '400' }],
        'body-medium': ['15px', { lineHeight: '1.50', fontWeight: '500' }],
        small: ['13px', { lineHeight: '1.45', letterSpacing: '0.01em', fontWeight: '400' }],
        caption: ['11px', { lineHeight: '1.40', letterSpacing: '0.02em', fontWeight: '500' }]
      },

      // ─── ESPACIADO (base 8px) ─────────────────────────────────
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px'
      },

      // ─── BORDER RADIUS ────────────────────────────────────────
      borderRadius: {
        none: '0',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',       // ← Bento cards CORE
        '2xl': '32px',
        full: '9999px'
      },

      // ─── BORDER WIDTH ─────────────────────────────────────────
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px'
      },

      // ─── BOX SHADOWS ──────────────────────────────────────────
      boxShadow: {
        sm: '0 1px 2px rgba(23, 32, 51, 0.06)',
        DEFAULT: '0 4px 12px rgba(23, 32, 51, 0.08)',
        md: '0 4px 12px rgba(23, 32, 51, 0.08)',
        lg: '0 8px 20px rgba(23, 32, 51, 0.10)',
        xl: '0 16px 32px rgba(23, 32, 51, 0.12)',

        // Glass — sombra interna + ambient
        glass:
          '0 2px 8px rgba(23, 32, 51, 0.07)',

        // Glow primary (focus rings, CTAs importantes)
        'glow-primary':
          '0 0 0 3px rgba(59, 91, 254, 0.16)',

        // Glow success (confirmaciones)
        'glow-success':
          '0 0 0 1px rgba(16, 185, 129, 0.40), 0 8px 24px rgba(16, 185, 129, 0.24)'
      },

      // ─── BACKDROP BLUR (MÁXIMO 16px para Liquid Glass) ────────
      backdropBlur: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        glass: '16px'      // ← MÁXIMO permitido — anti-patrón si se excede
      },

      backdropSaturate: {
        glass: '180%'
      },

      // ─── TRANSICIONES ─────────────────────────────────────────
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms'
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },

      // ─── Z-INDEX ──────────────────────────────────────────────
      zIndex: {
        base: '0',
        dropdown: '10',
        sticky: '20',
        header: '30',
        drawer: '40',
        modal: '50',
        popover: '60',
        tooltip: '70',
        toast: '80',
        notification: '90'
      },

      // ─── ANIMACIONES BASE ─────────────────────────────────────
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'calendar-expand': {
          '0%': { maxHeight: '80px' },
          '100%': { maxHeight: '480px' }
        }
      },

      animation: {
        'slide-up': 'slide-up 300ms cubic-bezier(0, 0, 0.2, 1)',
        'fade-in': 'fade-in 200ms cubic-bezier(0, 0, 0.2, 1)',
        'calendar-expand': 'calendar-expand 300ms cubic-bezier(0, 0, 0.2, 1)'
      }
    }
  },
  plugins: []
}

export default config
