import { BarChart3 } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Review your application activity and outcomes."
      />
      <EmptyState
        icon={BarChart3}
        title="Not enough data yet"
        description="Insights will appear once you have submitted applications."
      />
    </>
  )
}
