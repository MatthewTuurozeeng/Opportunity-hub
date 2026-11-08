import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { COMMUNICATION_QUERY_KEYS } from '@/features/communications/hooks/useCommunicationQueries'

import {
  attachDocuments,
  deleteDocumentGroup,
  deleteDocumentVersion,
  detachDocument,
  updateDocumentDetails,
  uploadDocument,
  type UploadDocumentInput,
} from '../services/document.service'
import type { DocumentDetailsValues, DocumentGroup, DocumentRecord } from '../types/document.types'
import { DOCUMENT_QUERY_KEYS } from './useDocumentQueries'

/**
 * Library and application attachment lists depend on each other, so refresh both.
 * Communications show attachment names and lose deleted attachments, so refresh them too.
 */
function useInvalidateDocuments() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all }),
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.all }),
    ])
}

export function useUploadDocument() {
  const { user } = useAuth()
  const invalidateDocuments = useInvalidateDocuments()

  return useMutation({
    mutationFn: (input: Omit<UploadDocumentInput, 'userId'>) => {
      if (!user) throw new Error('You need to be signed in to upload documents.')
      return uploadDocument({ ...input, userId: user.id })
    },
    onSuccess: invalidateDocuments,
  })
}

export function useUpdateDocumentDetails() {
  const invalidateDocuments = useInvalidateDocuments()

  return useMutation({
    mutationFn: ({ versionGroupId, values }: { versionGroupId: string; values: DocumentDetailsValues }) =>
      updateDocumentDetails(versionGroupId, values),
    onSuccess: invalidateDocuments,
  })
}

export function useDeleteDocumentGroup() {
  const invalidateDocuments = useInvalidateDocuments()

  return useMutation({
    mutationFn: (group: DocumentGroup) => deleteDocumentGroup(group),
    onSuccess: invalidateDocuments,
  })
}

export function useDeleteDocumentVersion() {
  const invalidateDocuments = useInvalidateDocuments()

  return useMutation({
    mutationFn: (document: DocumentRecord) => deleteDocumentVersion(document),
    onSuccess: invalidateDocuments,
  })
}

export function useAttachDocuments(applicationId: string) {
  const invalidateDocuments = useInvalidateDocuments()

  return useMutation({
    mutationFn: (documentIds: string[]) => attachDocuments(applicationId, documentIds),
    onSuccess: invalidateDocuments,
  })
}

export function useDetachDocument(applicationId: string) {
  const invalidateDocuments = useInvalidateDocuments()

  return useMutation({
    mutationFn: (documentId: string) => detachDocument(applicationId, documentId),
    onSuccess: invalidateDocuments,
  })
}
