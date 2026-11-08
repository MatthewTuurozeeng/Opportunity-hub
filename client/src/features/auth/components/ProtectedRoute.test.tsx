// @vitest-environment jsdom
import type { Session } from '@supabase/supabase-js'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'

import { AuthContext, type AuthContextValue } from '../context/authContext'
import { ProtectedRoute, type RedirectLocationState } from './ProtectedRoute'

function LoginProbe() {
  const location = useLocation()
  const state = location.state as RedirectLocationState | null
  return <p>Login page (return to {state?.from ?? 'nowhere'})</p>
}

function renderAt(route: string, auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/applications" element={<p>Private applications</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects signed-out visitors to login and remembers where they were going', () => {
    renderAt('/applications?status=draft', { session: null, user: null, isLoading: false })

    expect(screen.getByText('Login page (return to /applications?status=draft)')).toBeInTheDocument()
    expect(screen.queryByText('Private applications')).not.toBeInTheDocument()
  })

  it('shows a loading state while the session is being restored', () => {
    renderAt('/applications', { session: null, user: null, isLoading: true })

    expect(screen.getByRole('status')).toHaveTextContent('Checking your session')
    expect(screen.queryByText('Private applications')).not.toBeInTheDocument()
  })

  it('renders the page for signed-in users', () => {
    const session = { user: { id: 'user-1' } } as Session
    renderAt('/applications', { session, user: session.user, isLoading: false })

    expect(screen.getByText('Private applications')).toBeInTheDocument()
  })
})
