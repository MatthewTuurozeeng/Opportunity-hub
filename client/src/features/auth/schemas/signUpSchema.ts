import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 10

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Enter your name.').max(120, 'Use 120 characters or fewer.'),
    email: z.email('Enter a valid email address.').trim(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
      .regex(/[a-z]/, 'Include a lowercase letter.')
      .regex(/[A-Z]/, 'Include an uppercase letter.')
      .regex(/\d/, 'Include a number.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export type SignUpFormValues = z.infer<typeof signUpSchema>
