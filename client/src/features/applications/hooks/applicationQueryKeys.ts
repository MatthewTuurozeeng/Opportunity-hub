export const APPLICATION_QUERY_KEYS = {
  all: ['applications'] as const,
  list: () => [...APPLICATION_QUERY_KEYS.all, 'list'] as const,
  detail: (applicationId: string) => [...APPLICATION_QUERY_KEYS.all, 'detail', applicationId] as const,
  statusHistory: (applicationId: string) => [...APPLICATION_QUERY_KEYS.all, 'status-history', applicationId] as const,
  // Under `all`, so every application write refreshes the statistics too.
  interviewIds: () => [...APPLICATION_QUERY_KEYS.all, 'interview-ids'] as const,
  recentStatusChanges: (limit: number) => [...APPLICATION_QUERY_KEYS.all, 'recent-status-changes', limit] as const,
}
