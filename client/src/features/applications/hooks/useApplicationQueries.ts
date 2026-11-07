import { useQuery } from '@tanstack/react-query'

import { getApplication, listApplications, listApplicationStatusHistory } from '../services/application.service'
import { APPLICATION_QUERY_KEYS } from './applicationQueryKeys'

export function useApplications() {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.list(),
    queryFn: listApplications,
  })
}

export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
    queryFn: () => getApplication(applicationId),
  })
}

export function useApplicationStatusHistory(applicationId: string) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.statusHistory(applicationId),
    queryFn: () => listApplicationStatusHistory(applicationId),
  })
}
