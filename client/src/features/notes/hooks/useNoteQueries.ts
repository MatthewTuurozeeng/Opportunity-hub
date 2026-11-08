import { useQuery } from '@tanstack/react-query'

import { listApplicationNotes, listNotes } from '../services/note.service'

export const NOTE_QUERY_KEYS = {
  all: ['notes'] as const,
  list: () => [...NOTE_QUERY_KEYS.all, 'list'] as const,
  forApplication: (applicationId: string) => [...NOTE_QUERY_KEYS.all, 'application', applicationId] as const,
}

export function useNotes() {
  return useQuery({
    queryKey: NOTE_QUERY_KEYS.list(),
    queryFn: listNotes,
  })
}

export function useApplicationNotes(applicationId: string) {
  return useQuery({
    queryKey: NOTE_QUERY_KEYS.forApplication(applicationId),
    queryFn: () => listApplicationNotes(applicationId),
  })
}
