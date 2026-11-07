import { Link } from 'react-router'

import { ROUTE_PATHS } from '@/routes/routePaths'

export function AppLogo() {
  return (
    <Link
      to={ROUTE_PATHS.DASHBOARD}
      className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-md bg-primary text-body font-semibold text-primary-foreground"
      >
        OH
      </span>
      <span className="text-card-title font-semibold text-foreground">OpportunityHub</span>
    </Link>
  )
}
