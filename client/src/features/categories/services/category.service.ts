import type { CategorySummary } from '@/features/applications/types/application.types'
import { supabase } from '@/lib/supabase'

export async function listCategories(): Promise<CategorySummary[]> {
  const { data, error } = await supabase.from('categories').select('id, name').order('name')

  if (error) {
    throw new Error('Unable to load categories.')
  }

  return data
}
