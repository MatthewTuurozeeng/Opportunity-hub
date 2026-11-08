import { z } from 'zod'

import { strongPasswordSchema } from '@/features/auth/schemas/signUpSchema'

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your name.').max(120, 'Use 120 characters or fewer.'),
})
export type ProfileFormValues = z.infer<typeof profileSchema>

export function buildEmailChangeSchema(currentEmail: string) {
  return z.object({
    email: z
      .email('Enter a valid email address.')
      .trim()
      .refine((email) => email.toLowerCase() !== currentEmail.toLowerCase(), 'This is already your email address.'),
  })
}
export type EmailChangeFormValues = z.infer<ReturnType<typeof buildEmailChangeSchema>>

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one.',
  })
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, 'Enter a category name.')
  .max(60, 'Use 60 characters or fewer.')
