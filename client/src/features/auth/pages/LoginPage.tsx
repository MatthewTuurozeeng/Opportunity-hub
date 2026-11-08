import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { FormField } from '@/components/shared/FormField'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/button'
import { ROUTE_PATHS } from '@/routes/routePaths'

import { AuthLayout } from '../components/AuthLayout'
import type { RedirectLocationState } from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import { type LoginFormValues, loginSchema } from '../schemas/loginSchema'
import { signInWithPassword } from '../services/auth.service'

/** Only allow redirects to paths inside this app (prevents open redirects). */
function getSafeRedirectPath(state: unknown): string {
  const from = (state as RedirectLocationState | null)?.from
  const isInternalPath = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
  return isInternalPath && from !== ROUTE_PATHS.LOGIN ? from : ROUTE_PATHS.DASHBOARD
}

export function LoginPage() {
  const { session, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const redirectPath = getSafeRedirectPath(location.state)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isLoading) {
    return <LoadingState className="min-h-svh" />
  }

  if (session) {
    return <Navigate to={redirectPath} replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null)

    try {
      await signInWithPassword(values)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  return (
    <AuthLayout
      title="Sign in to OpportunityHub"
      description="opportunities. applications. progress."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to={ROUTE_PATHS.SIGN_UP} className="font-medium text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          errorMessage={errors.email?.message}
          {...register('email')}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          errorMessage={errors.password?.message}
          {...register('password')}
        />

        {submitError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-body text-destructive">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
