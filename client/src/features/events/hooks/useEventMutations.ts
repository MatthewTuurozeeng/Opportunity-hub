import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createApplicationEvent,
  deleteApplicationEvent,
  setApplicationEventCompleted,
  updateApplicationEvent,
} from '../services/event.service'
import type { ApplicationEventPayload } from '../types/event.types'
import { EVENT_QUERY_KEYS } from './useEventQueries'

/** Event lists feed the application timeline, the dashboard and the calendar, so refresh them all. */
function useInvalidateEvents() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all })
}

interface SaveEventVariables {
  /** Omit to create a new event. */
  eventId?: string
  payload: ApplicationEventPayload
}

export function useSaveApplicationEvent() {
  const invalidateEvents = useInvalidateEvents()

  return useMutation({
    mutationFn: ({ eventId, payload }: SaveEventVariables) =>
      eventId ? updateApplicationEvent(eventId, payload) : createApplicationEvent(payload),
    onSuccess: invalidateEvents,
  })
}

export function useSetApplicationEventCompleted() {
  const invalidateEvents = useInvalidateEvents()

  return useMutation({
    mutationFn: ({ eventId, isCompleted }: { eventId: string; isCompleted: boolean }) =>
      setApplicationEventCompleted(eventId, isCompleted),
    onSuccess: invalidateEvents,
  })
}

export function useDeleteApplicationEvent() {
  const invalidateEvents = useInvalidateEvents()

  return useMutation({
    mutationFn: (eventId: string) => deleteApplicationEvent(eventId),
    onSuccess: invalidateEvents,
  })
}
