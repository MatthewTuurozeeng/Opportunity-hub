import { FilePlus2 } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function NewApplicationPage() {
  return (
    <>
      <PageHeader
        title="Add Application"
        description="Record a new opportunity and its application details."
      />
      <EmptyState
        icon={FilePlus2}
        title="Application form coming soon"
        description="The opportunity and application form will be available here."
      />
    </>
  )
}
