import * as React from 'react'
import { cn } from '../lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description: string
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
}

export function EmptyState({ icon, title, description, primaryAction, secondaryAction, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface-elevated px-6 py-10 text-center', className)} {...props}>
      {icon ? <div className="text-primary" aria-hidden="true">{icon}</div> : null}
      <div className="max-w-md space-y-1.5">
        <h3 className="font-display text-heading font-semibold text-foreground">{title}</h3>
        <p className="text-body text-foreground-secondary">{description}</p>
      </div>
      {primaryAction || secondaryAction ? <div className="mt-2 flex flex-wrap justify-center gap-3">{primaryAction}{secondaryAction}</div> : null}
    </div>
  )
}
