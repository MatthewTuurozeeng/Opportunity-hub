import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { ApplicationStatus } from '../constants/applicationStatuses'
import {
  changeApplicationStatus,
  createApplication,
  deleteApplication,
  updateApplication,
} from '../services/application.service'
import type { ApplicationPayload } from '../types/application.types'
import { APPLICATION_QUERY_KEYS } from './applicationQueryKeys'

/** Every write can change lists, details and history, so refresh all application data. */
function useInvalidateApplications() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all })
}

export function useCreateApplication() {
  const invalidateApplications = useInvalidateApplications()

  return useMutation({
    mutationFn: (payload: ApplicationPayload) => createApplication(payload),
    onSuccess: invalidateApplications,
  })
}

export function useUpdateApplication(applicationId: string) {
  const invalidateApplications = useInvalidateApplications()

  return useMutation({
    mutationFn: (payload: ApplicationPayload) => updateApplication(applicationId, payload),
    onSuccess: invalidateApplications,
  })
}

interface ChangeStatusVariables {
  status: ApplicationStatus
  note: string
}

export function useChangeApplicationStatus(applicationId: string) {
  const invalidateApplications = useInvalidateApplications()

  return useMutation({
    mutationFn: ({ status, note }: ChangeStatusVariables) => changeApplicationStatus(applicationId, status, note),
    onSuccess: invalidateApplications,
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ opportunityId }: { applicationId: string; opportunityId: string }) =>
      deleteApplication(opportunityId),
    onSuccess: (_result, { applicationId }) => {
      // Drop the deleted record's cached detail so it is not refetched (and 404s).
      queryClient.removeQueries({ queryKey: APPLICATION_QUERY_KEYS.detail(applicationId) })
      queryClient.removeQueries({ queryKey: APPLICATION_QUERY_KEYS.statusHistory(applicationId) })
      return queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.list() })
    },
  })
}
