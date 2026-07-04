import * as React from 'react'
import { cn } from '../lib/utils'

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> { title: string; description?: string; actions?: React.ReactNode }
export function SectionHeader({ title, description, actions, className, ...props }: SectionHeaderProps) {
  return <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)} {...props}><div className="max-w-2xl space-y-1"><h1 className="font-display text-title font-bold text-foreground">{title}</h1>{description ? <p className="text-body text-foreground-secondary">{description}</p> : null}</div>{actions ? <div className="flex min-h-11 flex-wrap items-center gap-2">{actions}</div> : null}</div>
}
