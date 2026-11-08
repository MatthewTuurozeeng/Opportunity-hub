import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, MailPlus, Trash2, UserCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState'
import { FormField } from '@/components/shared/FormField'
import { LoadingState } from '@/components/shared/LoadingState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCreateInvitation, useDeleteInvitation, useInvitations } from '@/features/invitations/hooks/useInvitations'
import { type InvitationFormValues, invitationSchema } from '@/features/invitations/schemas/invitationSchema'
import type { SignupInvitation } from '@/features/invitations/services/invitation.service'
import { formatDate } from '@/lib/dateUtils'
import { ROUTE_PATHS } from '@/routes/routePaths'

import { SettingsSection } from './SettingsSection'

function getSignUpLink(): string {
  return `${window.location.origin}${ROUTE_PATHS.SIGN_UP}`
}

function CopySignUpLinkButton() {
  const [isCopied, setIsCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getSignUpLink())
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error('Copy failed. Select the link and copy it instead.')
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {isCopied ? 'Copied' : 'Copy sign-up link'}
    </Button>
  )
}

function InviteForm() {
  const { user } = useAuth()
  const createInvitation = useCreateInvitation()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { email: '', note: '' },
  })

  const onSubmit = handleSubmit((values) => {
    if (values.email === user?.email?.toLowerCase()) {
      setError('email', { message: 'This is your own email address.' })
      return
    }

    createInvitation.mutate(values, {
      onSuccess: () => {
        toast.success(`${values.email} can now sign up.`, {
          description: 'Send them the sign-up link so they can create their account.',
        })
        reset()
      },
    })
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      <SettingsSection
        title="Invite someone"
        description={
          <>
            OpportunityHub is invite-only. Add a person&apos;s email address, then send them the sign-up link:{' '}
            <span className="font-medium break-all text-foreground">{getSignUpLink()}</span>. They get their own
            private account; you cannot see their data and they cannot see yours.
          </>
        }
        footer={
          <>
            <CopySignUpLinkButton />
            <Button type="submit" disabled={createInvitation.isPending}>
              <UserPlus aria-hidden="true" />
              {createInvitation.isPending ? 'Inviting…' : 'Invite'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="invite-email"
            label="Email address"
            type="email"
            autoComplete="off"
            isRequired
            errorMessage={errors.email?.message}
            {...register('email')}
          />
          <FormField
            id="invite-note"
            label="Note (optional)"
            placeholder="e.g. Classmate"
            errorMessage={errors.note?.message}
            {...register('note')}
          />
        </div>
        {createInvitation.error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
            {createInvitation.error.message}
          </p>
        )}
      </SettingsSection>
    </form>
  )
}

function InvitationList() {
  const { data: invitations, isLoading, error, refetch } = useInvitations()
  const deleteInvitation = useDeleteInvitation()
  const [invitationToRemove, setInvitationToRemove] = useState<SignupInvitation | null>(null)

  function handleConfirmRemove() {
    if (!invitationToRemove) return
    deleteInvitation.mutate(invitationToRemove.id, {
      onSuccess: () => {
        toast.success('Invitation removed.')
        setInvitationToRemove(null)
      },
      onError: (removeError) => {
        toast.error(removeError.message)
        setInvitationToRemove(null)
      },
    })
  }

  function renderList() {
    if (isLoading) return <LoadingState label="Loading invitations…" className="py-6" />
    if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />
    if (!invitations?.length) {
      return (
        <p className="flex items-center gap-2 text-body text-muted-foreground">
          <MailPlus className="size-4" aria-hidden="true" />
          No one has been invited yet.
        </p>
      )
    }

    return (
      <ul className="divide-y divide-border rounded-lg border border-border">
        {invitations.map((invitation) => (
          <li key={invitation.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium">{invitation.email}</p>
                {invitation.accepted_at ? (
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-success-green">
                    <UserCheck aria-hidden="true" />
                    Joined {formatDate(invitation.accepted_at)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                    Invited
                  </Badge>
                )}
              </div>
              <p className="truncate text-supporting text-muted-foreground">
                Invited {formatDate(invitation.created_at)}
                {invitation.note && <> · {invitation.note}</>}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setInvitationToRemove(invitation)}
              aria-label={`Remove invitation for ${invitation.email}`}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <SettingsSection
      title="Invitations"
      description="Pending invitations let that address sign up. Removing one stops a pending sign-up but does not delete an account that already joined."
    >
      {renderList()}

      <ConfirmDialog
        isOpen={invitationToRemove !== null}
        onOpenChange={(isOpen) => !isOpen && setInvitationToRemove(null)}
        title="Remove this invitation?"
        description={
          invitationToRemove?.accepted_at
            ? `${invitationToRemove.email} has already joined. Removing the invitation keeps their account; it only clears it from this list.`
            : `${invitationToRemove?.email ?? ''} will no longer be able to sign up.`
        }
        confirmLabel="Remove"
        pendingLabel="Removing…"
        isDestructive
        isPending={deleteInvitation.isPending}
        onConfirm={handleConfirmRemove}
      />
    </SettingsSection>
  )
}

/** Owner-only: manage who may create an account. */
export function InvitationSettings() {
  return (
    <div className="flex flex-col gap-4">
      <InviteForm />
      <InvitationList />
    </div>
  )
}
