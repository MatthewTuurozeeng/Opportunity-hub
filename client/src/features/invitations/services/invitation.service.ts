import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type SignupInvitation = Tables<'signup_invitations'>

/** PostgreSQL error code for a duplicate value. */
const UNIQUE_VIOLATION_CODE = '23505'

export async function listInvitations(): Promise<SignupInvitation[]> {
  const { data, error } = await supabase
    .from('signup_invitations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Unable to load invitations.')
  }

  return data
}

export async function createInvitation({ email, note }: { email: string; note: string }): Promise<void> {
  const { error } = await supabase
    .from('signup_invitations')
    .insert({ email: email.trim().toLowerCase(), note: note.trim() || null })

  if (error) {
    throw new Error(
      error.code === UNIQUE_VIOLATION_CODE
        ? 'This email address has already been invited.'
        : 'Unable to save the invitation. Please try again.',
    )
  }
}

/** Removing an invitation stops a pending sign-up; it does not remove an account that already exists. */
export async function deleteInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase.from('signup_invitations').delete().eq('id', invitationId)

  if (error) {
    throw new Error('Unable to remove the invitation. Please try again.')
  }
}
