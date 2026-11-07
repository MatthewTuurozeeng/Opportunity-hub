import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router'

import { FormField } from '@/components/shared/FormField'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'
import { ROUTE_PATHS } from '@/routes/routePaths'

import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { OWNER_ACCOUNT_EXISTS_QUERY_KEY, useOwnerAccountExists } from '../hooks/useOwnerAccountExists'
import { PASSWORD_MIN_LENGTH, type SignUpFormValues, signUpSchema } from '../schemas/signUpSchema'
import { signUp } from '../services/auth.service'

const SIGN_IN_LINK_CLASS_NAME = 'font-medium text-primary underline-offset-4 hover:underline'

export function SignUpPage() {
  const { session, isLoading: isSessionLoading } = useAuth()
  const { data: ownerAccountExists, isLoading: isOwnerCheckLoading } = useOwnerAccountExists()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  if (isSessionLoading || isOwnerCheckLoading) {
    return <LoadingState className="min-h-svh" />
  }

  if (session) {
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />
  }

  if (confirmationEmail) {
    return (
      <AuthLayout
        title="Check your email"
        description="Your account has been created."
        footer={
          <Link to={ROUTE_PATHS.LOGIN} className={SIGN_IN_LINK_CLASS_NAME}>
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck className="size-8 text-primary" aria-hidden="true" />
          <p className="text-body">
            We sent a confirmation link to <span className="font-medium">{confirmationEmail}</span>. Open it to
            activate your account, then sign in.
          </p>
        </div>
      </AuthLayout>
    )
  }

  // OpportunityHub has a single owner; once that account exists, sign-up is closed.
  if (ownerAccountExists) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />
  }

  async function onSubmit(values: SignUpFormValues) {
    setSubmitError(null)

    try {
      const { isSignedIn } = await signUp(values)
      await queryClient.invalidateQueries({ queryKey: OWNER_ACCOUNT_EXISTS_QUERY_KEY })

      // When signed in immediately, the session redirect above takes over.
      if (!isSignedIn) {
        setConfirmationEmail(values.email)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create your account.')
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Set up the owner account for your OpportunityHub."
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTE_PATHS.LOGIN} className={SIGN_IN_LINK_CLASS_NAME}>
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          id="fullName"
          label="Full name"
          autoComplete="name"
          autoFocus
          errorMessage={errors.fullName?.message}
          {...register('fullName')}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          errorMessage={errors.email?.message}
          {...register('email')}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters, with uppercase, lowercase and a number.`}
          errorMessage={errors.password?.message}
          {...register('password')}
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          errorMessage={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {submitError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
