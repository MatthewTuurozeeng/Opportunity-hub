import { Briefcase } from 'lucide-react'

import { AddApplicationButton } from '@/components/shared/AddApplicationButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function ApplicationsPage() {
  return (
    <>
      <PageHeader
        title="Applications"
        description="Manage all your opportunities and applications."
        actions={<AddApplicationButton />}
      />
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        description="Record an opportunity now and apply when you are ready. Drafts are not counted as submitted."
      />
    </>
  )
}
