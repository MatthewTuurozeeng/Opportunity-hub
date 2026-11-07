export const APPLICATION_QUERY_KEYS = {
  all: ['applications'] as const,
  list: () => [...APPLICATION_QUERY_KEYS.all, 'list'] as const,
  detail: (applicationId: string) => [...APPLICATION_QUERY_KEYS.all, 'detail', applicationId] as const,
  statusHistory: (applicationId: string) => [...APPLICATION_QUERY_KEYS.all, 'status-history', applicationId] as const,
}
