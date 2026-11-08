import { useQuery } from '@tanstack/react-query'

import { listApplicationEvents, listUpcomingEvents } from '../services/event.service'

export const EVENT_QUERY_KEYS = {
  all: ['events'] as const,
  forApplication: (applicationId: string) => [...EVENT_QUERY_KEYS.all, 'application', applicationId] as const,
  upcoming: (limit: number) => [...EVENT_QUERY_KEYS.all, 'upcoming', limit] as const,
}

export function useApplicationEvents(applicationId: string) {
  return useQuery({
    queryKey: EVENT_QUERY_KEYS.forApplication(applicationId),
    queryFn: () => listApplicationEvents(applicationId),
  })
}

export function useUpcomingEvents(limit: number) {
  return useQuery({
    queryKey: EVENT_QUERY_KEYS.upcoming(limit),
    queryFn: () => listUpcomingEvents(limit),
  })
}
