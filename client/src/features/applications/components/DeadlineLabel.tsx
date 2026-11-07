import { formatDate, getDaysUntil } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

import type { ApplicationStatus } from '../constants/applicationStatuses'

const DEADLINE_WARNING_DAYS = 7

/** Deadlines only need attention while the application is still being prepared. */
const STATUSES_AWAITING_SUBMISSION: readonly ApplicationStatus[] = ['draft']

interface DeadlineLabelProps {
  deadline: string | null
  status: ApplicationStatus
  className?: string
}

function describeDaysUntil(daysUntil: number): string {
  if (daysUntil === 0) return 'Due today'
  if (daysUntil === 1) return 'Due tomorrow'
  return `Due in ${daysUntil} days`
}

/** Shows a deadline with a warning when a draft is due soon or overdue. */
export function DeadlineLabel({ deadline, status, className }: DeadlineLabelProps) {
  if (!deadline) {
    return <span className={cn('text-muted-foreground', className)}>No deadline</span>
  }

  const daysUntil = getDaysUntil(deadline)
  const needsAttention = STATUSES_AWAITING_SUBMISSION.includes(status)
  const isOverdue = needsAttention && daysUntil < 0
  const isDueSoon = needsAttention && daysUntil >= 0 && daysUntil <= DEADLINE_WARNING_DAYS

  return (
    <span className={cn('flex flex-col', className)}>
      <span>{formatDate(deadline)}</span>
      {isDueSoon && <span className="text-supporting font-medium text-amber-700">{describeDaysUntil(daysUntil)}</span>}
      {isOverdue && <span className="text-supporting font-medium text-destructive">Deadline passed</span>}
    </span>
  )
}
