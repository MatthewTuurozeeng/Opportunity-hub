import { useQuery } from '@tanstack/react-query'

import { listApplicationEvents, listEventsBetween, listUpcomingEvents } from '../services/event.service'

export const EVENT_QUERY_KEYS = {
  all: ['events'] as const,
  forApplication: (applicationId: string) => [...EVENT_QUERY_KEYS.all, 'application', applicationId] as const,
  upcoming: (limit: number) => [...EVENT_QUERY_KEYS.all, 'upcoming', limit] as const,
  between: (start: Date, end: Date) =>
    [...EVENT_QUERY_KEYS.all, 'between', start.toISOString(), end.toISOString()] as const,
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

/** Events starting in [start, end), e.g. the days shown on a calendar month. */
export function useEventsBetween(start: Date, end: Date) {
  return useQuery({
    queryKey: EVENT_QUERY_KEYS.between(start, end),
    queryFn: () => listEventsBetween(start, end),
    placeholderData: (previousData) => previousData,
  })
}
