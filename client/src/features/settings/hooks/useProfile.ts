import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'

import { getProfile, updateProfile } from '../services/profile.service'

export const PROFILE_QUERY_KEYS = {
  all: ['profile'] as const,
  detail: (userId: string) => [...PROFILE_QUERY_KEYS.all, userId] as const,
}

export function useProfile() {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.detail(userId),
    queryFn: () => getProfile(userId),
    enabled: Boolean(userId),
  })
}

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fullName: string) => {
      if (!user) throw new Error('You need to be signed in to update your profile.')
      return updateProfile(user.id, fullName)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.all }),
  })
}
