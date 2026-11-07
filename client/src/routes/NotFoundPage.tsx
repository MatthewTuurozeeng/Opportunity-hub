import { Compass } from 'lucide-react'
import { Link } from 'react-router'

import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'

import { ROUTE_PATHS } from './routePaths'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
      action={
        <Button variant="outline" nativeButton={false} render={<Link to={ROUTE_PATHS.DASHBOARD} />}>
          Back to Dashboard
        </Button>
      }
    />
  )
}
