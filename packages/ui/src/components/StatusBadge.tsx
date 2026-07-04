import * as React from 'react'
import { AlertCircle, CheckCircle2, CircleDot, XCircle } from 'lucide-react'
import { Badge, type BadgeProps } from './Badge'

type StatusTone = 'info' | 'success' | 'warning' | 'neutral' | 'danger'
const icons: Record<StatusTone, React.ComponentType<{ className?: string }>> = {
  info: CircleDot,
  success: CheckCircle2,
  warning: AlertCircle,
  neutral: CircleDot,
  danger: XCircle,
}
const variants: Record<StatusTone, BadgeProps['variant']> = {
  info: 'default',
  success: 'success',
  warning: 'warning',
  neutral: 'neutral',
  danger: 'neutral',
}
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> { tone?: StatusTone; showIcon?: boolean }
export function StatusBadge({ tone = 'neutral', showIcon = true, children, ...props }: StatusBadgeProps) {
  const Icon = icons[tone]
  return <Badge variant={variants[tone]} {...props}>{showIcon ? <Icon className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> : null}{children}</Badge>
}
