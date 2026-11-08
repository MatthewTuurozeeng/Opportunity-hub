import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCommunication, deleteCommunication, updateCommunication } from '../services/communication.service'
import type { CommunicationPayload } from '../types/communication.types'
import { COMMUNICATION_QUERY_KEYS } from './useCommunicationQueries'

/** The main list and each application's list overlap, so refresh them all. */
function useInvalidateCommunications() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.all })
}

interface SaveCommunicationVariables {
  /** Omit to create a new communication. */
  communicationId?: string
  payload: CommunicationPayload
}

export function useSaveCommunication() {
  const invalidateCommunications = useInvalidateCommunications()

  return useMutation({
    mutationFn: ({ communicationId, payload }: SaveCommunicationVariables) =>
      communicationId ? updateCommunication(communicationId, payload) : createCommunication(payload),
    onSuccess: invalidateCommunications,
  })
}

export function useDeleteCommunication() {
  const invalidateCommunications = useInvalidateCommunications()

  return useMutation({
    mutationFn: (communicationId: string) => deleteCommunication(communicationId),
    onSuccess: invalidateCommunications,
  })
}
