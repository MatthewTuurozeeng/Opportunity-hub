import { Link } from 'react-router'

import { ApplicationStatusBadge } from '@/features/applications/components/ApplicationStatusBadge'
import type { ApplicationRecord } from '@/features/applications/types/application.types'
import { formatDate } from '@/lib/dateUtils'
import { buildApplicationDetailPath } from '@/routes/routePaths'

interface RecentApplicationsProps {
  applications: readonly ApplicationRecord[]
}

/** The most recently updated applications. */
export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <ul className="-my-3 divide-y divide-border">
      {applications.map((application) => (
        <li key={application.id} className="flex items-center gap-3 py-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <Link
              to={buildApplicationDetailPath(application.id)}
              className="truncate font-medium text-heading underline-offset-4 hover:text-primary hover:underline"
            >
              {application.opportunity.title}
            </Link>
            <p className="truncate text-supporting text-muted-foreground">
              {application.opportunity.organization} · Updated{' '}
              <time dateTime={application.updated_at}>{formatDate(application.updated_at)}</time>
            </p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </li>
      ))}
    </ul>
  )
}
