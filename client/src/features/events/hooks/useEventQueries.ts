import { useQuery } from '@tanstack/react-query'

import { listApplicationEvents } from '../services/event.service'

export const EVENT_QUERY_KEYS = {
  all: ['events'] as const,
  forApplication: (applicationId: string) => [...EVENT_QUERY_KEYS.all, 'application', applicationId] as const,
}

export function useApplicationEvents(applicationId: string) {
  return useQuery({
    queryKey: EVENT_QUERY_KEYS.forApplication(applicationId),
    queryFn: () => listApplicationEvents(applicationId),
  })
}
