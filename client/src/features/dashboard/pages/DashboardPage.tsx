import { LayoutDashboard } from 'lucide-react'

import { AddApplicationButton } from '@/components/shared/AddApplicationButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your applications, deadlines and recent activity."
        actions={<AddApplicationButton />}
      />
      <EmptyState
        icon={LayoutDashboard}
        title="No applications yet"
        description="Add your first opportunity to start tracking deadlines, progress and outcomes."
      />
    </>
  )
}
