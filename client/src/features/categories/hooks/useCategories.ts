import { useQuery } from '@tanstack/react-query'

import { listCategories } from '../services/category.service'

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.all,
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  })
}
