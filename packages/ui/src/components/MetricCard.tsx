import * as React from 'react'
import { Card } from './Card'
import { cn } from '../lib/utils'

export interface MetricCardProps { label: string; value: React.ReactNode; helper?: React.ReactNode; icon?: React.ReactNode; loading?: boolean; className?: string }

export function MetricCard({ label, value, helper, icon, loading = false, className }: MetricCardProps) {
  return (
    <Card className={cn('min-w-0 space-y-3', className)}>
      <div className="flex items-start justify-between gap-3"><p className="text-small font-medium text-foreground-secondary">{label}</p>{icon ? <span className="text-primary" aria-hidden="true">{icon}</span> : null}</div>
      {loading ? <div className="h-8 w-24 animate-pulse rounded-md bg-surface-elevated" /> : <div className="font-display text-title font-bold tabular-nums text-foreground">{value}</div>}
      {helper ? <p className="text-small text-foreground-secondary">{helper}</p> : null}
    </Card>
  )
}
