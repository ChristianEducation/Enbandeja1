import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

// Badge / Pill según Plan Maestro de Diseño §1.6:
// - Height: 24px o 28px
// - Border-radius: 9999px (full pill)
// - Padding: 0 10px
// - Font: Inter medium 12px
// - Variantes basadas en los colores semánticos del dominio
//
// Colores de estado (design-system.md §2.2):
// - CANCELADO usa gris (#9CA3AF), NO rojo (anti-patrón §2.1)

const badgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-full px-2.5',
    'font-sans font-medium text-xs',
    'whitespace-nowrap',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary/[0.16] text-primary-hover',
        success: 'bg-success/[0.16] text-success',
        warning: 'bg-warning/[0.16] text-warning',
        neutral: 'bg-surface-elevated text-foreground-secondary border border-border',
        muted: 'bg-surface-elevated text-foreground-tertiary',
      },
      size: {
        sm: 'h-6',    // 24px
        md: 'h-7',    // 28px
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
