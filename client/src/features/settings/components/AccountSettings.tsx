import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, LogOut, MailCheck, MonitorSmartphone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PASSWORD_RULES_HINT } from '@/features/auth/schemas/signUpSchema'
import {
  changePassword,
  requestEmailChange,
  signOut,
  signOutEverywhere,
} from '@/features/auth/services/auth.service'

import {
  buildEmailChangeSchema,
  type EmailChangeFormValues,
  passwordChangeSchema,
  type PasswordChangeFormValues,
} from '../schemas/settingsSchemas'
import { SettingsSection } from './SettingsSection'

function ErrorAlert({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
      {message}
    </p>
  )
}

function EmailSection({ currentEmail }: { currentEmail: string }) {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const schema = useMemo(() => buildEmailChangeSchema(currentEmail), [currentEmail])
  const emailChange = useMutation({ mutationFn: requestEmailChange })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EmailChangeFormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  const onSubmit = handleSubmit(({ email }) => {
    emailChange.mutate(email, {
      onSuccess: () => {
        setPendingEmail(email)
        reset()
      },
    })
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      <SettingsSection
        title="Email address"
        description={
          <>
            You sign in with <span className="font-medium text-foreground">{currentEmail}</span>. To change it, enter the new
            address. The change takes effect after you confirm it from your inbox.
          </>
        }
        footer={
          <Button type="submit" disabled={!isDirty || emailChange.isPending}>
            {emailChange.isPending ? 'Sending…' : 'Send confirmation'}
          </Button>
        }
      >
        <div className="grid gap-4 sm:max-w-md">
          <FormField
            id="account-new-email"
            label="New email address"
            type="email"
            autoComplete="email"
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>
        {pendingEmail && (
          <p role="status" className="flex items-start gap-2 rounded-md bg-secondary px-3 py-2 text-body text-secondary-foreground">
            <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Check <span className="font-medium">{pendingEmail}</span> for a confirmation link. If secure email change is
              on for your project, confirm from your current address too. Until then, keep signing in with {currentEmail}.
            </span>
          </p>
        )}
        {emailChange.error && <ErrorAlert message={emailChange.error.message} />}
      </SettingsSection>
    </form>
  )
}

function PasswordSection({ email }: { email: string }) {
  const [showPasswords, setShowPasswords] = useState(false)
  const passwordChange = useMutation({ mutationFn: changePassword })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit((values) => {
    passwordChange.mutate(
      { email, currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success('Password changed.')
          reset()
        },
      },
    )
  })

  const inputType = showPasswords ? 'text' : 'password'

  return (
    <form noValidate onSubmit={onSubmit}>
      <SettingsSection
        title="Password"
        description="Confirm your current password, then choose a new one."
        footer={
          <Button type="submit" disabled={!isDirty || passwordChange.isPending}>
            {passwordChange.isPending ? 'Changing…' : 'Change password'}
          </Button>
        }
      >
        <div className="grid gap-4 sm:max-w-md">
          <FormField
            id="account-current-password"
            label="Current password"
            type={inputType}
            autoComplete="current-password"
            isRequired
            errorMessage={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <FormField
            id="account-new-password"
            label="New password"
            type={inputType}
            autoComplete="new-password"
            isRequired
            hint={PASSWORD_RULES_HINT}
            errorMessage={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <FormField
            id="account-confirm-password"
            label="Confirm new password"
            type={inputType}
            autoComplete="new-password"
            isRequired
            errorMessage={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit"
            aria-pressed={showPasswords}
            onClick={() => setShowPasswords((isShown) => !isShown)}
          >
            {showPasswords ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            {showPasswords ? 'Hide passwords' : 'Show passwords'}
          </Button>
        </div>
        {passwordChange.error && <ErrorAlert message={passwordChange.error.message} />}
      </SettingsSection>
    </form>
  )
}

function SessionsSection() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const signOutHere = useMutation({ mutationFn: signOut, onError: (error) => toast.error(error.message) })
  const signOutAll = useMutation({
    mutationFn: signOutEverywhere,
    onError: (error) => {
      toast.error(error.message)
      setIsConfirmOpen(false)
    },
  })

  return (
    <SettingsSection
      title="Sessions"
      description="Signing out on this device keeps you signed in elsewhere. Sign out everywhere if you used a shared or lost device."
    >
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => signOutHere.mutate()} disabled={signOutHere.isPending}>
          <LogOut aria-hidden="true" />
          {signOutHere.isPending ? 'Signing out…' : 'Sign out'}
        </Button>
        <Button variant="outline" onClick={() => setIsConfirmOpen(true)}>
          <MonitorSmartphone aria-hidden="true" />
          Sign out everywhere
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Sign out on every device?"
        description="You will be signed out here and on every other browser or device, and will need to sign in again."
        confirmLabel="Sign out everywhere"
        pendingLabel="Signing out…"
        isPending={signOutAll.isPending}
        onConfirm={() => signOutAll.mutate()}
      />
    </SettingsSection>
  )
}

export function AccountSettings() {
  const { user } = useAuth()
  const email = user?.email ?? ''

  return (
    <div className="flex flex-col gap-4">
      <EmailSection currentEmail={email} />
      <PasswordSection email={email} />
      <SessionsSection />
    </div>
  )
}
