import { cn } from '../lib/utils'
export interface PlanLimitProps { label: string; current: number; limit: number | null; className?: string }
export function PlanLimit({ label, current, limit, className }: PlanLimitProps) {
  const percentage = limit ? Math.min(100, Math.round((current / limit) * 100)) : 0
  const critical = limit !== null && percentage >= 90
  const warning = limit !== null && percentage >= 70 && !critical
  return <div className={cn('space-y-2', className)}><div className="flex items-center justify-between gap-4 text-small"><span className="font-medium text-foreground">{label}</span><span className="text-foreground-secondary">{limit === null ? `${current} · Sin límite` : `${current} de ${limit}`}</span></div>{limit !== null ? <><div className="h-2 overflow-hidden rounded-full bg-surface-elevated" role="progressbar" aria-label={label} aria-valuenow={current} aria-valuemin={0} aria-valuemax={limit}><div className={cn('h-full rounded-full transition-[width] duration-200', critical ? 'bg-red-600' : warning ? 'bg-warning' : 'bg-primary')} style={{ width: `${percentage}%` }} /></div><p className="text-caption text-foreground-secondary">{critical ? 'Límite casi alcanzado.' : warning ? 'Te estás acercando al límite.' : `${percentage}% utilizado.`}</p></> : null}</div>
}
