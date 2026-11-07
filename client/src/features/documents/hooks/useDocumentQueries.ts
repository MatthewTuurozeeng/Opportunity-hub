import { useQuery } from '@tanstack/react-query'

import { listApplicationDocuments, listDocuments } from '../services/document.service'

export const DOCUMENT_QUERY_KEYS = {
  all: ['documents'] as const,
  list: () => [...DOCUMENT_QUERY_KEYS.all, 'list'] as const,
  forApplication: (applicationId: string) => [...DOCUMENT_QUERY_KEYS.all, 'application', applicationId] as const,
}

export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.list(),
    queryFn: listDocuments,
  })
}

export function useApplicationDocuments(applicationId: string) {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.forApplication(applicationId),
    queryFn: () => listApplicationDocuments(applicationId),
  })
}
