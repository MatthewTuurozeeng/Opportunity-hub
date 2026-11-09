import { FileText, SearchX, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import type { DocumentDialogType } from '../components/DocumentActionsMenu'
import { DocumentFilterBar } from '../components/DocumentFilterBar'
import { DocumentList } from '../components/DocumentList'
import { DocumentVersionsDialog } from '../components/DocumentVersionsDialog'
import { EditDocumentDialog } from '../components/EditDocumentDialog'
import { UploadDocumentDialog } from '../components/UploadDocumentDialog'
import { useDeleteDocumentGroup } from '../hooks/useDocumentMutations'
import { useDocuments } from '../hooks/useDocumentQueries'
import type { DocumentFilters } from '../types/document.types'
import { filterDocumentGroups, groupDocumentVersions } from '../utils/documentGroups'

type ActiveDialog =
  | { type: 'upload' }
  | { type: DocumentDialogType; versionGroupId: string }

export function DocumentsPage() {
  const { data: documents, isLoading, error, refetch } = useDocuments()
  const deleteDocumentGroup = useDeleteDocumentGroup()
  const [filters, setFilters] = useState<DocumentFilters>({ searchTerm: '', category: 'all' })
  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null)
  // A new key per opening gives each dialog a fresh form.
  const [dialogKey, setDialogKey] = useState(0)

  const groups = useMemo(() => groupDocumentVersions(documents ?? []), [documents])
  const visibleGroups = useMemo(() => filterDocumentGroups(groups, filters), [groups, filters])

  // Always read the latest data for the open dialog, so it never shows stale versions.
  const activeGroup =
    activeDialog && activeDialog.type !== 'upload'
      ? (groups.find((group) => group.versionGroupId === activeDialog.versionGroupId) ?? null)
      : null

  function openDialog(dialog: ActiveDialog) {
    setDialogKey((key) => key + 1)
    setActiveDialog(dialog)
  }

  function closeDialog(isOpen: boolean) {
    if (!isOpen) setActiveDialog(null)
  }

  function handleConfirmDelete() {
    if (!activeGroup) return

    deleteDocumentGroup.mutate(activeGroup, {
      onSuccess: () => {
        toast.success('Document deleted.')
        setActiveDialog(null)
      },
      onError: (deleteError) => {
        toast.error(deleteError.message)
        setActiveDialog(null)
      },
    })
  }

  const uploadButton = (
    <Button size="lg" onClick={() => openDialog({ type: 'upload' })}>
      <Upload aria-hidden="true" />
      Upload Document
    </Button>
  )

  function renderContent() {
    if (isLoading) {
      return (
        <div role="status" aria-label="Loading documents" className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )
    }
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />

    if (!groups.length) {
      return (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your CV, transcripts, letters and other materials once, then reuse them across applications."
          action={uploadButton}
        />
      )
    }

    return (
      <div className="flex flex-col gap-4">
        <DocumentFilterBar filters={filters} onFiltersChange={setFilters} />
        <p className="text-supporting text-muted-foreground" aria-live="polite">
          Showing {visibleGroups.length} of {groups.length} {groups.length === 1 ? 'document' : 'documents'}
        </p>
        {visibleGroups.length ? (
          <DocumentList
            groups={visibleGroups}
            onOpenDialog={(type, group) => openDialog({ type, versionGroupId: group.versionGroupId })}
          />
        ) : (
          <EmptyState icon={SearchX} title="No matching documents" description="Try a different search term or category." />
        )}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Document Library"
        description="Store and organize your application documents."
        actions={groups.length ? uploadButton : undefined}
      />
      {renderContent()}

      {activeDialog?.type === 'upload' && <UploadDocumentDialog key={dialogKey} isOpen onOpenChange={closeDialog} />}
      {activeDialog?.type === 'new-version' && activeGroup && (
        <UploadDocumentDialog key={dialogKey} isOpen onOpenChange={closeDialog} versionOf={activeGroup} />
      )}
      {activeDialog?.type === 'edit' && activeGroup && (
        <EditDocumentDialog key={dialogKey} group={activeGroup} isOpen onOpenChange={closeDialog} />
      )}
      {activeDialog?.type === 'versions' && activeGroup && (
        <DocumentVersionsDialog group={activeGroup} isOpen onOpenChange={closeDialog} />
      )}
      <ConfirmDialog
        isOpen={activeDialog?.type === 'delete' && activeGroup !== null}
        onOpenChange={closeDialog}
        title="Delete this document?"
        description={
          activeGroup && activeGroup.versions.length > 1
            ? `All ${activeGroup.versions.length} versions of "${activeGroup.latest.name}" will be permanently deleted. This cannot be undone.`
            : `"${activeGroup?.latest.name ?? ''}" will be permanently deleted. This cannot be undone.`
        }
        confirmLabel="Delete document"
        pendingLabel="Deleting…"
        isDestructive
        isPending={deleteDocumentGroup.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
