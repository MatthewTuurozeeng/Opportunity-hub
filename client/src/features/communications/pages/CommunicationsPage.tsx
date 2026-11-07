import { Mail } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function CommunicationsPage() {
  return (
    <>
      <PageHeader
        title="Communications"
        description="Record sent and received application communications."
      />
      <EmptyState
        icon={Mail}
        title="No communications recorded"
        description="Confirmations, interview invitations and follow-ups you log will appear here."
      />
    </>
  )
}
