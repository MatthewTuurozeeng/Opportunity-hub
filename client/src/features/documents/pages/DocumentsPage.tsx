import { FileText } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Document Library"
        description="Store, organize and reuse your application documents."
      />
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Uploaded CVs, transcripts, letters and other materials will appear here."
      />
    </>
  )
}
