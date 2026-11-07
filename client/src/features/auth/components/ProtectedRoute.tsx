import { Navigate, Outlet, useLocation } from 'react-router'

import { LoadingState } from '@/components/shared/LoadingState'
import { ROUTE_PATHS } from '@/routes/routePaths'

import { useAuth } from '../hooks/useAuth'

export interface RedirectLocationState {
  from?: string
}

/** Renders child routes only for signed-in users; otherwise redirects to login. */
export function ProtectedRoute() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingState label="Checking your session…" className="min-h-svh" />
  }

  if (!session) {
    const redirectState: RedirectLocationState = { from: location.pathname + location.search }
    return <Navigate to={ROUTE_PATHS.LOGIN} replace state={redirectState} />
  }

  return <Outlet />
}
