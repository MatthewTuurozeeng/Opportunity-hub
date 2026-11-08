import { useQuery } from '@tanstack/react-query'

import { listApplicationCommunications, listCommunications } from '../services/communication.service'

export const COMMUNICATION_QUERY_KEYS = {
  all: ['communications'] as const,
  list: () => [...COMMUNICATION_QUERY_KEYS.all, 'list'] as const,
  forApplication: (applicationId: string) => [...COMMUNICATION_QUERY_KEYS.all, 'application', applicationId] as const,
}

export function useCommunications() {
  return useQuery({
    queryKey: COMMUNICATION_QUERY_KEYS.list(),
    queryFn: listCommunications,
  })
}

export function useApplicationCommunications(applicationId: string) {
  return useQuery({
    queryKey: COMMUNICATION_QUERY_KEYS.forApplication(applicationId),
    queryFn: () => listApplicationCommunications(applicationId),
  })
}
