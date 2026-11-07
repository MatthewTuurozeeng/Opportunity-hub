import { useQuery } from '@tanstack/react-query'

import { getOwnerAccountExists } from '../services/auth.service'

export const OWNER_ACCOUNT_EXISTS_QUERY_KEY = ['auth', 'owner-account-exists'] as const

export function useOwnerAccountExists() {
  return useQuery({
    queryKey: OWNER_ACCOUNT_EXISTS_QUERY_KEY,
    queryFn: getOwnerAccountExists,
  })
}
