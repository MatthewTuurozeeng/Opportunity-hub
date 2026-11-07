import { Download, Eye, FileText, Paperclip, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { DOCUMENT_CATEGORY_LABELS } from '../constants/documentCategories'
import { useDetachDocument } from '../hooks/useDocumentMutations'
import { useApplicationDocuments } from '../hooks/useDocumentQueries'
import { useOpenDocument } from '../hooks/useOpenDocument'
import type { LinkedDocument } from '../types/document.types'
import { formatFileSize } from '../utils/fileUtils'
import { AttachDocumentsDialog } from './AttachDocumentsDialog'
import { DocumentFileIcon } from './DocumentFileIcon'

interface ApplicationDocumentsPanelProps {
  applicationId: string
}

/** Documents attached to one application, shown on its detail page. */
export function ApplicationDocumentsPanel({ applicationId }: ApplicationDocumentsPanelProps) {
  const { data: documents, isLoading, error, refetch } = useApplicationDocuments(applicationId)
  const detachDocument = useDetachDocument(applicationId)
  const { viewDocument, downloadDocument } = useOpenDocument()
  const [attachDialogKey, setAttachDialogKey] = useState<number | null>(null)
  const [documentToDetach, setDocumentToDetach] = useState<LinkedDocument | null>(null)

  const attachedDocumentIds = useMemo(() => new Set(documents?.map((document) => document.id)), [documents])

  function openAttachDialog() {
    setAttachDialogKey(Date.now())
  }

  function handleConfirmDetach() {
    if (!documentToDetach) return

    detachDocument.mutate(documentToDetach.id, {
      onSuccess: () => {
        toast.success('Document removed from this application.')
        setDocumentToDetach(null)
      },
      onError: (detachError) => {
        toast.error(detachError.message)
        setDocumentToDetach(null)
      },
    })
  }

  const attachButton = (
    <Button onClick={openAttachDialog}>
      <Paperclip aria-hidden="true" />
      Attach documents
    </Button>
  )

  function renderContent() {
    if (isLoading) return <LoadingState label="Loading documents…" />
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!documents?.length) {
      return (
        <EmptyState
          icon={FileText}
          title="No documents attached"
          description="Attach the CV, letters and other materials you used for this application."
          action={attachButton}
        />
      )
    }

    return (
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between gap-3 border-b border-border p-4">
          <h2 className="text-section-heading font-semibold">Attached documents</h2>
          {attachButton}
        </header>
        <ul className="divide-y divide-border">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center gap-3 p-4">
              <DocumentFileIcon mimeType={document.mime_type} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-heading">{document.name}</p>
                  <Badge variant="secondary">v{document.version}</Badge>
                </div>
                <p className="truncate text-supporting text-muted-foreground">
                  {DOCUMENT_CATEGORY_LABELS[document.category]} · {document.file_name} ·{' '}
                  {formatFileSize(document.size_bytes)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => viewDocument(document)} aria-label={`View ${document.name}`}>
                  <Eye aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => downloadDocument(document)}
                  aria-label={`Download ${document.name}`}
                >
                  <Download aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDocumentToDetach(document)}
                  aria-label={`Remove ${document.name} from this application`}
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <>
      {renderContent()}

      {attachDialogKey !== null && (
        <AttachDocumentsDialog
          key={attachDialogKey}
          applicationId={applicationId}
          attachedDocumentIds={attachedDocumentIds}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setAttachDialogKey(null)}
        />
      )}

      <ConfirmDialog
        isOpen={documentToDetach !== null}
        onOpenChange={(isOpen) => !isOpen && setDocumentToDetach(null)}
        title="Remove from this application?"
        description={`"${documentToDetach?.name ?? ''}" stays in your document library. Only the link to this application is removed.`}
        confirmLabel="Remove"
        pendingLabel="Removing…"
        isDestructive
        isPending={detachDocument.isPending}
        onConfirm={handleConfirmDetach}
      />
    </>
  )
}
