import { Link } from 'react-router'

import { AppMark } from '@/components/shared/AppMark'
import { ROUTE_PATHS } from '@/routes/routePaths'

export function AppLogo() {
  return (
    <Link
      to={ROUTE_PATHS.DASHBOARD}
      className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <AppMark />
      <span className="text-card-title font-semibold text-foreground">OpportunityHub</span>
    </Link>
  )
}
