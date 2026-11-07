import { LogOut } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { useAuth } from '../hooks/useAuth'
import { signOut } from '../services/auth.service'

export function SignOutButton() {
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSignOut() {
    setIsSigningOut(true)
    setErrorMessage(null)

    try {
      // ProtectedRoute redirects to the login page once the session is cleared.
      await signOut()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign out.')
      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-sidebar-border pt-4">
      {user?.email && (
        <p className="truncate px-3 text-supporting text-muted-foreground" title={user.email}>
          {user.email}
        </p>
      )}
      <Button
        variant="ghost"
        className="justify-start gap-3 px-3 text-muted-foreground"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        <LogOut aria-hidden="true" />
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </Button>
      {errorMessage && (
        <p role="alert" className="px-3 text-supporting text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
