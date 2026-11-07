import { Settings } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, categories and data."
      />
      <EmptyState
        icon={Settings}
        title="Settings coming soon"
        description="Profile, category and data export settings will be available here."
      />
    </>
  )
}
