import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ErrorState } from '@/components/shared/ErrorState'
import { FormField } from '@/components/shared/FormField'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatDate, formatDateTime } from '@/lib/dateUtils'

import { useProfile, useUpdateProfile } from '../hooks/useProfile'
import { type ProfileFormValues, profileSchema } from '../schemas/settingsSchemas'
import type { Profile } from '../services/profile.service'
import { SettingsSection } from './SettingsSection'

function getInitials(name: string | null | undefined, email: string | undefined): string {
  const source = name?.trim() || email || '?'
  const words = source.split(/\s+/).filter(Boolean)
  const initials = words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}` : source.slice(0, 2)
  return initials.toUpperCase()
}

function ProfileForm({ profile }: { profile: Profile }) {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.full_name ?? '' },
  })

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(values.fullName, {
      onSuccess: () => {
        toast.success('Profile saved.')
        reset({ fullName: values.fullName.trim() })
      },
    })
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      <SettingsSection
        title="Profile"
        description="Your name appears in the app. Your email address is managed under Account & security."
        footer={
          <>
            {isDirty && (
              <Button type="button" variant="ghost" onClick={() => reset()} disabled={updateProfile.isPending}>
                Discard changes
              </Button>
            )}
            <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving…' : 'Save profile'}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
          >
            {getInitials(profile.full_name, user?.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-heading">{profile.full_name || 'No name set'}</p>
            <p className="truncate text-supporting text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:max-w-md">
          <FormField
            id="profile-full-name"
            label="Full name"
            isRequired
            autoComplete="name"
            errorMessage={errors.fullName?.message}
            {...register('fullName')}
          />
        </div>

        {updateProfile.error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
            {updateProfile.error.message}
          </p>
        )}
      </SettingsSection>
    </form>
  )
}

export function ProfileSettings() {
  const { user } = useAuth()
  const { data: profile, isLoading, error, refetch } = useProfile()

  if (isLoading) return <LoadingState label="Loading your profile…" />
  if (error || !profile) return <ErrorState message={error?.message ?? 'Profile not found.'} onRetry={() => refetch()} />

  return (
    <div className="flex flex-col gap-4">
      {/* Remount when the saved profile changes so the form starts from the stored values. */}
      <ProfileForm key={profile.updated_at} profile={profile} />

      <SettingsSection title="Account details">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="text-supporting text-muted-foreground">Email</dt>
            <dd className="text-body break-all">{user?.email ?? '—'}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-supporting text-muted-foreground">Member since</dt>
            <dd className="text-body">{formatDate(user?.created_at)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-supporting text-muted-foreground">Last signed in</dt>
            <dd className="text-body">{formatDateTime(user?.last_sign_in_at)}</dd>
          </div>
        </dl>
      </SettingsSection>
    </div>
  )
}
