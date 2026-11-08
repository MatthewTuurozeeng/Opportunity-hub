import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 10

/** The password rules for every new password (sign-up and password changes). */
export const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .regex(/[a-z]/, 'Include a lowercase letter.')
  .regex(/[A-Z]/, 'Include an uppercase letter.')
  .regex(/\d/, 'Include a number.')

export const PASSWORD_RULES_HINT = `At least ${PASSWORD_MIN_LENGTH} characters, with uppercase, lowercase and a number.`

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Enter your name.').max(120, 'Use 120 characters or fewer.'),
    email: z.email('Enter a valid email address.').trim(),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export type SignUpFormValues = z.infer<typeof signUpSchema>
