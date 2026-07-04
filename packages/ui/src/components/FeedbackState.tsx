import * as React from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
export interface FeedbackStateProps extends React.HTMLAttributes<HTMLDivElement> { state: 'loading' | 'error' | 'success'; title: string; description?: string; action?: React.ReactNode }
export function FeedbackState({ state, title, description, action, className, ...props }: FeedbackStateProps) {
  const Icon = state === 'loading' ? Loader2 : state === 'success' ? CheckCircle2 : AlertCircle
  return <div className={cn('flex items-start gap-3 rounded-lg border border-border bg-surface p-4', className)} role={state === 'error' ? 'alert' : 'status'} {...props}><Icon className={cn('mt-0.5 h-5 w-5 shrink-0', state === 'loading' && 'animate-spin', state === 'success' ? 'text-success' : state === 'error' ? 'text-red-600' : 'text-primary')} aria-hidden="true" /><div className="min-w-0 flex-1"><p className="font-medium text-foreground">{title}</p>{description ? <p className="mt-1 text-small text-foreground-secondary">{description}</p> : null}{action ? <div className="mt-3">{action}</div> : null}</div></div>
}
