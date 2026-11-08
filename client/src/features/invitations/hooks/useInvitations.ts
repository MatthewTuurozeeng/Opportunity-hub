import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createInvitation, deleteInvitation, listInvitations } from '../services/invitation.service'

export const INVITATION_QUERY_KEYS = {
  all: ['invitations'] as const,
}

export function useInvitations() {
  return useQuery({ queryKey: INVITATION_QUERY_KEYS.all, queryFn: listInvitations })
}

export function useCreateInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createInvitation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVITATION_QUERY_KEYS.all }),
  })
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteInvitation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVITATION_QUERY_KEYS.all }),
  })
}
