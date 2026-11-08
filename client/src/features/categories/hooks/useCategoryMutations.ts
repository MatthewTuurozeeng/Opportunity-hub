import { useMutation, useQueryClient } from '@tanstack/react-query'

import { APPLICATION_QUERY_KEYS } from '@/features/applications/hooks/applicationQueryKeys'

import { createCategory, deleteCategory, renameCategory } from '../services/category.service'
import { CATEGORY_QUERY_KEYS } from './useCategories'

/** Category names appear on applications and in analytics, so refresh those too. */
function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all }),
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all }),
    ])
}

export function useCreateCategory() {
  const invalidateCategories = useInvalidateCategories()
  return useMutation({ mutationFn: (name: string) => createCategory(name), onSuccess: invalidateCategories })
}

export function useRenameCategory() {
  const invalidateCategories = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ categoryId, name }: { categoryId: string; name: string }) => renameCategory(categoryId, name),
    onSuccess: invalidateCategories,
  })
}

export function useDeleteCategory() {
  const invalidateCategories = useInvalidateCategories()
  return useMutation({ mutationFn: (categoryId: string) => deleteCategory(categoryId), onSuccess: invalidateCategories })
}
