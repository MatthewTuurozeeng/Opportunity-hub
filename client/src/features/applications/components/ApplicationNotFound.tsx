import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router'

import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { ROUTE_PATHS } from '@/routes/routePaths'

export function ApplicationNotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Application not found"
      description="It may have been deleted, or the link is incorrect."
      action={
        <Button variant="outline" nativeButton={false} render={<Link to={ROUTE_PATHS.APPLICATIONS} />}>
          Back to Applications
        </Button>
      }
    />
  )
}
