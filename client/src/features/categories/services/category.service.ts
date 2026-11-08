import type { CategorySummary } from '@/features/applications/types/application.types'
import { supabase } from '@/lib/supabase'

/** PostgreSQL error code for a duplicate value (each name is unique per user). */
const UNIQUE_VIOLATION_CODE = '23505'

export interface CategoryWithUsage extends CategorySummary {
  /** Opportunities currently in this category. */
  opportunityCount: number
}

export async function listCategories(): Promise<CategorySummary[]> {
  const { data, error } = await supabase.from('categories').select('id, name').order('name')

  if (error) {
    throw new Error('Unable to load categories.')
  }

  return data
}

export async function listCategoriesWithUsage(): Promise<CategoryWithUsage[]> {
  const { data, error } = await supabase.from('categories').select('id, name, opportunities(count)').order('name')

  if (error) {
    throw new Error('Unable to load categories.')
  }

  return data.map(({ id, name, opportunities }) => ({
    id,
    name,
    opportunityCount: opportunities[0]?.count ?? 0,
  }))
}

function toCategoryError(error: { code?: string }, fallback: string): Error {
  return new Error(error.code === UNIQUE_VIOLATION_CODE ? 'A category with this name already exists.' : fallback)
}

export async function createCategory(name: string): Promise<void> {
  const { error } = await supabase.from('categories').insert({ name: name.trim() })

  if (error) {
    throw toCategoryError(error, 'Unable to add the category. Please try again.')
  }
}

export async function renameCategory(categoryId: string, name: string): Promise<void> {
  const { error } = await supabase.from('categories').update({ name: name.trim() }).eq('id', categoryId)

  if (error) {
    throw toCategoryError(error, 'Unable to rename the category. Please try again.')
  }
}

/** Opportunities in the category are kept and become uncategorized. */
export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)

  if (error) {
    throw new Error('Unable to delete the category. Please try again.')
  }
}
