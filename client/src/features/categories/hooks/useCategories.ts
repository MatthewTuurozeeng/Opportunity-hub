import { useQuery } from '@tanstack/react-query'

import { listCategories, listCategoriesWithUsage } from '../services/category.service'

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  withUsage: () => [...CATEGORY_QUERY_KEYS.all, 'with-usage'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.all,
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoriesWithUsage() {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.withUsage(),
    queryFn: listCategoriesWithUsage,
  })
}
