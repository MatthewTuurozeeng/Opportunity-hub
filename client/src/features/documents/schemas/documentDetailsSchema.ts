import { z } from 'zod'

import { DOCUMENT_CATEGORIES } from '../constants/documentCategories'

export const documentDetailsSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name for the document.').max(200, 'Use 200 characters or fewer.'),
  category: z.enum(DOCUMENT_CATEGORIES),
  description: z.string().trim().max(1000, 'Use 1000 characters or fewer.'),
})

export type DocumentDetailsFormValues = z.infer<typeof documentDetailsSchema>
