import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

// Botón según Plan Maestro de Diseño §1.6:
// - Primary: bg primary #3B5BFE, hover #5571FF + glow
// - Secondary (ghost): transparent con border strong
// - Plus Jakarta Sans semibold 15px
// - Height: 48px mobile / 44px desktop
// - Border-radius: 12px (md)

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-display font-semibold text-[15px]',
    'rounded-md transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:opacity-40 disabled:pointer-events-none',
    'h-12 lg:h-11',  // 48px mobile, 44px desktop
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary-hover hover:shadow-glow-primary',
          'active:bg-primary-pressed',
        ].join(' '),
        secondary: [
          'bg-transparent text-foreground',
          'border border-border-strong',
          'hover:bg-primary-50',
        ].join(' '),
        ghost: [
          'bg-transparent text-foreground',
          'hover:bg-primary-50',
        ].join(' '),
        danger: [
          // Solo para cancelación destructiva de suscripción (excepción documentada)
          'bg-red-600 text-white',
          'hover:bg-red-700',
        ].join(' '),
      },
      size: {
        default: 'px-6',        // padding 24px
        sm: 'px-4 h-9 text-sm',
        lg: 'px-8 h-14 text-base',
        kiosko: 'px-8 h-[72px] text-xl rounded-lg shadow-glow-primary', // Botón masivo kiosko
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
