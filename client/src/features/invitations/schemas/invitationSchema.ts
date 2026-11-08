import { z } from 'zod'

export const invitationSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  note: z.string().trim().max(200, 'Use 200 characters or fewer.'),
})

export type InvitationFormValues = z.infer<typeof invitationSchema>
