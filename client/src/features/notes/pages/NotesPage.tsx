import { NotebookPen } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function NotesPage() {
  return (
    <>
      <PageHeader
        title="Notes & Reflections"
        description="Keep interview preparation notes, feedback and lessons learned."
      />
      <EmptyState
        icon={NotebookPen}
        title="No notes yet"
        description="Notes and reflections you write will appear here."
      />
    </>
  )
}
