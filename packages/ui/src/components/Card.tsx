import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

// Bento Card según Plan Maestro de Diseño §1.5 y §1.6:
// - Material: Liquid Glass (blur 16px, saturate 180%, border white/10)
// - Border-radius: 24px (xl) — contenedor universal
// - Padding: 20px
// - Gap interno: 16px
// - Prohibido: listas planas sin Bento Card

const cardVariants = cva(
  'rounded-xl',
  {
    variants: {
      variant: {
        glass: [
          'bg-surface-glass border border-border',
          'shadow-glass',
        ].join(' '),
        solid: 'bg-surface border border-border',
        elevated: 'bg-surface-elevated border border-border',
      },
      padding: {
        default: 'p-5',   // 20px
        compact: 'p-4',   // 16px
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'solid',
      padding: 'default',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

// Alias semántico — usar este en toda la app
const BentoCard = Card
BentoCard.displayName = 'BentoCard'

// Header y contenido para estructura interna de la card
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-display font-semibold text-heading text-foreground', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-4', className)}
    {...props}
  />
))
CardContent.displayName = 'CardContent'

export { Card, BentoCard, CardHeader, CardTitle, CardContent, cardVariants }
