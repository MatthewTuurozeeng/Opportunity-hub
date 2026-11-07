import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import {
  APPLICATION_STATUS_DETAILS,
  type ApplicationStatus,
} from '../constants/applicationStatuses'

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

/** Status is always shown as text plus color, never color alone (README 4.3). */
export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const { label, badgeClassName } = APPLICATION_STATUS_DETAILS[status]

  return (
    <Badge variant="outline" className={cn(badgeClassName, className)}>
      {label}
    </Badge>
  )
}
