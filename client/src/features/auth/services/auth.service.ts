import { supabase } from '@/lib/supabase'
import { ROUTE_PATHS } from '@/routes/routePaths'

import type { LoginFormValues } from '../schemas/loginSchema'
import type { SignUpFormValues } from '../schemas/signUpSchema'

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Do not reveal whether the email exists; show one message for both cases.
  invalid_credentials: 'Incorrect email or password.',
  email_not_confirmed: 'Confirm your email address first. Check your inbox for the confirmation link.',
  over_request_rate_limit: 'Too many attempts. Please wait a few minutes and try again.',
  over_email_send_rate_limit: 'Too many emails sent. Please wait a few minutes and try again.',
  weak_password: 'Choose a stronger password.',
  user_already_exists: 'An account with this email already exists. Sign in instead.',
  email_exists: 'An account with this email already exists. Sign in instead.',
  signup_disabled: 'Sign-up is turned off for this project.',
  // The database rejects every account after the owner's (single-owner rule).
  unexpected_failure: 'An owner account already exists. Sign in instead.',
}

function toFriendlyError(error: { code?: string }): Error {
  const message = error.code ? AUTH_ERROR_MESSAGES[error.code] : undefined
  return new Error(message ?? DEFAULT_ERROR_MESSAGE)
}

export async function signInWithPassword({ email, password }: LoginFormValues) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw toFriendlyError(error)
  }
}

export interface SignUpResult {
  /** False when Supabase requires the email address to be confirmed first. */
  isSignedIn: boolean
}

export async function signUp({ fullName, email, password }: SignUpFormValues): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}${ROUTE_PATHS.LOGIN}`,
    },
  })

  if (error) {
    throw toFriendlyError(error)
  }

  return { isSignedIn: Boolean(data.session) }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error('Unable to sign out. Please try again.')
  }
}

/** Whether the single owner account has already been created. */
export async function getOwnerAccountExists(): Promise<boolean> {
  const { data, error } = await supabase.rpc('owner_account_exists')

  if (error) {
    throw new Error('Unable to check account status.')
  }

  return data === true
}
