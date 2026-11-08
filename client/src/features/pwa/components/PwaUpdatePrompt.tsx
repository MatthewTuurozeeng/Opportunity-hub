import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'

const UPDATE_TOAST_ID = 'pwa-update'
/** How often an open app checks for a new version. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

/**
 * Registers the service worker and offers new versions with a "Reload" action
 * instead of reloading on its own, so unsaved work is never lost.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setInterval(() => {
        if (navigator.onLine) void registration.update()
      }, UPDATE_CHECK_INTERVAL_MS)
    },
  })

  useEffect(() => {
    if (!needRefresh) return

    toast('A new version of OpportunityHub is available.', {
      id: UPDATE_TOAST_ID,
      description: 'Save any open work, then reload to update.',
      duration: Number.POSITIVE_INFINITY,
      action: { label: 'Reload', onClick: () => void updateServiceWorker(true) },
      cancel: { label: 'Later', onClick: () => setNeedRefresh(false) },
    })
  }, [needRefresh, setNeedRefresh, updateServiceWorker])

  return null
}
