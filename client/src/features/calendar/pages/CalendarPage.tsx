import { CalendarDays } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar & Timeline"
        description="View deadlines, interviews and other important dates."
      />
      <EmptyState
        icon={CalendarDays}
        title="No upcoming events"
        description="Deadlines, interviews and assessments you schedule will appear here."
      />
    </>
  )
}
