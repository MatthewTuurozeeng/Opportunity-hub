import { useCallback, useEffect, useRef } from 'react'
import { useBlocker } from 'react-router'

/**
 * Warns before leaving a form with unsaved changes:
 * - in-app navigation is paused so a confirmation dialog can be shown (returned blocker);
 * - closing or reloading the tab triggers the browser's own prompt.
 *
 * Call `allowNavigation()` right before navigating away after a successful save.
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges)
  const isNavigationAllowedRef = useRef(false)

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges
  }, [hasUnsavedChanges])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChangesRef.current &&
      !isNavigationAllowedRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!hasUnsavedChanges) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const allowNavigation = useCallback(() => {
    isNavigationAllowedRef.current = true
  }, [])

  return { blocker, allowNavigation }
}
