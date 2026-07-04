import * as React from 'react'
import { cn } from '../lib/utils'

// Input según Plan Maestro de Diseño §1.6:
// - Height: 48px
// - Border-radius: 12px (md)
// - Background: rgba(255,255,255,0.04)
// - Border: 1px solid rgba(255,255,255,0.10)
// - Focus: border #3B5BFE + shadow-glow-primary
// - Font: Inter regular 15px
// - Placeholder: #6B7280

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-md',
          'bg-surface border border-border',
          'px-4 py-2',
          'font-sans text-[15px] text-foreground',
          'placeholder:text-foreground-tertiary',
          'focus:outline-none focus:border-primary focus:shadow-glow-primary',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'transition-all duration-200 ease-out',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
